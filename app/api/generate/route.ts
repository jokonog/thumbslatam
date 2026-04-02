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

async function agregarTitulo(buf: Buffer, titulo: string, W: number, H: number): Promise<Buffer> {
  const texto = titulo.toUpperCase().trim();
  const fontSize = Math.min(
    Math.floor(W * 0.09),
    Math.floor((W * 0.88) / (texto.length * 0.55))
  );
  const boxH = Math.floor(H * 0.22);

  const gradiente = `<svg width="${W}" height="${boxH}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="black" stop-opacity="0.80"/>
        <stop offset="100%" stop-color="black" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${boxH}" fill="url(#g)"/>
  </svg>`;

  const textoSvg = `<svg width="${W}" height="${boxH}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="s">
        <feDropShadow dx="0" dy="3" stdDeviation="6" flood-color="black" flood-opacity="1"/>
      </filter>
    </defs>
    <text
      x="${W / 2}" y="${Math.floor(boxH * 0.60)}"
      text-anchor="middle"
      font-family="Arial Black, Arial, Impact, sans-serif"
      font-weight="900"
      font-size="${fontSize}"
      fill="white"
      filter="url(#s)"
      letter-spacing="4"
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
  descripcion: string,
  titulo: string,
  tituloModo: string
): Promise<string> {
  const esVertical = aspectRatio === "9:16";
  const W = esVertical ? 720 : 1280;
  const H = esVertical ? 1280 : 720;

  const fondoBuf = await descargarBuffer(fondoUrl);
  const fondo = await sharp(fondoBuf).resize(W, H, { fit: "cover" }).jpeg().toBuffer();

  const composites: sharp.OverlayOptions[] = [];
  const leftMap = [Math.floor(W * 0.08), Math.floor(W * 0.36), Math.floor(W * 0.62)];
  const elW = Math.floor(W * 0.27);
  const elH = Math.floor(H * 0.75);
  const top = Math.floor(H * 0.12);

  for (let i = 0; i < elementos.length; i++) {
    const el = elementos[i];
    if (!el.imagen || !el.imagen.startsWith("http")) continue;
    try {
      const buf = await descargarBuffer(el.imagen);
      const resized = await sharp(buf)
        .resize(elW, elH, { fit: "cover", position: "center" })
        .png()
        .toBuffer();
      const withAlpha = await sharp(resized).ensureAlpha().blur(0.5).png().toBuffer();
      composites.push({ input: withAlpha, left: leftMap[i], top, blend: "over" });
    } catch(e) { console.log("Error elemento", i); }
  }

  let imagenFinal: string;

  if (composites.length > 0) {
    const composed = await sharp(fondo).composite(composites).jpeg({ quality: 90 }).toBuffer();
    const base64 = `data:image/jpeg;base64,${composed.toString("base64")}`;
    const uploadedComp = await cloudinary.uploader.upload(base64, { folder: "thumbslatam-temp" });

    const slotsOcupados = elementos.map((el: any, i: number) => {
      const pos = i === 0 ? "LEFT" : i === 1 ? "CENTER" : "RIGHT";
      if (el.imagen) return `${pos} slot has a character/element`;
      return `${pos} slot is EMPTY do not add anything there`;
    }).join(". ");

    // CRITICO: prompt sin ninguna mencion de texto o titulo
    const promptKontext = `Seamlessly blend the characters into the background scene: ${descripcion}. ${slotsOcupados}. Keep ALL characters EXACTLY as they appear — same face, same outfit, do not modify them. Match cinematic lighting, shadows and color grading. Remove rectangular borders around characters. Do NOT add text, words, letters or symbols anywhere. Do NOT invent new characters in empty spaces.`;

    const refinado: any = await replicate.run("black-forest-labs/flux-kontext-max", {
      input: { prompt: promptKontext, input_image: uploadedComp.secure_url, aspect_ratio: aspectRatio }
    });
    imagenFinal = String(refinado);
    if (!imagenFinal.startsWith("http")) throw new Error("Kontext no genero imagen");
  } else {
    imagenFinal = fondoUrl;
  }

  // Sharp agrega el titulo AQUI — Kontext nunca lo vio
  const conTitulo = tituloModo === "manual" && titulo && titulo.trim();
  if (conTitulo) {
    const buf = await descargarBuffer(imagenFinal);
    const resized = await sharp(buf).resize(W, H, { fit: "cover" }).png().toBuffer();
    const conTit = await agregarTitulo(resized, titulo, W, H);
    const upload = await cloudinary.uploader.upload(
      `data:image/jpeg;base64,${conTit.toString("base64")}`,
      { folder: "thumbslatam/fondos" }
    );
    return upload.secure_url;
  }

  const final = await cloudinary.uploader.upload(imagenFinal, { folder: "thumbslatam/fondos" });
  return final.secure_url;
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
      if (el.imagen && el.descripcion) return `${el.descripcion} on the ${pos}`;
      return null;
    }).filter(Boolean).join(", ") : "";

    // Prompt del fondo SIEMPRE sin titulo — Sharp lo agrega al final
    const promptFondo = `Epic dramatic YouTube thumbnail background, ${descripcion}${elementosDesc ? `, ${elementosDesc}` : ""}, ${emocionEN} mood, cinematic dramatic lighting, ultra detailed, no text no words no letters no logos`;
    const promptFondo2 = `Cinematic YouTube thumbnail background, ${descripcion}${elementosDesc ? `, ${elementosDesc}` : ""}, ${emocionEN} atmosphere, dramatic shadows, no text no words no letters`;

    if (tieneImagenes) {
      const [fondo1, fondo2] = await Promise.all([
        generarFondo(promptFondo + ", background only, no characters no people", aspectRatio),
        generarFondo(promptFondo2 + ", background only, no characters no people", aspectRatio),
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
      const conTit = await agregarTitulo(resized, titulo, W, H);
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
