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

async function descargarImagen(url: string): Promise<Buffer> {
  const res = await fetch(url);
  return Buffer.from(await res.arrayBuffer());
}

async function componerElementos(elementos: any[], aspectRatio: string): Promise<string | null> {
  const imagenesConUrl = elementos.filter((el: any) => el.imagen && el.imagen.startsWith("http"));
  if (imagenesConUrl.length === 0) return null;

  // Canvas base 1280x720 (16:9) o 720x1280 (9:16)
  const esVertical = aspectRatio === "9:16";
  const W = esVertical ? 720 : 1280;
  const H = esVertical ? 1280 : 720;
  const slotW = Math.floor(W / 3);

  // Crear canvas negro base
  let canvas = sharp({
    create: { width: W, height: H, channels: 3, background: { r: 0, g: 0, b: 0 } }
  }).jpeg();

  // Componer cada imagen en su slot
  const composites: sharp.OverlayOptions[] = [];
  for (let i = 0; i < imagenesConUrl.length; i++) {
    const el = imagenesConUrl[i];
    const posIndex = elementos.indexOf(el);
    const left = posIndex * slotW;
    try {
      const buf = await descargarImagen(el.imagen);
      const resized = await sharp(buf)
        .resize(slotW, H, { fit: "cover", position: "center" })
        .jpeg()
        .toBuffer();
      composites.push({ input: resized, left, top: 0 });
    } catch (e) {
      console.log("Error descargando imagen elemento", i);
    }
  }

  if (composites.length === 0) return null;

  const baseBuf = await sharp({
    create: { width: W, height: H, channels: 3, background: { r: 10, g: 10, b: 20 } }
  }).jpeg().toBuffer();

  const composed = await sharp(baseBuf).composite(composites).jpeg({ quality: 90 }).toBuffer();
  const base64 = `data:image/jpeg;base64,${composed.toString("base64")}`;
  const uploaded = await cloudinary.uploader.upload(base64, { folder: "thumbslatam-elementos" });
  return uploaded.secure_url;
}

async function generarImagen(prompt: string, aspectRatio: string): Promise<string> {
  const output: any = await replicate.run(
    "black-forest-labs/flux-1.1-pro",
    {
      input: { prompt, aspect_ratio: aspectRatio, output_format: "jpg", output_quality: 95, safety_tolerance: 5 }
    }
  );
  const fluxUrl = String(output);
  if (!fluxUrl || !fluxUrl.startsWith("http")) throw new Error("FLUX no genero imagen");
  const uploaded = await cloudinary.uploader.upload(fluxUrl, { folder: "thumbslatam/fondos" });
  return uploaded.secure_url;
}

async function generarConKontext(prompt: string, imagenRef: string, aspectRatio: string): Promise<string> {
  const output: any = await replicate.run(
    "black-forest-labs/flux-kontext-max",
    { input: { prompt, input_image: imagenRef, aspect_ratio: aspectRatio } }
  );
  const url = String(output);
  if (!url || !url.startsWith("http")) throw new Error("Kontext no genero imagen");
  const uploaded = await cloudinary.uploader.upload(url, { folder: "thumbslatam/fondos" });
  return uploaded.secure_url;
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

    // Construir descripcion de elementos
    const posiciones = ["on the left side", "in the center", "on the right side"];
    const elementosDesc = elementos ? elementos.map((el: any, i: number) => {
      if (el.usarAvatar) return `the main person (avatar) ${posiciones[i]}`;
      if (el.imagen && el.descripcion) return `${el.descripcion} ${posiciones[i]}`;
      if (el.imagen) return `the uploaded element ${posiciones[i]}`;
      if (el.descripcion) return `${el.descripcion} ${posiciones[i]}`;
      return null;
    }).filter(Boolean).join(", ") : "";

    const tituloDesc = tituloModo === "ia"
      ? `with epic bold title text integrated at the top`
      : tituloModo === "manual" && titulo
      ? `with bold text saying "${titulo}" at the top`
      : "no text, no words, no letters";

    const prompt1 = `Epic dramatic YouTube thumbnail, ${descripcion}${elementosDesc ? `, featuring ${elementosDesc}` : ""}, ${emocionEN} mood, vibrant colors, dramatic cinematic lighting, ultra detailed, ${tituloDesc}, no logos`;
    const prompt2 = `Cinematic YouTube thumbnail, ${descripcion}${elementosDesc ? `, featuring ${elementosDesc}` : ""}, ${emocionEN} atmosphere, dynamic composition, high contrast, vivid colors, ${tituloDesc}, no logos`;

    // Componer elementos si hay imagenes
    const composicion = await componerElementos(elementos || [], aspectRatio);

    if (composicion) {
      const [imageUrl1, imageUrl2] = await Promise.all([
        generarConKontext(prompt1, composicion, aspectRatio),
        generarConKontext(prompt2, composicion, aspectRatio),
      ]);
      return NextResponse.json({ imageUrl: imageUrl1, variaciones: [imageUrl1, imageUrl2] });
    }

    const [imageUrl1, imageUrl2] = await Promise.all([
      generarImagen(prompt1, aspectRatio),
      generarImagen(prompt2, aspectRatio),
    ]);
    return NextResponse.json({ imageUrl: imageUrl1, variaciones: [imageUrl1, imageUrl2] });

  } catch (error: any) {
    console.error("ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
