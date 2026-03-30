import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function generarImagen(prompt: string, size: string): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({ model: "dall-e-3", prompt, n: 1, size, quality: "hd" }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || "Error OpenAI");
  const dalleUrl = data.data?.[0]?.url ?? "";
  const uploaded = await cloudinary.uploader.upload(dalleUrl, { folder: "thumbslatam/fondos" });
  return uploaded.secure_url;
}

export async function POST(request: Request) {
  try {
    const { descripcion, estilo, emocion, orientacion } = await request.json();
    const esVertical = orientacion?.includes("vertical");
    const aspectRatio = esVertical
      ? "9:16 vertical portrait format, tall narrow composition, mobile screen format"
      : "16:9 horizontal landscape format, wide cinematic composition";
    const size = esVertical ? "1024x1792" : "1792x1024";

    const prompt1 = `Epic dramatic scene, ${descripcion}, ${estilo} style, ${emocion} mood, vibrant colors, dramatic cinematic lighting, ultra detailed, ${aspectRatio}, NO TEXT, NO WORDS, NO LETTERS, NO LOGOS, clean background only`;
    const prompt2 = `Cinematic ${descripcion}, ${estilo} aesthetic, ${emocion} atmosphere, dynamic composition, professional photography, high contrast, vivid colors, ${aspectRatio}, NO TEXT, NO WORDS, NO LETTERS, NO LOGOS, clean background only`;

    const [imageUrl1, imageUrl2] = await Promise.all([
      generarImagen(prompt1, size),
      generarImagen(prompt2, size),
    ]);

    return NextResponse.json({ imageUrl: imageUrl1, variaciones: [imageUrl1, imageUrl2] });
  } catch (error: any) {
    console.error("ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
