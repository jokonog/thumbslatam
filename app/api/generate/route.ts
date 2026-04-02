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
  const fondo = await sharp(fondoBuf).resize(W, H, { fit: "cover" }).png().toBuffer();

  const elementosConImagen = elementos.filter((el: any) => el.imagen && el.imagen.startsWith("http"));
  const total = elementosConImagen.length;

  // Posiciones dinamicas segun cantidad de elementos
  let leftMap: number[];
  let elW: number;
  let elH: number;

  if (total === 1) {
    // 1 elemento: ocupa el lado izquierdo grande
    leftMap = [Math.floor(W * 0.03)];
    elW = Math.floor(W * 0.55);
    elH = Math.floor(H * 0.95);
  } else if (total === 2) {
    // 2 elementos: izquierda y derecha, bien separados
    leftMap = [Math.floor(W * 0.01), Math.floor(W * 0.52)];
    elW = Math.floor(W * 0.55);
    elH = Math.floor(H * 0.95);
  } else {
    // 3 elementos
    leftMap = [Math.floor(W * 0.01), Math.floor(W * 0.36), Math.floor(W * 0.67)];
    elW = Math.floor(W * 0.36);
    elH = Math.floor(H * 0.95);
  }
  const top = Math.floor(H * 0.05);

  const composites: sharp.OverlayOptions[] = [];
  let idxPos = 0;

  for (let i = 0; i < elementos.length; i++) {
    const el = elementos[i];
    if (!el.imagen || !el.imagen.startsWith("http")) continue;
    try {
      const buf = await descargarBuffer(el.imagen);
      const meta = await sharp(buf).metadata();

      // contain siempre para no recortar caras
      const resized = await sharp(buf)
        .resize(elW, elH, {
          fit: "contain",
          position: "bottom",
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .ensureAlpha()
        .png()
        .toBuffer();

      composites.push({ input: resized, left: leftMap[idxPos], top, blend: "over" });
      idxPos++;
    } catch(e) { console.log("Error elemento", i, e); }
  }

  if (composites.length === 0) {
    const final = await cloudinary.uploader.upload(fondoUrl, { folder: "thumbslatam/fondos" });
    return final.secure_url;
  }

  // Sharp compone elementos sobre fondo
  const composed = await sharp(fondo).composite(composites).jpeg({ quality: 92 }).toBuffer();
  const base64 = `data:image/jpeg;base64,${composed.toString("base64")}`;
  const uploadedComp = await cloudinary.uploader.upload(base64, { folder: "thumbslatam-temp" });

  // Kontext integra iluminacion — SIN texto, SIN titulo en el prompt
  const promptKontext = `Seamlessly integrate the characters into this scene: ${descripcion}. Apply cinematic lighting, color grading and shadows that match the background atmosphere. Each character must appear exactly ONCE — do not clone or duplicate. Blend them naturally so they feel part of the world. You may stylize lighting and color on the characters to match the scene, but preserve the face identity and outfit. Remove any rectangular cutout borders. Output NO text, NO letters, NO symbols anywhere in the image.`;

  const refinado: any = await replicate.run("black-forest-labs/flux-kontext-max", {
    input: { prompt: promptKontext, input_image: uploadedComp.secure_url, aspect_ratio: aspectRatio }
  });

  const refinadoUrl = String(refinado);
  if (!refinadoUrl.startsWith("http")) throw new Error("Kontext no genero imagen");

  // Sharp agrega titulo AQUI — despues de Kontext, nunca antes
  // Primero limpiar franja superior donde Kontext suele poner caracteres
  const conTitulo = tituloModo === "manual" && titulo && titulo.trim();
  const bufKontext = await descargarBuffer(refinadoUrl);
  const baseKontext = await sharp(bufKontext).resize(W, H, { fit: "cover" }).png().toBuffer();
  // Cubrir franja superior con recorte del fondo original para borrar caracteres de Kontext
  const franjaH = Math.floor(H * 0.22);
  const fondoFranja = await sharp(fondoBuf).resize(W, H, { fit: "cover" }).extract({ left: 0, top: 0, width: W, height: franjaH }).png().toBuffer();
  const sinCaracteres = await sharp(baseKontext).composite([{ input: fondoFranja, top: 0, left: 0, blend: "over" }]).png().toBuffer();
  if (conTitulo) {
    const resized = sinCaracteres;
    const conTit = await agregarTitulo(resized, titulo, W, H);
    const upload = await cloudinary.uploader.upload(
      `data:image/jpeg;base64,${conTit.toString("base64")}`,
      { folder: "thumbslatam/fondos" }
    );
    return upload.secure_url;
  }

  const finalBuf2 = await sharp(sinCaracteres).jpeg({ quality: 93 }).toBuffer();
  const final = await cloudinary.uploader.upload(`data:image/jpeg;base64,${finalBuf2.toString("base64")}`, { folder: "thumbslatam/fondos" });
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

    // Prompt fondo SIEMPRE sin titulo — Sharp lo agrega al final
    const promptFondo = `Epic dramatic YouTube thumbnail background, ${descripcion}${elementosDesc ? `, ${elementosDesc}` : ""}, ${emocionEN} mood, cinematic dramatic lighting, ultra detailed, no text no words no letters no logos, background only no characters no people`;
    const promptFondo2 = `Cinematic YouTube thumbnail background, ${descripcion}${elementosDesc ? `, ${elementosDesc}` : ""}, ${emocionEN} atmosphere, dramatic shadows, no text no words no letters, background only no characters no people`;

    if (tieneImagenes) {
      const [fondo1, fondo2] = await Promise.all([
        generarFondo(promptFondo, aspectRatio),
        generarFondo(promptFondo2, aspectRatio),
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
