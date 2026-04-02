import { NextResponse } from "next/server";

export const maxDuration = 60;
import Replicate from "replicate";
import { v2 as cloudinary } from "cloudinary";
import { createClient } from "@supabase/supabase-js";

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
    const { userId, descripcion, estilo, orientacion, emocion, avatarOverride, elementos } = await request.json();
    const emocionMap: Record<string, string> = {
      epico: "epic, powerful, intense",
      emocionado: "excited, energetic, enthusiastic",
      sorprendido: "surprised, shocked, amazed",
      gracioso: "funny, playful, humorous",
      misterioso: "mysterious, dark, enigmatic",
      serio: "serious, focused, determined",
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
    const kontextOutput: any = await replicate.run(
      "black-forest-labs/flux-kontext-max",
      {
        input: {
          prompt: (() => {
            // Detectar posicion del avatar en los slots
            let posicion = "right side"; // default
            if (elementos && elementos.length > 0) {
              const avatarIdx = elementos.findIndex((el: any) => el.usarAvatar || (avatarOverride && el.imagen === avatarOverride));
              if (avatarIdx === 0) posicion = "left side";
              else if (avatarIdx === 1) posicion = "center";
              else if (avatarIdx === 2) posicion = "right side";
            }
            return `The reference person appears ONLY as the ${posicion.toUpperCase()} character in this scene: ${descripcion}. Style: ${estilo}, mood: ${emocionEN}, cinematic dramatic lighting. IMPORTANT: any other character in the scene must look completely different — different face, different ethnicity, different hair, invented person, NO resemblance to the reference photo whatsoever. Only the ${posicion} character matches the reference photo exactly. Face of reference person clearly visible, no mask, no helmet. Natural hand anatomy, realistic fingers, hands properly gripping any objects, no deformed or extra fingers.`;
          })(),
          input_image: avatarFinal,
          aspect_ratio: aspectRatio,
        }
      }
    );

    const escenaUrl = String(kontextOutput);
    if (!escenaUrl || !escenaUrl.startsWith("http")) {
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

    // PASO 2: Face swap para pegar la cara correcta
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
        console.log("Face swap exitoso");
      } else {
        console.log("Face swap sin resultado — usando Kontext directo");
      }
    } catch (swapError: any) {
      console.log("Face swap fallo:", swapError.message, "— usando Kontext directo");
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
            face_enhance: true,
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

    return NextResponse.json({ imageUrl: finalImageUrl });

  } catch (error: any) {
    console.error("generate-with-face error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
