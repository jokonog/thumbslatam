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
    const conTitulo = tituloModo === "manual" && titulo && titulo.trim();

    const tituloPrompt = conTitulo
      ? `with bold dramatic title text "${titulo.toUpperCase()}" at the top`
      : "no text no words no letters";

    const elementosDesc = elementos ? elementos.map((el: any, i: number) => {
      const pos = i === 0 ? "left" : i === 1 ? "center" : "right";
      if (el.descripcion) return `${el.descripcion} on the ${pos}`;
      return null;
    }).filter(Boolean).join(", ") : "";

    // Prompt para el fondo - sin personajes si hay imagenes subidas
    const fondoSuffix = tieneImagenes ? ", background scene only, no people" : "";
    const prompt1 = `Epic dramatic YouTube thumbnail, ${descripcion}${elementosDesc ? `, ${elementosDesc}` : ""}${fondoSuffix}, ${emocionEN} mood, cinematic lighting, ${tituloPrompt}`;
    const prompt2 = `Cinematic YouTube thumbnail, ${descripcion}${elementosDesc ? `, ${elementosDesc}` : ""}${fondoSuffix}, ${emocionEN} atmosphere, high contrast, ${tituloPrompt}`;

    // Paso 1: Generar fondos con FLUX
    const [out1, out2] = await Promise.all([
      replicate.run("black-forest-labs/flux-1.1-pro", {
        input: { prompt: prompt1, aspect_ratio: aspectRatio, output_format: "jpg", output_quality: 95, safety_tolerance: 5 }
      }),
      replicate.run("black-forest-labs/flux-1.1-pro", {
        input: { prompt: prompt2, aspect_ratio: aspectRatio, output_format: "jpg", output_quality: 95, safety_tolerance: 5 }
      }),
    ]);

    const fondoUrl1 = String(out1);
    const fondoUrl2 = String(out2);

    if (!tieneImagenes) {
      const [u1, u2] = await Promise.all([
        cloudinary.uploader.upload(fondoUrl1, { folder: "thumbslatam/fondos" }),
        cloudinary.uploader.upload(fondoUrl2, { folder: "thumbslatam/fondos" }),
      ]);
      return NextResponse.json({ imageUrl: u1.secure_url, variaciones: [u1.secure_url, u2.secure_url] });
    }

    // Paso 2: Sharp compone elementos
    async function componerElementos(fondoUrl: string): Promise<string> {
      const fondoBuf = await descargarBuffer(fondoUrl);
      const fondo = await sharp(fondoBuf).resize(W, H, { fit: "cover" }).png().toBuffer();

      const leftMap = [Math.floor(W * 0.04), Math.floor(W * 0.37), Math.floor(W * 0.65)];
      const elW = Math.floor(W * 0.30);
      const elH = Math.floor(H * 0.82);
      const top = Math.floor(H * 0.10);
      const composites: sharp.OverlayOptions[] = [];

      for (let i = 0; i < elementos.length; i++) {
        const el = elementos[i];
        if (!el.imagen || !el.imagen.startsWith("http")) continue;
        try {
          const buf = await descargarBuffer(el.imagen);
          const meta = await sharp(buf).metadata();
          const hasAlpha = meta.hasAlpha;
          const resized = await sharp(buf)
            .resize(elW, elH, {
              fit: hasAlpha ? "contain" : "cover",
              background: hasAlpha ? { r: 0, g: 0, b: 0, alpha: 0 } : undefined,
            })
            .png()
            .toBuffer();
          composites.push({ input: resized, left: leftMap[i], top, blend: "over" });
        } catch(e) { console.log("Error elemento", i); }
      }

      const composed = await sharp(fondo).composite(composites).jpeg({ quality: 92 }).toBuffer();
      const upload = await cloudinary.uploader.upload(
        `data:image/jpeg;base64,${composed.toString("base64")}`,
        { folder: "thumbslatam-temp" }
      );
      return upload.secure_url;
    }

    const [comp1, comp2] = await Promise.all([
      componerElementos(fondoUrl1),
      componerElementos(fondoUrl2),
    ]);

    // Paso 3: Kontext integra elementos al fondo — prompt SOLO de iluminacion, SIN TEXTO
    const promptKontext = `Seamlessly blend the characters into the background scene. Match lighting, shadows and color grading. Remove any rectangular borders. Keep faces exactly as shown. NO TEXT NO WORDS NO LETTERS NO SYMBOLS. Do not add or invent anything new.`;

    const [ref1, ref2] = await Promise.all([
      replicate.run("black-forest-labs/flux-kontext-max", {
        input: { prompt: promptKontext, input_image: comp1, aspect_ratio: aspectRatio }
      }),
      replicate.run("black-forest-labs/flux-kontext-max", {
        input: { prompt: promptKontext, input_image: comp2, aspect_ratio: aspectRatio }
      }),
    ]);

    const [u1, u2] = await Promise.all([
      cloudinary.uploader.upload(String(ref1), { folder: "thumbslatam/fondos" }),
      cloudinary.uploader.upload(String(ref2), { folder: "thumbslatam/fondos" }),
    ]);

    return NextResponse.json({ imageUrl: u1.secure_url, variaciones: [u1.secure_url, u2.secure_url] });

  } catch (error: any) {
    console.error("ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
