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

async function agregarTituloSVG(imagenUrl: string, tituloTexto: string, aspectRatio: string): Promise<string> {
  const esVert = aspectRatio === "9:16";
  const W = esVert ? 720 : 1280;
  const H = esVert ? 1280 : 720;
  const imgBuf = await descargarBuffer(imagenUrl);
  const base = await sharp(imgBuf).resize(W, H, { fit: "cover" }).png().toBuffer();
  const fontSize = Math.floor(W * 0.082);
  const padH = Math.floor(fontSize * 1.9);
  const texto = tituloTexto.toUpperCase();
  const svg = `<svg width="${W}" height="${padH}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="s"><feDropShadow dx="3" dy="3" stdDeviation="5" flood-color="#000" flood-opacity="0.9"/></filter>
    </defs>
    <rect width="${W}" height="${padH}" fill="rgba(0,0,0,0.5)"/>
    <text x="${W/2}" y="${Math.floor(padH*0.73)}" font-family="Impact,Arial Black,sans-serif" font-size="${fontSize}" font-weight="bold" fill="white" text-anchor="middle" filter="url(#s)">${texto}</text>
  </svg>`;
  const result = await sharp(base).composite([{ input: Buffer.from(svg), top: 0, left: 0 }]).jpeg({ quality: 95 }).toBuffer();
  const uploaded = await cloudinary.uploader.upload(`data:image/jpeg;base64,${result.toString("base64")}`, { folder: "thumbslatam/fondos" });
  return uploaded.secure_url;
}

async function componerElementos(fondoUrl: string, elementos: any[], aspectRatio: string): Promise<string> {
  const esVert = aspectRatio === "9:16";
  const W = esVert ? 720 : 1280;
  const H = esVert ? 1280 : 720;
  const fondoBuf = await descargarBuffer(fondoUrl);
  const fondo = await sharp(fondoBuf).resize(W, H, { fit: "cover" }).png().toBuffer();
  const leftMap = [Math.floor(W * 0.04), Math.floor(W * 0.36), Math.floor(W * 0.63)];
  const elW = Math.floor(W * 0.30);
  const elH = Math.floor(H * 0.78);
  const top = Math.floor(H * 0.10);
  const composites: sharp.OverlayOptions[] = [];
  for (let i = 0; i < elementos.length; i++) {
    const el = elementos[i];
    if (!el.imagen || !el.imagen.startsWith("http")) continue;
    try {
      const buf = await descargarBuffer(el.imagen);
      const resized = await sharp(buf)
        .resize(elW, elH, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png().toBuffer();
      composites.push({ input: resized, left: leftMap[i], top, blend: "over" });
    } catch(e) { console.log("Error elemento", i); }
  }
  if (composites.length === 0) return fondoUrl;
  const composed = await sharp(fondo).composite(composites).jpeg({ quality: 90 }).toBuffer();
  const base64 = `data:image/jpeg;base64,${composed.toString("base64")}`;
  const uploaded = await cloudinary.uploader.upload(base64, { folder: "thumbslatam-temp" });
  return uploaded.secure_url;
}

async function refinarConKontext(imagenUrl: string, prompt: string, aspectRatio: string): Promise<string> {
  const output: any = await replicate.run("black-forest-labs/flux-kontext-max", {
    input: {
      prompt: `${prompt}. Seamlessly blend all characters into the background scene with matching cinematic lighting, shadows and color grading. Keep faces and characters exactly as they appear. No rectangular borders around characters. Professional YouTube thumbnail.`,
      input_image: imagenUrl,
      aspect_ratio: aspectRatio,
    }
  });
  const url = String(output);
  if (!url.startsWith("http")) throw new Error("Kontext error");
  return url;
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

    const promptFondo = `Cinematic YouTube thumbnail background, ${descripcion}${elementosDesc ? `, with space for ${elementosDesc}` : ""}, ${emocionEN} mood, dramatic lighting, ultra detailed, NO TEXT NO WORDS NO LETTERS, no characters, background only`;
    const promptFondo2 = `Epic YouTube thumbnail background, ${descripcion}${elementosDesc ? `, ${elementosDesc}` : ""}, ${emocionEN} atmosphere, high contrast vivid colors, NO TEXT NO WORDS NO LETTERS, no characters, background only`;

    const tieneImagenes = elementos && elementos.some((el: any) => el.imagen && el.imagen.startsWith("http"));
    const conTitulo = tituloModo === "manual";

    if (tieneImagenes) {
      // Paso 1: generar 2 fondos en paralelo
      const [fondo1, fondo2] = await Promise.all([
        generarFondo(promptFondo, aspectRatio),
        generarFondo(promptFondo2, aspectRatio),
      ]);

      // Paso 2: componer elementos encima de cada fondo
      const [comp1, comp2] = await Promise.all([
        componerElementos(fondo1, elementos, aspectRatio),
        componerElementos(fondo2, elementos, aspectRatio),
      ]);

      // Paso 3: Kontext integra todo cinematograficamente
      const promptKontext = `${descripcion}, ${emocionEN} mood, cinematic dramatic lighting, NO TEXT NO WORDS NO LETTERS`;
      const [refinado1, refinado2] = await Promise.all([
        refinarConKontext(comp1, promptKontext, aspectRatio),
        refinarConKontext(comp2, promptKontext, aspectRatio),
      ]);

      // Paso 4: agregar titulo con SVG si lo hay
      let imageUrl1 = refinado1;
      let imageUrl2 = refinado2;

      if (conTitulo && titulo) {
        [imageUrl1, imageUrl2] = await Promise.all([
          agregarTituloSVG(refinado1, titulo, aspectRatio),
          agregarTituloSVG(refinado2, titulo, aspectRatio),
        ]);
      } else {
        const [u1, u2] = await Promise.all([
          cloudinary.uploader.upload(refinado1, { folder: "thumbslatam/fondos" }),
          cloudinary.uploader.upload(refinado2, { folder: "thumbslatam/fondos" }),
        ]);
        imageUrl1 = u1.secure_url;
        imageUrl2 = u2.secure_url;
      }

      return NextResponse.json({ imageUrl: imageUrl1, variaciones: [imageUrl1, imageUrl2] });
    }

    // Sin imagenes — solo FLUX + titulo opcional
    const [url1, url2] = await Promise.all([
      generarFondo(promptFondo, aspectRatio),
      generarFondo(promptFondo2, aspectRatio),
    ]);

    let imageUrl1 = url1;
    let imageUrl2 = url2;

    if (conTitulo && titulo) {
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
