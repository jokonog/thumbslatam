import { NextResponse, NextRequest } from "next/server";
import { verificarAuth } from "@/lib/auth-helper";
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
  const promptKontext = `Seamlessly composite the person into this background scene: ${descripcion}. The person must be fully blended into the scene with no visible cutout edges, no rectangular borders, no white halos, no black backgrounds around them. Apply matching cinematic lighting, color grading and shadows. The person appears exactly ONCE. Preserve face identity and outfit details. Make it look like a professional movie poster. Output NO text, NO letters, NO symbols anywhere in the image.`;

  let refinadoUrl: string = "";
  try {
    const refinado: any = await replicate.run("black-forest-labs/flux-kontext-max", {
      input: { prompt: promptKontext, input_image: uploadedComp.secure_url, aspect_ratio: aspectRatio }
    });
    refinadoUrl = String(refinado);
    if (!refinadoUrl.startsWith("http")) throw new Error("Kontext no genero imagen valida");
  } catch (kontextError: any) {
    const errMsg = kontextError.message || "";
    console.error("Kontext fallo:", errMsg);
    const esCopyright = errMsg.toLowerCase().includes("copyright") || 
                        errMsg.toLowerCase().includes("safety") ||
                        errMsg.toLowerCase().includes("content policy") ||
                        errMsg.toLowerCase().includes("nsfw") ||
                        errMsg.toLowerCase().includes("restricted");
    if (esCopyright) {
      throw new Error("COPYRIGHT: La imagen fue rechazada por contener contenido con derechos de autor. Por favor usa una imagen propia o generada con IA.");
    }
    const compFallback = await cloudinary.uploader.upload(uploadedComp.secure_url, { folder: "thumbslatam/fondos" });
    refinadoUrl = compFallback.secure_url;
  }

  // Sharp agrega titulo AQUI — despues de Kontext, nunca antes
  const conTitulo = tituloModo === "manual" && titulo && titulo.trim();
  const bufKontext = await descargarBuffer(refinadoUrl);
  const baseKontext = await sharp(bufKontext).resize(W, H, { fit: "fill" }).png().toBuffer();
  if (conTitulo) {
    const conTit = await agregarTitulo(baseKontext, titulo, W, H);
    const upload = await cloudinary.uploader.upload(
      `data:image/jpeg;base64,${conTit.toString("base64")}`,
      { folder: "thumbslatam/fondos" }
    );
    return upload.secure_url;
  }
  const finalBuf2 = await sharp(baseKontext).jpeg({ quality: 93 }).toBuffer();
  const final = await cloudinary.uploader.upload(`data:image/jpeg;base64,${finalBuf2.toString("base64")}`, { folder: "thumbslatam/fondos" });
  return final.secure_url;
}


const PALABRAS_PROHIBIDAS = [
  "nude", "naked", "porn", "sex", "explicit", "nsfw", "erotic", "adult content",
  "violence", "gore", "blood", "kill", "murder", "terrorist", "weapon", "gun",
  "desnudo", "desnuda", "pornografia", "sexo", "explicito", "violencia", "sangre",
  "matar", "arma", "menor", "child", "minor", "underage", "lolita",
  "deepfake", "non-consensual", "rape", "assault"
];

function contienePalabraProhibida(texto: string): boolean {
  const textoLower = texto.toLowerCase();
  return PALABRAS_PROHIBIDAS.some(palabra => textoLower.includes(palabra));
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verificarAuth(request);
    if (!auth) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const { descripcion, emocion, orientacion, elementos, titulo, tituloModo, imagenReferencia, plan } = await request.json();

    if (contienePalabraProhibida(descripcion || "") || contienePalabraProhibida(titulo || "")) {
      return NextResponse.json({ error: "Contenido no permitido por las politicas de uso de ThumbsLatam." }, { status: 400 });
    }

    const emocionMap: Record<string, string> = {
      epico: "epic, powerful, intense, dramatic cinematic lighting",
      emocionado: "excited, energetic, enthusiastic, vibrant warm colors",
      sorprendido: "surprised, shocked, amazed, wide dramatic lighting",
      gracioso: "fun, playful, colorful bright lighting, cheerful atmosphere",
      misterioso: "mysterious, dark, enigmatic, moody shadows",
      serio: "serious, focused, determined, sharp contrast lighting",
      sonriente: "warm, friendly, smiling, soft golden lighting",
      feliz: "happy, joyful, uplifting, bright warm sunshine",
      preocupado: "worried, tense, anxious, cold desaturated tones",
      pensativo: "thoughtful, reflective, calm, soft blue hour lighting",
      curioso: "curious, wondering, exploratory, soft diffused light",
      triste: "melancholic, emotional, sad, rain soft grey tones",
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

    // Titulo en FLUX para integracion cinematografica + Sharp lo refuerza al final
    const tituloPrompt = tituloModo === "manual" && titulo && titulo.trim()
      ? `with the bold dramatic title text "${titulo.toUpperCase()}" at the top in large epic typography`
      : "no text no words no letters";
    const promptFondo = `Epic dramatic YouTube thumbnail background, ${descripcion}${elementosDesc ? `, ${elementosDesc}` : ""}, ${emocionEN} mood, cinematic dramatic lighting, ultra detailed, ${tituloPrompt}, no logos, background only no characters no people`;
    const promptFondo2 = `Cinematic YouTube thumbnail background, ${descripcion}${elementosDesc ? `, ${elementosDesc}` : ""}, ${emocionEN} atmosphere, dramatic shadows, ${tituloPrompt}, no logos, background only no characters no people`;

    if (tieneImagenes) {
      let fondo1: string;
      let fondo2: string;
      if (imagenReferencia) {
        const refUpload = await cloudinary.uploader.upload(imagenReferencia, { folder: "thumbslatam-temp" });
        fondo1 = refUpload.secure_url;
        fondo2 = refUpload.secure_url;
      } else {
        [fondo1, fondo2] = await Promise.all([
          generarFondo(promptFondo, aspectRatio),
          generarFondo(promptFondo2, aspectRatio),
        ]);
      }
      const [imageUrl1, imageUrl2] = await Promise.all([
        componerYRefinar(fondo1, elementos, aspectRatio, descripcion, titulo, tituloModo),
        componerYRefinar(fondo2, elementos, aspectRatio, descripcion, titulo, tituloModo),
      ]);
      return NextResponse.json({ imageUrl: imageUrl1, variaciones: [imageUrl1, imageUrl2] });
    }

    // Sin imagenes — FLUX directo, titulo con Sharp al final
    let url1: string;
    let url2: string;
    if (imagenReferencia) {
      const refUpload = await cloudinary.uploader.upload(imagenReferencia, { folder: "thumbslatam-temp" });
      url1 = refUpload.secure_url;
      url2 = refUpload.secure_url;
    } else {
      [url1, url2] = await Promise.all([
        generarFondo(promptFondo, aspectRatio),
        generarFondo(promptFondo2, aspectRatio),
      ]);
    }

    const conTitulo = tituloModo === "manual" && titulo && titulo.trim();
    const esGratis = !plan || plan === "gratis";

    async function agregarWatermark(buf: Buffer): Promise<Buffer> {
      if (!esGratis) return buf;
      const meta = await sharp(buf).metadata();
      const w = meta.width || 1280;
      const h = meta.height || 720;
      const fontSize = Math.floor(w * 0.028);
      const wmSvg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
        <rect x="${Math.floor(w*0.02)}" y="${Math.floor(h*0.84)}" width="${Math.floor(w*0.22)}" height="${Math.floor(h*0.1)}" rx="6" fill="rgba(0,0,0,0.55)"/>
        <text x="${Math.floor(w*0.035)}" y="${Math.floor(h*0.915)}" font-family="Arial Black, sans-serif" font-weight="900" font-size="${fontSize}" fill="#FF4D00">Thumbs</text>
        <text x="${Math.floor(w*0.035) + Math.floor(fontSize*3.2)}" y="${Math.floor(h*0.915)}" font-family="Arial Black, sans-serif" font-weight="900" font-size="${fontSize}" fill="white">Latam</text>
      </svg>`;
      return sharp(buf).composite([{ input: Buffer.from(wmSvg), top: 0, left: 0 }]).jpeg({ quality: 92 }).toBuffer();
    }


    async function subirFondo(url: string): Promise<string> {
      if (!conTitulo) {
        const rawBuf = await descargarBuffer(url);
        const wmBuf = await agregarWatermark(rawBuf);
        const u = await cloudinary.uploader.upload(
          `data:image/jpeg;base64,${wmBuf.toString("base64")}`,
          { folder: "thumbslatam/fondos" }
        );
        return u.secure_url;
      }
      const buf = await descargarBuffer(url);
      const resized = await sharp(buf).resize(W, H, { fit: "cover" }).png().toBuffer();
      const conTit = await agregarTitulo(resized, titulo, W, H);
      const wmBuf2 = await agregarWatermark(conTit);
      const u = await cloudinary.uploader.upload(
        `data:image/jpeg;base64,${wmBuf2.toString("base64")}`,
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
