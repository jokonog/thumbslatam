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

    // Obtener avatar del usuario
    const { data: usuarioData } = await supabaseAdmin
      .from("usuarios")
      .select("avatar_url")
      .eq("id", userId)
      .single();

    if (!usuarioData?.avatar_url) {
      return NextResponse.json({ error: "No tienes avatar guardado" }, { status: 400 });
    }

    const avatarUrl = usuarioData.avatar_url;

    // Convertir avatar a base64
    const avatarRes = await fetch(avatarUrl);
    const avatarBuffer = await avatarRes.arrayBuffer();
    const avatarBase64 = `data:image/jpeg;base64,${Buffer.from(avatarBuffer).toString("base64")}`;

    // PASO 1: Generar escena con FLUX PuLID
    const escenaOutput: any = await replicate.run(
      "bytedance/flux-pulid:8baa7ef2255075b46f4d91cd238c21d31181b3e6a864463f967960bb0112525b",
      {
        input: {
          main_face_image: avatarBase64,
          prompt: `${descripcion}, ${emocion} expression, ${estilo} style, cinematic dramatic lighting, ${orientacion}, professional photography, medium shot waist up, face prominently visible and well lit, no face covering`,
          negative_prompt: "ugly, blurry, low quality, deformed, back view, looking away, text, watermark, helmet, mask, hood covering face, face in shadow, small face, face hidden",
          width: orientacion.includes("portrait") ? 720 : 1280,
          height: orientacion.includes("portrait") ? 1280 : 720,
          num_steps: 20,
          guidance_scale: 4,
          id_weight: 1.0,
          start_step: 4,
        }
      }
    );

    // Guardar escena en Cloudinary
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
      return NextResponse.json({ error: "Error generando escena" }, { status: 500 });
    }

    const escenaUpload = await cloudinary.uploader.upload(
      `data:image/jpeg;base64,${escenaBuffer.toString("base64")}`,
      { folder: "thumbslatam-generated" }
    );

    // Subir avatar a Cloudinary para face swap
    const avatarUpload = await cloudinary.uploader.upload(avatarUrl, {
      folder: "thumbslatam-temp",
    });

    // PASO 2: Face swap
    const faceSwapOutput: any = await replicate.run(
      "yan-ops/face-swap:4af4b59bfc595c4f287e01d96484b0b7d8025e5c6e4bc9e9b5e14db7a7a40c60",
      {
        input: {
          source_image: avatarUpload.secure_url,
          target_image: escenaUpload.secure_url,
        }
      }
    );

    // Leer resultado del face swap
    console.log("faceSwapOutput keys:", Object.keys(faceSwapOutput || {}));
    console.log("faceSwapOutput.image type:", typeof faceSwapOutput?.image);
    console.log("faceSwapOutput:", JSON.stringify(faceSwapOutput, null, 2));
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

    if (!finalBuffer) {
      return NextResponse.json({ error: "La IA no detectó una cara clara en la escena. Intenta describir al personaje sin casco, máscara ni elementos que cubran el rostro." }, { status: 500 });
    }

    // Subir resultado final a Cloudinary
    const finalUpload = await cloudinary.uploader.upload(
      `data:image/jpeg;base64,${finalBuffer.toString("base64")}`,
      { folder: "thumbslatam-generated" }
    );

    // Guardar en tabla miniatura
    await supabaseAdmin.from("miniatura").insert({
      usuario_id: userId,
      imagen_url: finalUpload.secure_url,
    });

    return NextResponse.json({ imageUrl: finalUpload.secure_url });

  } catch (error: any) {
    console.error("generate-with-face error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
