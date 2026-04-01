import { NextResponse } from "next/server";
import Replicate from "replicate";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

async function generarImagen(prompt: string, aspectRatio: string): Promise<string> {
  const output: any = await replicate.run(
    "black-forest-labs/flux-1.1-pro",
    {
      input: {
        prompt,
        aspect_ratio: aspectRatio,
        output_format: "jpg",
        output_quality: 95,
        safety_tolerance: 5,
      }
    }
  );
  const fluxUrl = String(output);
  if (!fluxUrl || !fluxUrl.startsWith("http")) throw new Error("FLUX no genero imagen");
  const uploaded = await cloudinary.uploader.upload(fluxUrl, { folder: "thumbslatam/fondos" });
  return uploaded.secure_url;
}

export async function POST(request: Request) {
  try {
    const { descripcion, estilo, emocion, orientacion } = await request.json();
    const emocionMap: Record<string, string> = {
      epico: "epic, powerful, intense",
      emocionado: "excited, energetic, enthusiastic",
      sorprendido: "surprised, shocked, amazed",
      gracioso: "funny, playful, humorous",
      misterioso: "mysterious, dark, enigmatic",
      serio: "serious, focused, determined",
    };
    const emocionEN = emocionMap[emocion] || emocion;
    const esVertical = orientacion?.includes("vertical");
    const aspectRatio = esVertical ? "9:16" : "16:9";

    const prompt1 = `Epic dramatic scene, ${descripcion}, ${estilo} style, ${emocionEN} mood, vibrant colors, dramatic cinematic lighting, ultra detailed, NO TEXT, NO WORDS, NO LETTERS, NO LOGOS, clean background only`;
    const prompt2 = `Cinematic ${descripcion}, ${estilo} aesthetic, ${emocionEN} atmosphere, dynamic composition, professional photography, high contrast, vivid colors, NO TEXT, NO WORDS, NO LETTERS, NO LOGOS, clean background only`;

    const [imageUrl1, imageUrl2] = await Promise.all([
      generarImagen(prompt1, aspectRatio),
      generarImagen(prompt2, aspectRatio),
    ]);

    return NextResponse.json({ imageUrl: imageUrl1, variaciones: [imageUrl1, imageUrl2] });
  } catch (error: any) {
    console.error("ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
