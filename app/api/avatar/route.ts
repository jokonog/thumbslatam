import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { createClient } from "@supabase/supabase-js";

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
    const { userId, fotoPrincipalBase64 } = await request.json();

    const upload = await cloudinary.uploader.upload(fotoPrincipalBase64, {
      folder: "thumbslatam-avatars",
      public_id: `avatar-${userId}`,
      overwrite: true,
      transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }],
    });

    const { error } = await supabaseAdmin
      .from("usuarios")
      .update({ avatar_url: upload.secure_url })
      .eq("id", userId);

    if (error) throw new Error(error.message);

    return NextResponse.json({ avatarUrl: upload.secure_url });
  } catch (error: any) {
    console.error("Avatar error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
