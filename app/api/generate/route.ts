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
  if (!res.ok) throw new Error(`Error descargando imagen: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function descargarFuente(): Promise<Buffer> {
  const res = await fetch(
    "https://fonts.gstatic.com/s/bebasneue/v14/JTUSjIg69CK48gW7PXooxW5rygbi49c.woff2"
  );
  return Buffer.from(await res.arrayBuffer());
}

async function agregarTitulo(buf: Buffer, titulo: string, W: number, H: number): Promise<Buffer> {
  if (!titulo || !titulo.trim()) return buf;
  const texto = titulo.toUpperCase().trim();
  const fontSize = Math.floor(W / (texto.length > 20 ? 18 : texto.length > 12 ? 14 : 10));
  const paddingH = Math.floor(W * 0.05);
  const paddingV = Math.floor(H * 0.04);
  const boxH = Math.floor(H * 0.18);

  // Sombra oscura en la parte superior para legibilidad
  const overlay = await sharp({
    create: { width: W, height: boxH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0.55 } }
  }).png().toBuffer();

  // Texto SVG - Bebas Neue no disponible en Vercel, usamos Arial Bold nativo
  const svgTexto = `
    <svg width="${W}" height="${boxH}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="sombra">
          <feDropShadow dx="3" dy="3" stdDeviation="4" flood-color="black" flood-opacity="0.9"/>
        </filter>
      </defs>
      <text
        x="${W / 2}"
        y="${boxH * 0.68}"
        text-anchor="middle"
        font-family="Arial Black, Arial, sans-serif"
        font-weight="900"
        font-size="${fontSize}"
        fill="white"
        filter="url(#sombra)"
        letter-spacing="2"
      >${texto.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</text>
    </svg>`;

  const svgBuf = Buffer.from(svgTexto);

  return sharp(buf)
    .composite([
      { input: overlay, top: 0, left: 0, blend: "over" },
      { input: svgBuf, top: 0, left: 0, blend: "over" },
    ])
    .jpeg({ quality: 92 })
    .toBuffer();
}

async function componerElementos(
  fondoUrl: string,
  elementos: any[],
  W: number,
  H: number,
  titulo: string,
  tituloModo: string
): Promise<string> {
  const fondoBuf = await descargarBuffer(fondoUrl);
  const fondo = await sharp(fondoBuf).resize(W, H, { fit: "cover" }).png().toBuffer();

  // Posiciones: izquierda, centro, derecha
  const leftMap = [
    Math.floor(W * 0.02),
    Math.floor(W * 0.35),
    Math.floor(W * 0.66),
  ];
  const elW = Math.floor(W * 0.31);
  const elH = Math.floor(H * 0.80);
  const top = Math.floor(H * 0.15);

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
          position: "center",
          background: hasAlpha ? { r: 0, g: 0, b: 0, alpha: 0 } : undefined,
        })
        .ensureAlpha()
        .png()
        .toBuffer();

      // Sombra difusa debajo del elemento para integracion visual
      const shadow = await sharp({
        create: { width: elW + 20, height: 30, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0.35 } }
      }).blur(8).png().toBuffer();

      composites.push({
        input: shadow,
        left: Math.max(0, leftMap[i] - 10),
        top: top + elH - 10,
        blend: "multiply",
      });

      composites.push({ input: resized, left: leftMap[i], top, blend: "over" });
    } catch (e) {
      console.log("Error procesando elemento", i, e);
    }
  }

  let resultado = await sharp(fondo).composite(composites).png().toBuffer();

  // Agregar titulo si corresponde
  const conTitulo = tituloModo === "manual" && titulo && titulo.trim();
  if (conTitulo) {
    resultado = await agregarTitulo(resultado, titulo, W, H);
  }

  const finalJpeg = await sharp(resultado).jpeg({ quality: 92 }).toBuffer();
  const upload = await cloudinary.uploader.upload(
    `data:image/jpeg;base64,${finalJpeg.toString("base64")}`,
    { folder: "thumbslatam/fondos" }
  );
  return upload.secure_url;
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

    const tieneImagenes =
      elementos && elementos.some((el: any) => el.imagen && el.imagen.startsWith("http"));

    // Prompt siempre limpio — sin texto, sin personajes si hay imagenes
    const fondoDesc = tieneImagenes
      ? "background scene only, no people, no characters, no text"
      : "no text no words no letters";

    const elementosDesc = elementos
      ? elementos
          .map((el: any, i: number) => {
            const pos = i === 0 ? "left" : i === 1 ? "center" : "right";
            if (!tieneImagenes && el.descripcion) return `${el.descripcion} on the ${pos}`;
            return null;
          })
          .filter(Boolean)
          .join(", ")
      : "";

    const prompt1 = `Epic dramatic YouTube thumbnail, ${descripcion}${
      elementosDesc ? `, ${elementosDesc}` : ""
    }, ${emocionEN} mood, cinematic lighting, high contrast, ultra detailed, ${fondoDesc}`;

    const prompt2 = `Cinematic YouTube thumbnail, ${descripcion}${
      elementosDesc ? `, ${elementosDesc}` : ""
    }, ${emocionEN} atmosphere, dramatic shadows, ${fondoDesc}`;

    // Paso 1: Generar 2 fondos en paralelo
    const [out1, out2] = await Promise.all([
      replicate.run("black-forest-labs/flux-1.1-pro", {
        input: { prompt: prompt1, aspect_ratio: aspectRatio, output_format: "jpg", output_quality: 95, safety_tolerance: 5 },
      }),
      replicate.run("black-forest-labs/flux-1.1-pro", {
        input: { prompt: prompt2, aspect_ratio: aspectRatio, output_format: "jpg", output_quality: 95, safety_tolerance: 5 },
      }),
    ]);

    const fondoUrl1 = String(out1);
    const fondoUrl2 = String(out2);

    if (!fondoUrl1.startsWith("http") || !fondoUrl2.startsWith("http")) {
      throw new Error("FLUX no genero las imagenes");
    }

    // Paso 2: Si hay imagenes, Sharp compone — sin Kontext
    if (tieneImagenes) {
      const [imageUrl1, imageUrl2] = await Promise.all([
        componerElementos(fondoUrl1, elementos, W, H, titulo, tituloModo),
        componerElementos(fondoUrl2, elementos, W, H, titulo, tituloModo),
      ]);
      return NextResponse.json({ imageUrl: imageUrl1, variaciones: [imageUrl1, imageUrl2] });
    }

    // Sin imagenes — subir fondos directamente con titulo si corresponde
    const conTitulo = tituloModo === "manual" && titulo && titulo.trim();

    async function subirConTitulo(url: string): Promise<string> {
      if (conTitulo) {
        const buf = await descargarBuffer(url);
        const resized = await sharp(buf).resize(W, H, { fit: "cover" }).png().toBuffer();
        const conTit = await agregarTitulo(resized, titulo, W, H);
        const upload = await cloudinary.uploader.upload(
          `data:image/jpeg;base64,${conTit.toString("base64")}`,
          { folder: "thumbslatam/fondos" }
        );
        return upload.secure_url;
      }
      const u = await cloudinary.uploader.upload(url, { folder: "thumbslatam/fondos" });
      return u.secure_url;
    }

    const [imageUrl1, imageUrl2] = await Promise.all([
      subirConTitulo(fondoUrl1),
      subirConTitulo(fondoUrl2),
    ]);

    return NextResponse.json({ imageUrl: imageUrl1, variaciones: [imageUrl1, imageUrl2] });

  } catch (error: any) {
    console.error("ERROR generate:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
