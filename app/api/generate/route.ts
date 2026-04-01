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

async function componerYRefinar(fondoUrl: string, elementos: any[], aspectRatio: string, promptRefinado: string, tituloTexto: string = ""): Promise<string> {
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
      // Aplicar mascara de degradado suave en bordes para mejor integracion
      const resized = await sharp(buf)
        .resize(elW, elH, { fit: "cover", position: "center" })
        .png()
        .toBuffer();

      // Crear mascara con bordes suaves
      const mask = await sharp({
        create: {
          width: elW, height: elH, channels: 4,
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        }
      })
      .png()
      .toBuffer();

      const withAlpha = await sharp(resized)
        .ensureAlpha()
        .blur(0.5)
        .png()
        .toBuffer();

      composites.push({ input: withAlpha, left: leftMap[i], top, blend: "over" });
    } catch(e) { console.log("Error elemento", i); }
  }

  let imagenBase: string;

  if (composites.length > 0) {
    const composed = await sharp(fondo).composite(composites).jpeg({ quality: 90 }).toBuffer();
    const base64 = `data:image/jpeg;base64,${composed.toString("base64")}`;
    const uploadedComp = await cloudinary.uploader.upload(base64, { folder: "thumbslatam-temp" });
    
    // Kontext Max integra todo con iluminacion y contexto
    const slotsOcupados = elementos.map((el: any, i: number) => {
          const pos = i === 0 ? "LEFT" : i === 1 ? "CENTER" : "RIGHT";
          if (el.imagen || el.descripcion) return `${pos} slot has a character/element`;
          return `${pos} slot is EMPTY — do not add anything there`;
        }).join(". ");
        const promptKontext = `${promptRefinado}. Layout instructions: ${slotsOcupados}. Keep ALL characters EXACTLY as they appear in the reference — same face, same outfit, do not modify them. Only blend them into the background with cinematic lighting and color grading. Remove the rectangular box borders around each character and make them blend naturally into the scene. If a title is mentioned, display it at the top with bold dramatic typography. Do NOT invent new characters or elements in empty spaces.`;
    const refinado: any = await replicate.run("black-forest-labs/flux-kontext-max", {
      input: {
        prompt: promptKontext,
        input_image: uploadedComp.secure_url,
        aspect_ratio: aspectRatio,
      }
    });
    imagenBase = String(refinado);
  } else {
    imagenBase = fondoUrl;
  }

  if (!imagenBase.startsWith("http")) throw new Error("Error en refinado");

  // Si hay titulo manual, agregarlo con @napi-rs/canvas encima del resultado
  if (tituloTexto && tituloTexto.trim()) {
    try {
      const { createCanvas, GlobalFonts } = await import("@napi-rs/canvas");
      const esVert = aspectRatio === "9:16";
      const W2 = esVert ? 720 : 1280;
      const H2 = esVert ? 1280 : 720;
      const imgBuf = await descargarBuffer(imagenBase);
      const fondoResized = await sharp(imgBuf).resize(W2, H2, { fit: "cover" }).png().toBuffer();

      const fontSize = Math.floor(W2 * 0.085);
      const padH = Math.floor(fontSize * 1.6);
      const overlayC = createCanvas(W2, padH);
      const ctx = overlayC.getContext("2d");

      // Fondo semitransparente
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(0, 0, W2, padH);

      // Texto con sombra
      ctx.font = `bold ${fontSize}px Impact, Arial Black`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = "rgba(0,0,0,0.9)";
      ctx.shadowBlur = 12;
      ctx.shadowOffsetX = 4;
      ctx.shadowOffsetY = 4;
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText(tituloTexto.toUpperCase(), W2 / 2, padH / 2);

      const overlayBuf = overlayC.toBuffer("image/png");
      const conTitulo = await sharp(fondoResized)
        .composite([{ input: overlayBuf, top: 0, left: 0 }])
        .jpeg({ quality: 95 })
        .toBuffer();
      const base64t = `data:image/jpeg;base64,${conTitulo.toString("base64")}`;
      const finalT = await cloudinary.uploader.upload(base64t, { folder: "thumbslatam/fondos" });
      return finalT.secure_url;
    } catch (e) {
      console.log("Error agregando titulo:", e);
    }
  }

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
      const tipo = el.tipo || "personaje";
      if (el.descripcion && !el.imagen) return `${el.descripcion} on the ${pos}`;
      if (el.imagen && el.descripcion) return `${el.descripcion} on the ${pos}`;
      return null;
    }).filter(Boolean).join(", ") : "";

    const tituloDesc = tituloModo === "manual" && titulo
      ? "leave space at the top for title text, no text in the image"
      : tituloModo === "manual" && !titulo
      ? "leave space at the top for title text, no text in the image"
      : "no text no words no letters";

    const promptBase = `Epic dramatic YouTube thumbnail, ${descripcion}${elementosDesc ? `, ${elementosDesc}` : ""}, ${emocionEN} mood, cinematic dramatic lighting, ultra detailed, ${tituloDesc}, no logos`;

    const tieneImagenes = elementos && elementos.some((el: any) => el.imagen && el.imagen.startsWith("http"));

    if (tieneImagenes) {
      const [fondo1, fondo2] = await Promise.all([
        generarFondo(`${promptBase}, background only, no characters`, aspectRatio),
        generarFondo(`Cinematic version, ${promptBase}, background only, no characters`, aspectRatio),
      ]);
      const [imageUrl1, imageUrl2] = await Promise.all([
        componerYRefinar(fondo1, elementos, aspectRatio, promptBase, titulo && tituloModo === "manual" ? titulo : ""),
        componerYRefinar(fondo2, elementos, aspectRatio, promptBase, titulo && tituloModo === "manual" ? titulo : ""),
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
