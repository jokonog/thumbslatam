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

    const elementosDesc = elementos ? elementos.map((el: any, i: number) => {
      const pos = i === 0 ? "left" : i === 1 ? "center" : "right";
      if (el.descripcion) return `${el.descripcion} on the ${pos}`;
      return null;
    }).filter(Boolean).join(", ") : "";

    const tituloPrompt = tituloModo === "manual" && titulo && titulo.trim()
      ? `with the bold dramatic title text "${titulo.toUpperCase()}" at the top in large epic typography`
      : "no text, no words, no letters";
    const prompt1 = `Epic dramatic YouTube thumbnail, ${descripcion}${elementosDesc ? `, ${elementosDesc}` : ""}, ${emocionEN} mood, cinematic lighting, ultra detailed, ${tituloPrompt}, no watermarks, no logos`;
    const prompt2 = `Cinematic YouTube thumbnail, ${descripcion}${elementosDesc ? `, ${elementosDesc}` : ""}, ${emocionEN} atmosphere, high contrast, vivid colors, ${tituloPrompt}, no watermarks, no logos`;

    // Paso 1: Generar 2 fondos con FLUX
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

    // Paso 2: Componer elementos con Sharp si los hay
    const tieneImagenes = elementos && elementos.some((el: any) => el.imagen && el.imagen.startsWith("http"));

    async function procesarFondo(fondoUrl: string): Promise<Buffer> {
      const fondoBuf = await descargarBuffer(fondoUrl);
      const fondo = await sharp(fondoBuf).resize(W, H, { fit: "cover" }).toBuffer();

      if (!tieneImagenes) return fondo;

      const leftMap = [Math.floor(W * 0.04), Math.floor(W * 0.37), Math.floor(W * 0.65)];
      const elW = Math.floor(W * 0.30);
      const elH = Math.floor(H * 0.80);
      const top = Math.floor(H * 0.12);
      const composites: sharp.OverlayOptions[] = [];

      for (let i = 0; i < elementos.length; i++) {
        const el = elementos[i];
        if (!el.imagen || !el.imagen.startsWith("http")) continue;
        try {
          const buf = await descargarBuffer(el.imagen);
          const meta = await sharp(buf).metadata();
          const hasAlpha = meta.channels === 4 || meta.hasAlpha;

          const resized = await sharp(buf)
            .resize(elW, elH, {
              fit: hasAlpha ? "contain" : "cover",
              background: hasAlpha ? { r: 0, g: 0, b: 0, alpha: 0 } : undefined,
            })
            .png()
            .toBuffer();

          composites.push({ input: resized, left: leftMap[i], top, blend: "over" });
        } catch(e) { console.log("Error elemento", i, e); }
      }

      if (composites.length === 0) return fondo;

      const fondoPng = await sharp(fondo).png().toBuffer();
      return await sharp(fondoPng).composite(composites).png().toBuffer();
    }

    // Paso 3: Agregar titulo SVG si hay
    async function agregarTitulo(buf: Buffer): Promise<Buffer> {
      if (tituloModo !== "manual" || !titulo || !titulo.trim()) return buf;

      const fontSize = Math.floor(W * 0.082);
      const padH = Math.floor(fontSize * 1.9);
      const texto = titulo.toUpperCase()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

      const svg = `<svg width="${W}" height="${padH}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="s" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="3" dy="3" stdDeviation="6" flood-color="#000" flood-opacity="0.95"/>
          </filter>
        </defs>
        <text
          x="${W / 2}"
          y="${Math.floor(padH * 0.78)}"
          font-family="Impact, Arial Black, sans-serif"
          font-size="${fontSize}"
          font-weight="bold"
          fill="white"
          text-anchor="middle"
          filter="url(#s)"
        >${texto}</text>
      </svg>`;

      return await sharp(buf)
        .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
        .toBuffer();
    }

    // Procesar los dos fondos
    const [buf1, buf2] = await Promise.all([
      procesarFondo(fondoUrl1),
      procesarFondo(fondoUrl2),
    ]);

    // Subir a Cloudinary
    const [u1, u2] = await Promise.all([
      cloudinary.uploader.upload(`data:image/png;base64,${buf1.toString("base64")}`, { folder: "thumbslatam/fondos" }),
      cloudinary.uploader.upload(`data:image/png;base64,${buf2.toString("base64")}`, { folder: "thumbslatam/fondos" }),
    ]);

    return NextResponse.json({ imageUrl: u1.secure_url, variaciones: [u1.secure_url, u2.secure_url] });

  } catch (error: any) {
    console.error("ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
