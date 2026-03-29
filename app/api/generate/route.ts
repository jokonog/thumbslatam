import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const key = process.env.OPENAI_API_KEY;
    console.log("KEY inicio:", key?.slice(0, 8), "len:", key?.length);

    const { default: OpenAI } = await import("openai");
    const openai = new OpenAI({ apiKey: key });

    const { descripcion, estilo, emocion, orientacion } = await request.json();
    const esVertical = orientacion?.includes("vertical");
    const aspectRatio = esVertical
      ? "9:16 vertical portrait format, tall narrow composition, mobile screen format"
      : "16:9 horizontal landscape format, wide cinematic composition";
    const size = esVertical ? "1024x1792" : "1792x1024";
    const prompt = `Epic dramatic scene, ${descripcion}, ${estilo} style, ${emocion} mood, vibrant colors, dramatic cinematic lighting, ultra detailed, ${aspectRatio}, NO TEXT, NO WORDS, NO LETTERS, NO LOGOS, clean background only`;

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: size as "1024x1792" | "1792x1024",
      quality: "hd",
    });

    const dalleUrl = response.data?.[0]?.url ?? "";
    const uploaded = await cloudinary.uploader.upload(dalleUrl, {
      folder: "thumbslatam/fondos",
    });

    return NextResponse.json({ imageUrl: uploaded.secure_url });
  } catch (error: any) {
    console.error("ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
