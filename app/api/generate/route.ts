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

async function agregarTituloSVG(imagenUrl: string, tituloTexto: string, aspectRatio: string): Promise<string> {
  const esVert = aspectRatio === "9:16";
  const W = esVert ? 720 : 1280;
  const H = esVert ? 1280 : 720;
  const imgBuf = await descargarBuffer(imagenUrl);
  const base = await sharp(imgBuf).resize(W, H, { fit: "cover" }).png().toBuffer();
  const fontSize = Math.floor(W * 0.082);
  const padH = Math.floor(fontSize * 1.9);
  const texto = tituloTexto.toUpperCase()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
  const svg = `<svg width="${W}" height="${padH}" xmlns="http://www.w3.org/2000/svg">
    <defs><filter id="s"><feDropShadow dx="3" dy="3" stdDeviation="5" flood-color="#000" flood-opacity="0.9"/></filter></defs>
    <rect width="${W}" height="${padH}" fill="rgba(0,0,0,0.5)"/>
    <text x="${W/2}" y="${Math.floor(padH*0.73)}" font-family="Impact,Arial Black,sans-serif" font-size="${fontSize}" font-weight="bold" fill="white" text-anchor="middle" filter="url(#s)">${texto}</text>
  </svg>`;
  const result = await sharp(base).composite([{ input: Buffer.from(svg), top: 0, left: 0 }]).jpeg({ quality: 95 }).toBuffer();
  const uploaded = await cloudinary.uploader.upload(`data:image/jpeg;base64,${result.toString("base64")}`, { folder: "thumbslatam/fondos" });
  return uploaded.secure_url;
}

async function generarYComponerConKontext(prompt: string, elementos: any[], aspectRatio: string): Promise<string> {
  const esVert = aspectRatio === "9:16";
  const W = esVert ? 720 : 1280;
  const H = esVert ? 1280 : 720;

  // Paso 1: FLUX genera el fondo
  const fondoOutput: any = await replicate.run("black-forest-labs/flux-1.1-pro", {
    input: { prompt: `${prompt}, background scene only, no characters, NO TEXT`, aspect_ratio: aspectRatio, output_format: "jpg", output_quality: 95, safety_tolerance: 5 }
  });
  const fondoUrl = String(fondoOutput);
  if (!fondoUrl.startsWith("http")) throw new Error("FLUX error");

  // Verificar si hay imagenes
  const elementosConImg = elementos.filter((el: any) => el.imagen && el.imagen.startsWith("http"));
  if (elementosConImg.length === 0) {
    const uploaded = await cloudinary.uploader.upload(fondoUrl, { folder: "thumbslatam/fondos" });
    return uploaded.secure_url;
  }

  // Paso 2: Sharp compone elementos sobre el fondo
  const fondoBuf = await descargarBuffer(fondoUrl);
  const fondo = await sharp(fondoBuf).resize(W, H, { fit: "cover" }).png().toBuffer();
  const leftMap = [Math.floor(W * 0.02), Math.floor(W * 0.35), Math.floor(W * 0.65)];
  const elW = Math.floor(W * 0.32);
  const elH = Math.floor(H * 0.78);
  const top = Math.floor(H * 0.10);
  const composites: sharp.OverlayOptions[] = [];

  for (let i = 0; i < elementos.length; i++) {
    const el = elementos[i];
    if (!el.imagen || !el.imagen.startsWith("http")) continue;
    try {
      const buf = await descargarBuffer(el.imagen);
      const resized = await sharp(buf).resize(elW, elH, { fit: "cover", position: "top" }).png().toBuffer();
      composites.push({ input: resized, left: leftMap[i], top, blend: "over" });
    } catch(e) { console.log("Error elemento", i); }
  }

  const composed = await sharp(fondo).composite(composites).jpeg({ quality: 90 }).toBuffer();
  const compUpload = await cloudinary.uploader.upload(`data:image/jpeg;base64,${composed.toString("base64")}`, { folder: "thumbslatam-temp" });

  // Paso 3: Kontext integra todo cinematograficamente
  const slotsDesc = elementos.map((el: any, i: number) => {
    const pos = i === 0 ? "LEFT" : i === 1 ? "CENTER" : "RIGHT";
    if (el.imagen) return `${pos}: keep character exactly as shown`;
    if (el.descripcion) return `${pos}: ${el.descripcion}`;
    return `${pos}: empty, do not add anything`;
  }).join(". ");

  const kontextOutput: any = await replicate.run("black-forest-labs/flux-kontext-max", {
    input: {
      prompt: `Cinematic scene: ${prompt}. ${slotsDesc}. Blend all elements naturally into the background with matching lighting and color grading. No rectangular cutouts. Clean professional composition. NO TEXT.`,
      input_image: compUpload.secure_url,
      aspect_ratio: aspectRatio,
    }
  });

  const finalUrl = String(kontextOutput);
  if (!finalUrl.startsWith("http")) throw new Error("Kontext error");
  return finalUrl;
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

    const elementosDesc = elementos ? elementos.map((el: any, i: number) => {
      const pos = i === 0 ? "left" : i === 1 ? "center" : "right";
      if (el.descripcion) return `${el.descripcion} on the ${pos}`;
      return null;
    }).filter(Boolean).join(", ") : "";

    const prompt1 = `Epic dramatic YouTube thumbnail, ${descripcion}${elementosDesc ? `, ${elementosDesc}` : ""}, ${emocionEN} mood, vibrant colors, dramatic cinematic lighting`;
    const prompt2 = `Cinematic YouTube thumbnail, ${descripcion}${elementosDesc ? `, ${elementosDesc}` : ""}, ${emocionEN} atmosphere, high contrast, vivid colors`;

    const [url1, url2] = await Promise.all([
      generarYComponerConKontext(prompt1, elementos || [], aspectRatio),
      generarYComponerConKontext(prompt2, elementos || [], aspectRatio),
    ]);

    const conTitulo = tituloModo === "manual" && titulo;
    let imageUrl1 = url1;
    let imageUrl2 = url2;

    if (conTitulo) {
      [imageUrl1, imageUrl2] = await Promise.all([
        agregarTituloSVG(url1, titulo, aspectRatio),
        agregarTituloSVG(url2, titulo, aspectRatio),
      ]);
    } else {
      const [u1, u2] = await Promise.all([
        cloudinary.uploader.upload(url1, { folder: "thumbslatam/fondos" }),
        cloudinary.uploader.upload(url2, { folder: "thumbslatam/fondos" }),
      ]);
      imageUrl1 = u1.secure_url;
      imageUrl2 = u2.secure_url;
    }

    return NextResponse.json({ imageUrl: imageUrl1, variaciones: [imageUrl1, imageUrl2] });

  } catch (error: any) {
    console.error("ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
