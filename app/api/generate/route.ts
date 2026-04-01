import { NextResponse } from "next/server";
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

async function componerYRefinar(fondoUrl: string, elementos: any[], aspectRatio: string, promptRefinado: string): Promise<string> {
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
      const resized = await sharp(buf).resize(elW, elH, { fit: "cover", position: "center" }).jpeg().toBuffer();
      composites.push({ input: resized, left: leftMap[i], top });
    } catch(e) { console.log("Error elemento", i); }
  }

  let imagenBase: string;

  if (composites.length > 0) {
    const composed = await sharp(fondo).composite(composites).jpeg({ quality: 90 }).toBuffer();
    const base64 = `data:image/jpeg;base64,${composed.toString("base64")}`;
    const uploadedComp = await cloudinary.uploader.upload(base64, { folder: "thumbslatam-temp" });
    
    // Kontext Max integra todo con iluminacion y contexto
    const refinado: any = await replicate.run("black-forest-labs/flux-kontext-max", {
      input: {
        prompt: `${promptRefinado}. CRITICAL: Keep all characters and elements EXACTLY as they appear — same face, same look, do not change them. Only add: matching cinematic lighting, shadows, color grading so everything blends naturally. If the prompt mentions a title or text, add it prominently at the top of the image with bold dramatic typography. Professional YouTube thumbnail result.`,
        input_image: uploadedComp.secure_url,
        aspect_ratio: aspectRatio,
      }
    });
    imagenBase = String(refinado);
  } else {
    imagenBase = fondoUrl;
  }

  if (!imagenBase.startsWith("http")) throw new Error("Error en refinado");
  const final = await cloudinary.uploader.upload(imagenBase, { folder: "thumbslatam/fondos" });
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

    const elementosDesc = elementos ? elementos.map((el: any, i: number) => {
      const pos = i === 0 ? "left" : i === 1 ? "center" : "right";
      if (el.descripcion && !el.imagen) return `${el.descripcion} on the ${pos}`;
      if (el.imagen && el.descripcion) return `${el.descripcion} on the ${pos}`;
      return null;
    }).filter(Boolean).join(", ") : "";

    const tituloDesc = tituloModo === "ia"
      ? "with space at top for epic bold title"
      : tituloModo === "manual" && titulo
      ? `with bold text "${titulo}" at the top`
      : "no text no words";

    const promptBase = `Epic dramatic YouTube thumbnail, ${descripcion}${elementosDesc ? `, ${elementosDesc}` : ""}, ${emocionEN} mood, cinematic dramatic lighting, ultra detailed, ${tituloDesc}, no logos`;

    const tieneImagenes = elementos && elementos.some((el: any) => el.imagen && el.imagen.startsWith("http"));

    if (tieneImagenes) {
      const [fondo1, fondo2] = await Promise.all([
        generarFondo(`${promptBase}, background only, no characters`, aspectRatio),
        generarFondo(`Cinematic version, ${promptBase}, background only, no characters`, aspectRatio),
      ]);
      const [imageUrl1, imageUrl2] = await Promise.all([
        componerYRefinar(fondo1, elementos, aspectRatio, promptBase),
        componerYRefinar(fondo2, elementos, aspectRatio, promptBase),
      ]);
      return NextResponse.json({ imageUrl: imageUrl1, variaciones: [imageUrl1, imageUrl2] });
    }

    // Sin imagenes — solo FLUX
    const [url1, url2] = await Promise.all([
      generarFondo(promptBase, aspectRatio),
      generarFondo(`Cinematic version, ${promptBase}`, aspectRatio),
    ]);
    const [imageUrl1, imageUrl2] = await Promise.all([
      cloudinary.uploader.upload(url1, { folder: "thumbslatam/fondos" }).then(r => r.secure_url),
      cloudinary.uploader.upload(url2, { folder: "thumbslatam/fondos" }).then(r => r.secure_url),
    ]);
    return NextResponse.json({ imageUrl: imageUrl1, variaciones: [imageUrl1, imageUrl2] });

  } catch (error: any) {
    console.error("ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
