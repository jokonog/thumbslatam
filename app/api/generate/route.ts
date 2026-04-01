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
  const output: any = await replicate.run(
    "black-forest-labs/flux-1.1-pro",
    {
      input: { prompt, aspect_ratio: aspectRatio, output_format: "jpg", output_quality: 95, safety_tolerance: 5 }
    }
  );
  const url = String(output);
  if (!url || !url.startsWith("http")) throw new Error("FLUX no genero imagen");
  return url;
}

async function componerSobreFondo(fondoUrl: string, elementos: any[], aspectRatio: string): Promise<string> {
  const esVertical = aspectRatio === "9:16";
  const W = esVertical ? 720 : 1280;
  const H = esVertical ? 1280 : 720;

  const fondoBuf = await descargarBuffer(fondoUrl);
  const fondo = await sharp(fondoBuf).resize(W, H, { fit: "cover" }).jpeg().toBuffer();

  const composites: sharp.OverlayOptions[] = [];

  for (let i = 0; i < elementos.length; i++) {
    const el = elementos[i];
    if (!el.imagen || !el.imagen.startsWith("http")) continue;

    try {
      const buf = await descargarBuffer(el.imagen);
      const elW = Math.floor(W * 0.28);
      const elH = Math.floor(H * 0.75);

      // Posicion segun slot
      const leftMap = [
        Math.floor(W * 0.02),           // izquierda
        Math.floor(W * 0.36),           // centro
        Math.floor(W * 0.70),           // derecha
      ];
      const top = Math.floor(H * 0.12);

      const resized = await sharp(buf)
        .resize(elW, elH, { fit: "cover", position: "center" })
        .jpeg()
        .toBuffer();

      composites.push({ input: resized, left: leftMap[i], top });
    } catch (e) {
      console.log("Error componiendo elemento", i);
    }
  }

  if (composites.length === 0) {
    const uploaded = await cloudinary.uploader.upload(fondoUrl, { folder: "thumbslatam/fondos" });
    return uploaded.secure_url;
  }

  const final = await sharp(fondo).composite(composites).jpeg({ quality: 92 }).toBuffer();
  const base64 = `data:image/jpeg;base64,${final.toString("base64")}`;
  const uploaded = await cloudinary.uploader.upload(base64, { folder: "thumbslatam/fondos" });
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

    // Elementos solo con descripcion para el prompt del fondo
    const elementosPrompt = elementos ? elementos.map((el: any, i: number) => {
      const pos = i === 0 ? "left" : i === 1 ? "center" : "right";
      if (el.descripcion && !el.imagen) return `leave space on the ${pos} for ${el.descripcion}`;
      if (el.imagen) return `leave space on the ${pos} for a character or element`;
      return null;
    }).filter(Boolean).join(", ") : "";

    const tituloDesc = tituloModo === "ia"
      ? `with space at top for epic bold title text`
      : tituloModo === "manual" && titulo
      ? `with space at top for text "${titulo}"`
      : "no text, no words";

    const prompt1 = `Epic dramatic YouTube thumbnail background, ${descripcion}, ${elementosPrompt ? `${elementosPrompt},` : ""} ${emocionEN} mood, vibrant colors, dramatic cinematic lighting, ${tituloDesc}, no logos, no people`;
    const prompt2 = `Cinematic YouTube thumbnail background, ${descripcion}, ${elementosPrompt ? `${elementosPrompt},` : ""} ${emocionEN} atmosphere, high contrast, vivid colors, ${tituloDesc}, no logos, no people`;

    // Generar dos fondos en paralelo
    const [fondo1, fondo2] = await Promise.all([
      generarFondo(prompt1, aspectRatio),
      generarFondo(prompt2, aspectRatio),
    ]);

    // Componer elementos encima de cada fondo
    const tieneImagenes = elementos && elementos.some((el: any) => el.imagen && el.imagen.startsWith("http"));

    const [imageUrl1, imageUrl2] = tieneImagenes
      ? await Promise.all([
          componerSobreFondo(fondo1, elementos, aspectRatio),
          componerSobreFondo(fondo2, elementos, aspectRatio),
        ])
      : await Promise.all([
          cloudinary.uploader.upload(fondo1, { folder: "thumbslatam/fondos" }).then(r => r.secure_url),
          cloudinary.uploader.upload(fondo2, { folder: "thumbslatam/fondos" }).then(r => r.secure_url),
        ]);

    return NextResponse.json({ imageUrl: imageUrl1, variaciones: [imageUrl1, imageUrl2] });

  } catch (error: any) {
    console.error("ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
