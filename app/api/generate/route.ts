import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const OPENAI_KEY = "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";

export async function POST(request: Request) {
  try {
    const { descripcion, estilo, emocion, orientacion } = await request.json();
    const esVertical = orientacion?.includes("vertical");
    const aspectRatio = esVertical
      ? "9:16 vertical portrait format, tall narrow composition, mobile screen format"
      : "16:9 horizontal landscape format, wide cinematic composition";
    const size = esVertical ? "1024x1792" : "1792x1024";
    const prompt = `Epic dramatic scene, ${descripcion}, ${estilo} style, ${emocion} mood, vibrant colors, dramatic cinematic lighting, ultra detailed, ${aspectRatio}, NO TEXT, NO WORDS, NO LETTERS, NO LOGOS, clean background only`;

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_KEY}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt,
        n: 1,
        size,
        quality: "hd",
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error("OpenAI error:", JSON.stringify(data));
      return NextResponse.json({ error: data.error?.message || "Error OpenAI" }, { status: 500 });
    }

    const dalleUrl = data.data?.[0]?.url ?? "";
    const uploaded = await cloudinary.uploader.upload(dalleUrl, {
      folder: "thumbslatam/fondos",
    });

    return NextResponse.json({ imageUrl: uploaded.secure_url });
  } catch (error: any) {
    console.error("ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
