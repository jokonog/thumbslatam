import sharp from "sharp";
import { NextResponse } from "next/server";

export const maxDuration = 120;
import Replicate from "replicate";
import { v2 as cloudinary } from "cloudinary";
import { createClient } from "@supabase/supabase-js";


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


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { userId, descripcion, estilo, orientacion, emocion, avatarOverride, posicionAvatar, imagenReferencia , plan } = await request.json();

    if (contienePalabraProhibida(descripcion || "")) {
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

    const { data: usuarioData } = await supabaseAdmin
      .from("usuarios")
      .select("avatar_url")
      .eq("id", userId)
      .single();

    const avatarFinal = avatarOverride || usuarioData?.avatar_url;
    if (!avatarFinal) {
      return NextResponse.json({ error: "No tienes avatar guardado" }, { status: 400 });
    }

    const esVertical = orientacion.includes("portrait");
    const aspectRatio = esVertical ? "9:16" : "16:9";

    // PASO 1: Kontext Max genera la escena con el personaje
    const referenciaPrompt = imagenReferencia
      ? ` Inspired by the visual style, color palette and atmosphere of the reference scene, but create an original composition.`
      : "";
    const kontextOutput: any = await replicate.run(
      "black-forest-labs/flux-kontext-max",
      {
        input: {
          prompt: `Cinematic scene: ${descripcion}. Mood: ${emocionEN}, dramatic cinematic lighting.${referenciaPrompt} ONE person only: place the person from the reference photo on the ${posicionAvatar === "left" ? "left" : posicionAvatar === "center" ? "center" : "right"} side of the scene. Only ONE character visible. Natural body proportions, realistic anatomy. No other people. No text. No words. No letters. No captions.`,
          input_image: avatarFinal,
          aspect_ratio: aspectRatio,
        }
      }
    );

    const escenaUrl = String(kontextOutput);
    if (!escenaUrl || !escenaUrl.startsWith("http")) {
      const errStr = JSON.stringify(kontextOutput || "").toLowerCase();
      const esCopyright = errStr.includes("copyright") || errStr.includes("safety") || errStr.includes("content policy") || errStr.includes("nsfw") || errStr.includes("restricted") || errStr.includes("error generating");
      if (esCopyright) {
        return NextResponse.json({ error: "⚠️ La imagen fue rechazada. Si usaste una imagen de referencia con copyright, intenta sin ella o usa un prompt de texto.", codigo: "COPYRIGHT" }, { status: 422 });
      }
      return NextResponse.json({ error: "Error generando la escena. Intenta de nuevo." }, { status: 500 });
    }

    // Subir escena a Cloudinary
    const escenaUpload = await cloudinary.uploader.upload(escenaUrl, {
      folder: "thumbslatam-temp"
    });

    // Subir avatar a Cloudinary
    const avatarUpload = await cloudinary.uploader.upload(avatarFinal, {
      folder: "thumbslatam-temp"
    });

    // PASO 2: Composición facial para integrar el avatar
    let imagenParaUpscale = escenaUpload.secure_url;

    try {
      const faceSwapOutput: any = await replicate.run(
        "codeplugtech/face-swap:d5900f9ebed33e7ae08a07f17e0d98b4ebc68ab9528a70462afc3899cfe23bab",
        {
          input: {
            source_image: avatarUpload.secure_url,
            target_image: escenaUpload.secure_url,
          }
        }
      );

      let finalBuffer: Buffer | null = null;

      if (faceSwapOutput?.image instanceof ReadableStream) {
        const reader = faceSwapOutput.image.getReader();
        const chunks: Uint8Array[] = [];
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
        }
        finalBuffer = Buffer.concat(chunks.map(c => Buffer.from(c)));
      }

      if (finalBuffer) {
        const swapUpload = await cloudinary.uploader.upload(
          `data:image/jpeg;base64,${finalBuffer.toString("base64")}`,
          { folder: "thumbslatam-temp" }
        );
        imagenParaUpscale = swapUpload.secure_url;
        console.log("Composición exitosa");
      } else {
        console.log("Composición sin resultado — usando Kontext directo");
      }
    } catch (swapError: any) {
      console.log("Composición fallo:", swapError.message, "— usando Kontext directo");
    }

    // PASO 3: Upscaler real-esrgan x4 para recuperar calidad completa
    let finalImageUrl = imagenParaUpscale;

    try {
      const upscaleOutput: any = await replicate.run(
        "nightmareai/real-esrgan:42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
        {
          input: {
            image: imagenParaUpscale,
            scale: 2,
            face_enhance: false,
          }
        }
      );

      const upscaleUrl = String(upscaleOutput);
      if (upscaleUrl && upscaleUrl.startsWith("http")) {
        const upscaleUpload = await cloudinary.uploader.upload(upscaleUrl, {
          folder: "thumbslatam-generated"
        });
        finalImageUrl = upscaleUpload.secure_url;
        console.log("Upscale exitoso");
      } else {
        console.log("Upscale sin resultado — usando imagen del paso 2");
        const fallbackUpload = await cloudinary.uploader.upload(imagenParaUpscale, {
          folder: "thumbslatam-generated"
        });
        finalImageUrl = fallbackUpload.secure_url;
      }
    } catch (upscaleError: any) {
      console.log("Upscale fallo:", upscaleError.message, "— usando imagen del paso 2");
      const fallbackUpload = await cloudinary.uploader.upload(imagenParaUpscale, {
        folder: "thumbslatam-generated"
      });
      finalImageUrl = fallbackUpload.secure_url;
    }

    // Watermark para usuarios gratis
    if (!plan || plan === "gratis") {
      try {
        const rawBuf = await fetch(finalImageUrl).then(r => r.arrayBuffer()).then(b => Buffer.from(b));
        const meta = await sharp(rawBuf).metadata();
        const w = meta.width || 1280;
        const h = meta.height || 720;
        const fontSize = Math.floor(w * 0.028);
        const wmSvg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
          <rect x="${Math.floor(w*0.02)}" y="${Math.floor(h*0.84)}" width="${Math.floor(w*0.22)}" height="${Math.floor(h*0.1)}" rx="6" fill="rgba(0,0,0,0.55)"/>
          <text x="${Math.floor(w*0.035)}" y="${Math.floor(h*0.915)}" font-family="Arial Black, sans-serif" font-weight="900" font-size="${fontSize}" fill="#FF4D00">Thumbs</text>
          <text x="${Math.floor(w*0.035) + Math.floor(fontSize*3.2)}" y="${Math.floor(h*0.915)}" font-family="Arial Black, sans-serif" font-weight="900" font-size="${fontSize}" fill="white">Latam</text>
        </svg>`;
        const wmBuf = await sharp(rawBuf).composite([{ input: Buffer.from(wmSvg), top: 0, left: 0 }]).jpeg({ quality: 92 }).toBuffer();
        const wmUpload = await cloudinary.uploader.upload(
          `data:image/jpeg;base64,${wmBuf.toString("base64")}`,
          { folder: "thumbslatam-generated" }
        );
        finalImageUrl = wmUpload.secure_url;
      } catch (wmError: any) {
        console.log("Watermark fallo:", wmError.message);
      }
    }
    return NextResponse.json({ imageUrl: finalImageUrl });

  } catch (error: any) {
    console.error("generate-with-face error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
