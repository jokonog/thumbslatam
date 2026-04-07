import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { dataUrl, userId } = await request.json();
    if (!dataUrl || !userId) return NextResponse.json({ error: "Faltan datos" }, { status: 400 });

    const upload = await cloudinary.uploader.upload(dataUrl, {
      folder: "thumbslatam/fondos",
    });

    await supabaseAdmin.from("miniatura").insert({
      usuario_id: userId,
      imagen_url: upload.secure_url,
    });

    return NextResponse.json({ ok: true, url: upload.secure_url });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
