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
    const { userId, fotosBase64 } = await request.json();

    // Obtener fotos existentes
    const { data: usuarioData } = await supabaseAdmin
      .from("usuarios")
      .select("avatar_fotos")
      .eq("id", userId)
      .single();

    const fotosExistentes: string[] = usuarioData?.avatar_fotos || [];

    // Subir fotos nuevas a Cloudinary
    const uploads = await Promise.all(
      fotosBase64.map((foto: string, i: number) =>
        cloudinary.uploader.upload(foto, {
          folder: "thumbslatam-avatars",
          public_id: `avatar-${userId}-${Date.now()}-${i}`,
          transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }],
        })
      )
    );

    const fotosNuevas = uploads.map(u => u.secure_url);

    // Combinar existentes + nuevas, máximo 5
    const todasLasFotos = [...fotosExistentes, ...fotosNuevas].slice(0, 5);
    const avatarUrl = fotosNuevas[0]; // la primera nueva es la principal

    await supabaseAdmin
      .from("usuarios")
      .update({ avatar_url: avatarUrl, avatar_fotos: todasLasFotos })
      .eq("id", userId);

    return NextResponse.json({ avatarUrl, todasLasFotos });
  } catch (error: any) {
    console.error("Avatar error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { userId, avatarUrl, avatar_fotos } = await request.json();
    const updates: any = { avatar_url: avatarUrl };
    if (avatar_fotos !== undefined) updates.avatar_fotos = avatar_fotos;
    await supabaseAdmin
      .from("usuarios")
      .update(updates)
      .eq("id", userId);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
