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

    const avatarUrl = usuarioData.avatar_url;
    const avatarRes = await fetch(avatarUrl);
    const avatarBuffer = await avatarRes.arrayBuffer();
    const avatarBase64 = `data:image/jpeg;base64,${Buffer.from(avatarBuffer).toString("base64")}`;

    // PASO 1: FLUX PuLID genera persona con tu cara
    const escenaOutput: any = await replicate.run(
      "bytedance/flux-pulid:8baa7ef2255075b46f4d91cd238c21d31181b3e6a864463f967960bb0112525b",
      {
        input: {
          main_face_image: avatarBase64,
          prompt: `portrait of a person, ${emocion} expression, ${estilo} style, ${descripcion} background, cinematic dramatic lighting, face clearly visible and prominent, upper body shot, no helmet no mask`,
          negative_prompt: "ugly, blurry, low quality, deformed, back view, text, watermark, helmet, mask, face hidden, small face, full body, wide shot",
          width: orientacion.includes("portrait") ? 720 : 1280,
          height: orientacion.includes("portrait") ? 1280 : 720,
          num_steps: 20,
          guidance_scale: 4,
          id_weight: 1.2,
          start_step: 0,
        }
      }
    );

    // Leer resultado
    let escenaBuffer: Buffer | null = null;
    for (const item of escenaOutput) {
      if (item instanceof ReadableStream) {
        const reader = item.getReader();
        const chunks: Uint8Array[] = [];
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
        }
        escenaBuffer = Buffer.concat(chunks.map(c => Buffer.from(c)));
      }
    }

    if (!escenaBuffer) {
      return NextResponse.json({ error: "Error generando la imagen. Intenta de nuevo." }, { status: 500 });
    }

    // Subir escena a Cloudinary
    const escenaUpload = await cloudinary.uploader.upload(
      `data:image/jpeg;base64,${escenaBuffer.toString("base64")}`,
      { folder: "thumbslatam-temp" }
    );

    // Subir avatar a Cloudinary
    const avatarUpload = await cloudinary.uploader.upload(avatarUrl, {
      folder: "thumbslatam-temp",
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
      }
    } catch (swapError: any) {
      console.log("Face swap falló, usando imagen de FLUX:", swapError.message);
    }

    return NextResponse.json({ imageUrl: finalImageUrl });

  } catch (error: any) {
    console.error("generate-with-face error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
