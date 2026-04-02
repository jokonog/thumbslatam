import { NextResponse } from "next/server";
export const maxDuration = 60;
import Replicate from "replicate";
import { v2 as cloudinary } from "cloudinary";
import sharp from "sharp";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

async function descargarBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Error descargando: " + res.status);
  return Buffer.from(await res.arrayBuffer());
}

async function generarFondo(prompt: string, aspectRatio: string): Promise<string> {
  const output: any = await replicate.run("black-forest-labs/flux-1.1-pro", {
    input: { prompt, aspect_ratio: aspectRatio, output_format: "jpg", output_quality: 95, safety_tolerance: 5 }
  });
  const url = String(output);
  if (!url.startsWith("http")) throw new Error("FLUX no genero imagen");
  return url;
}

async function agregarTituloSharp(buf: Buffer, titulo: string, W: number, H: number): Promise<Buffer> {
  const texto = titulo.toUpperCase().trim();
  const maxChars = texto.length;
  const fontSize = Math.min(
    Math.floor(W * 0.08),
    Math.floor((W * 0.90) / (maxChars * 0.55))
  );
  const boxH = Math.floor(H * 0.20);

  const gradiente = `
    <svg width="${W}" height="${boxH}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="black" stop-opacity="0.75"/>
          <stop offset="100%" stop-color="black" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <rect width="${W}" height="${boxH}" fill="url(#grad)"/>
    </svg>`;

  const textoSvg = `
    <svg width="${W}" height="${boxH}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="s">
          <feDropShadow dx="2" dy="2" stdDeviation="5" flood-color="black" flood-opacity="1"/>
        </filter>
      </defs>
      <text
        x="${W / 2}" y="${Math.floor(boxH * 0.62)}"
        text-anchor="middle"
        font-family="Arial Black, Arial, Impact, sans-serif"
        font-weight="900"
        font-size="${fontSize}"
        fill="white"
        filter="url(#s)"
        letter-spacing="3"
      >${texto.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}</text>
    </svg>`;

  return sharp(buf)
    .composite([
      { input: Buffer.from(gradiente), top: 0, left: 0, blend: "over" },
      { input: Buffer.from(textoSvg), top: 0, left: 0, blend: "over" },
    ])
    .jpeg({ quality: 93 })
    .toBuffer();
}

async function componerYRefinar(
  fondoUrl: string,
  elementos: any[],
  aspectRatio: string,
  descripcionFondo: string,
  titulo: string,
  tituloModo: string
): Promise<string> {
  const esVertical = aspectRatio === "9:16";
  const W = esVertical ? 720 : 1280;
  const H = esVertical ? 1280 : 720;

  const fondoBuf = await descargarBuffer(fondoUrl);
  const fondo = await sharp(fondoBuf).resize(W, H, { fit: "cover" }).jpeg({ quality: 95 }).toBuffer();

  const composites: sharp.OverlayOptions[] = [];
  const leftMap = [Math.floor(W * 0.02), Math.floor(W * 0.35), Math.floor(W * 0.66)];
  const elW = Math.floor(W * 0.31);
  const elH = Math.floor(H * 0.82);
  const top = Math.floor(H * 0.12);

  for (let i = 0; i < elementos.length; i++) {
    const el = elementos[i];
    if (!el.imagen || !el.imagen.startsWith("http")) continue;
    try {
      const buf = await descargarBuffer(el.imagen);
      const meta = await sharp(buf).metadata();
      const resized = await sharp(buf)
        .resize(elW, elH, {
          fit: meta.hasAlpha ? "contain" : "cover",
          position: "center",
          background: meta.hasAlpha ? { r: 0, g: 0, b: 0, alpha: 0 } : undefined,
        })
        .ensureAlpha()
        .png()
        .toBuffer();
      composites.push({ input: resized, left: leftMap[i], top, blend: "over" });
    } catch(e) { console.log("Error elemento", i, e); }
  }

  if (composites.length === 0) {
    const final = await cloudinary.uploader.upload(fondoUrl, { folder: "thumbslatam/fondos" });
    return final.secure_url;
  }

  // Sharp compone los elementos sobre el fondo
  const composed = await sharp(fondo).composite(composites).jpeg({ quality: 92 }).toBuffer();
  const base64comp = `data:image/jpeg;base64,${composed.toString("base64")}`;
  const uploadedComp = await cloudinary.uploader.upload(base64comp, { folder: "thumbslatam-temp" });

  // Kontext integra iluminacion — SIN mencionar texto en el prompt
  const slotsDesc = elementos.map((el: any, i: number) => {
    const pos = i === 0 ? "LEFT" : i === 1 ? "CENTER" : "RIGHT";
    if (el.imagen) return `${pos}: character/element present`;
    return `${pos}: EMPTY, do not add anything`;
  }).join(". ");

  const promptKontext = `Seamlessly blend the characters/elements into the background. Match cinematic lighting, shadows and color grading to the scene: ${descripcionFondo}. ${slotsDesc}. Keep faces and outfits EXACTLY as in the reference image. Remove rectangular borders. Do NOT add text, words, letters or symbols of any kind. Do NOT invent new elements in empty spaces.`;

  const refinado: any = await replicate.run("black-forest-labs/flux-kontext-max", {
    input: { prompt: promptKontext, input_image: uploadedComp.secure_url, aspect_ratio: aspectRatio }
  });

  const refinadoUrl = String(refinado);
  if (!refinadoUrl.startsWith("http")) throw new Error("Kontext no genero imagen");

  // Sharp agrega el titulo DESPUES de Kontext — nunca lo ve Kontext
  let finalBuf = await descargarBuffer(refinadoUrl);
  let resizedFinal = await sharp(finalBuf).resize(W, H, { fit: "cover" }).png().toBuffer();

  const conTitulo = tituloModo === "manual" && titulo && titulo.trim();
  if (conTitulo) {
    resizedFinal = await agregarTituloSharp(resizedFinal, titulo, W, H);
  } else {
    resizedFinal = await sharp(resizedFinal).jpeg({ quality: 93 }).toBuffer();
  }

  const upload = await cloudinary.uploader.upload(
    `data:image/jpeg;base64,${resizedFinal.toString("base64")}`,
    { folder: "thumbslatam/fondos" }
  );
  return upload.secure_url;
}

export async function POST(request: Request) {
  try {
    const { descripcion, emocion, orientacion, elementos, titulo, tituloModo } = await request.json();

    const emocionMap: Record<string, string> = {
      epico: "epic, powerful, intense",
      emocionado: "excited, energetic, enthusiastic",
      sorprendido: "surprised, shocked, amazed",
      gracioso: "funny, playful, humorous",
      misterioso: "mysterious, dark, enigmatic",
      serio: "serious, focused, determined",
    };
    const emocionEN = emocionMap[emocion] || emocion;
    const esVertical = orientacion?.includes("vertical");
    const aspectRatio = esVertical ? "9:16" : "16:9";
    const W = esVertical ? 720 : 1280;
    const H = esVertical ? 1280 : 720;

    const tieneImagenes = elementos && elementos.some((el: any) => el.imagen && el.imagen.startsWith("http"));

    const elementosDesc = elementos ? elementos.map((el: any, i: number) => {
      const pos = i === 0 ? "left" : i === 1 ? "center" : "right";
      if (el.descripcion && !el.imagen) return `${el.descripcion} on the ${pos}`;
      return null;
    }).filter(Boolean).join(", ") : "";

    // Prompt del fondo — nunca incluye titulo, Kontext nunca lo ve
    const promptFondo = `Epic dramatic YouTube thumbnail background, ${descripcion}${elementosDesc ? `, ${elementosDesc}` : ""}, ${emocionEN} mood, cinematic dramatic lighting, ultra detailed, no text no words no letters no logos, background scene only`;
    const promptFondo2 = `Cinematic YouTube thumbnail background, ${descripcion}${elementosDesc ? `, ${elementosDesc}` : ""}, ${emocionEN} atmosphere, dramatic shadows, no text no words no letters, background scene only`;

    if (tieneImagenes) {
      const [fondo1, fondo2] = await Promise.all([
        generarFondo(promptFondo + ", no characters no people", aspectRatio),
        generarFondo(promptFondo2 + ", no characters no people", aspectRatio),
      ]);
      const [imageUrl1, imageUrl2] = await Promise.all([
        componerYRefinar(fondo1, elementos, aspectRatio, descripcion, titulo, tituloModo),
        componerYRefinar(fondo2, elementos, aspectRatio, descripcion, titulo, tituloModo),
      ]);
      return NextResponse.json({ imageUrl: imageUrl1, variaciones: [imageUrl1, imageUrl2] });
    }

    // Sin imagenes — FLUX directo, titulo con Sharp al final
    const [url1, url2] = await Promise.all([
      generarFondo(promptFondo, aspectRatio),
      generarFondo(promptFondo2, aspectRatio),
    ]);

    const conTitulo = tituloModo === "manual" && titulo && titulo.trim();

    async function subirFondo(url: string): Promise<string> {
      if (!conTitulo) {
        const u = await cloudinary.uploader.upload(url, { folder: "thumbslatam/fondos" });
        return u.secure_url;
      }
      const buf = await descargarBuffer(url);
      const resized = await sharp(buf).resize(W, H, { fit: "cover" }).png().toBuffer();
      const conTit = await agregarTituloSharp(resized, titulo, W, H);
      const u = await cloudinary.uploader.upload(
        `data:image/jpeg;base64,${conTit.toString("base64")}`,
        { folder: "thumbslatam/fondos" }
      );
      return u.secure_url;
    }

    const [imageUrl1, imageUrl2] = await Promise.all([subirFondo(url1), subirFondo(url2)]);
    return NextResponse.json({ imageUrl: imageUrl1, variaciones: [imageUrl1, imageUrl2] });

  } catch (error: any) {
    console.error("ERROR generate:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
