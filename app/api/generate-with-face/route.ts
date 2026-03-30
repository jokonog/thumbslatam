import { NextResponse } from "next/server";
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
    const { userId, descripcion, estilo, orientacion, emocion } = await request.json();

    const { data: usuarioData } = await supabaseAdmin
      .from("usuarios")
      .select("avatar_url")
      .eq("id", userId)
      .single();

    if (!usuarioData?.avatar_url) {
      return NextResponse.json({ error: "No tienes avatar guardado" }, { status: 400 });
    }

    const esVertical = orientacion.includes("portrait");
    const aspectRatio = esVertical ? "9:16" : "16:9";

    // PASO 1: Kontext Max genera la escena con el personaje
    const kontextOutput: any = await replicate.run(
      "black-forest-labs/flux-kontext-max",
      {
        input: {
          prompt: `Place this person in the following scene: ${descripcion}. The person should have a ${emocion} expression, ${estilo} style, cinematic dramatic lighting. Keep the person's face and identity exactly as in the reference photo. Face clearly visible, no mask, no helmet, upper body visible.`,
          input_image: usuarioData.avatar_url,
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
    const avatarUpload = await cloudinary.uploader.upload(usuarioData.avatar_url, {
      folder: "thumbslatam-temp"
    });

    // PASO 2: Face swap para mejorar parecido al 95%
    let finalImageUrl = escenaUpload.secure_url;

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
        const finalUpload = await cloudinary.uploader.upload(
          `data:image/jpeg;base64,${finalBuffer.toString("base64")}`,
          { folder: "thumbslatam-generated" }
        );
        finalImageUrl = finalUpload.secure_url;
        console.log("Face swap exitoso");
      } else {
        console.log("Face swap sin resultado — usando Kontext");
        const upload = await cloudinary.uploader.upload(escenaUrl, { folder: "thumbslatam-generated" });
        finalImageUrl = upload.secure_url;
      }
    } catch (swapError: any) {
      console.log("Face swap falló:", swapError.message, "— usando Kontext");
      const upload = await cloudinary.uploader.upload(escenaUrl, { folder: "thumbslatam-generated" });
      finalImageUrl = upload.secure_url;
    }

    return NextResponse.json({ imageUrl: finalImageUrl });

  } catch (error: any) {
    console.error("generate-with-face error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
