import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { descripcion, estilo, emocion } = await request.json();

    const prompt = `Epic dramatic scene, ${descripcion}, ${estilo} style, ${emocion} mood, vibrant colors, dramatic cinematic lighting, ultra detailed, 16:9, NO TEXT, NO WORDS, NO LETTERS, NO LOGOS, clean background only`;

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1792x1024",
      quality: "hd",
    });

    const imageUrl = response.data?.[0]?.url ?? "";
    return NextResponse.json({ imageUrl });

  } catch (error: any) {
    console.error("ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}