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

    // FLUX Kontext Pro — genera al usuario en la escena en un solo paso
    const output: any = await replicate.run(
      "black-forest-labs/flux-kontext-pro",
      {
        input: {
          prompt: `Place this person in the following scene: ${descripcion}. The person should have a ${emocion} expression, ${estilo} style, cinematic dramatic lighting. Keep the person's face and identity exactly as in the reference photo. Face clearly visible, no mask, no helmet.`,
          input_image: usuarioData.avatar_url,
          aspect_ratio: aspectRatio,
        }
      }
    );

    // Kontext Pro devuelve un objeto URL de Node
    const imageUrl = String(output);
    console.log("Kontext imageUrl:", imageUrl);

    if (!imageUrl || !imageUrl.startsWith("http")) {
      console.log("Output tipo:", typeof output, "constructor:", output?.constructor?.name);
      return NextResponse.json({ error: "Error generando la imagen. Intenta de nuevo." }, { status: 500 });
    }
    }

    // Subir a Cloudinary
    const uploaded = await cloudinary.uploader.upload(imageUrl, {
      folder: "thumbslatam-generated"
    });

    return NextResponse.json({ imageUrl: uploaded.secure_url });

  } catch (error: any) {
    console.error("generate-with-face error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
