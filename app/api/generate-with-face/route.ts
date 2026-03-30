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

    const esVertical = orientacion.includes("portrait");
    const size = esVertical ? "1024x1792" : "1792x1024";

    // PASO 1: Generar escena con DALL-E (sin persona)
    const dalleRes = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: `${descripcion}, ${estilo} style, ${emocion} mood, cinematic dramatic lighting, ultra detailed, NO PEOPLE, NO FACES, NO PERSONS, clean background scene only`,
        n: 1,
        size,
        quality: "hd",
      }),
    });

    const dalleData = await dalleRes.json();
    if (!dalleRes.ok) throw new Error(dalleData.error?.message || "Error DALL-E");
    const dalleUrl = dalleData.data?.[0]?.url ?? "";

    const escenaUpload = await cloudinary.uploader.upload(dalleUrl, {
      folder: "thumbslatam-temp",
    });

    // PASO 2: FLUX PuLID genera retrato con tu cara (busto limpio)
    const retratoOutput: any = await replicate.run(
      "bytedance/flux-pulid:8baa7ef2255075b46f4d91cd238c21d31181b3e6a864463f967960bb0112525b",
      {
        input: {
          main_face_image: avatarBase64,
          prompt: `portrait photo of a person, ${emocion} expression, neutral background, face clearly visible, upper body, professional headshot, high quality`,
          negative_prompt: "ugly, blurry, low quality, deformed, back view, text, watermark, helmet, mask",
          width: 768,
          height: 1024,
          num_steps: 20,
          guidance_scale: 4,
          id_weight: 1.2,
          start_step: 0,
        }
      }
    );

    let retratoBuffer: Buffer | null = null;
    for (const item of retratoOutput) {
      if (item instanceof ReadableStream) {
        const reader = item.getReader();
        const chunks: Uint8Array[] = [];
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
        }
        retratoBuffer = Buffer.concat(chunks.map(c => Buffer.from(c)));
      }
    }

    if (!retratoBuffer) throw new Error("Error generando retrato");

    const retratoUpload = await cloudinary.uploader.upload(
      `data:image/jpeg;base64,${retratoBuffer.toString("base64")}`,
      { folder: "thumbslatam-temp" }
    );

    // PASO 3: Face swap — poner tu cara de FLUX en la escena de DALL-E
    const avatarUpload = await cloudinary.uploader.upload(avatarUrl, {
      folder: "thumbslatam-temp",
    });

    const faceSwapOutput: any = await replicate.run(
      "codeplugtech/face-swap:d5900f9ebed33e7ae08a07f17e0d98b4ebc68ab9528a70462afc3899cfe23bab",
      {
        input: {
          source_image: retratoUpload.secure_url,
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

    // Si face swap falla, usar el retrato de FLUX sobre la escena
    const imageToUpload = finalBuffer
      ? `data:image/jpeg;base64,${finalBuffer.toString("base64")}`
      : `data:image/jpeg;base64,${retratoBuffer.toString("base64")}`;

    const finalUpload = await cloudinary.uploader.upload(imageToUpload, {
      folder: "thumbslatam-generated"
    });

    return NextResponse.json({ imageUrl: finalUpload.secure_url });

  } catch (error: any) {
    console.error("generate-with-face error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
