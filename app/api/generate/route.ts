import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  const { descripcion, estilo, emocion } = await request.json();

  const prompt = `YouTube thumbnail for a Latin American content creator. 
  Video about: ${descripcion}. 
  Style: ${estilo}. 
  Emotion: ${emocion}. 
  Vibrant colors, dramatic lighting, 16:9 format, professional quality, 
  eye-catching design, bold composition.`;

  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: prompt,
    n: 1,
    size: "1792x1024",
    quality: "hd",
  });

  const imageUrl = response.data?.[0]?.url ?? "";
  return NextResponse.json({ imageUrl });
}