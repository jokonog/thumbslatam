import Replicate from "replicate";
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request: Request) {
  try {
    const { descripcion, estilo, emocion, formato, fotosBase64 } = await request.json();
    const uploads = await Promise.all(
      fotosBase64.map((foto: string) =>
        cloudinary.uploader.upload(foto, { folder: "thumbslatam" })
      )
    );
    const urls = uploads.map((u) => u.secure_url);
    console.log("Fotos subidas:", urls.length);
    const prompt = `Professional YouTube thumbnail 16:9, ${descripcion}, ${estilo} style, ${emocion} expression, dramatic cinematic lighting, ultra realistic, sharp focus, full body shot, dynamic pose img`;
    const output: any = await replicate.run(
      "tencentarc/photomaker:ddfc2b08d209f9fa8c1eca692712918bd449f695dabb4a958da31802a9570fe4",
      {
        input: {
          prompt: prompt,
          input_image: urls[0],
          input_image2: urls[1] || urls[0],
          input_image3: urls[2] || urls[0],
          input_image4: urls[3] || urls[0],
          negative_prompt: "ugly, blurry, low quality, distorted face, deformed hands, extra fingers, text, watermark, logo, words, letters, bad anatomy, disfigured, mutated",
          style_name: "Photographic (Default)",
          num_outputs: 1,
          guidance_scale: 7.5,
          num_inference_steps: 35,
          style_strength_ratio: 35,
        }
      }
    );
    const imageUrl = output[0]?.url?.() || output[0] || output?.images?.[0] || output;
    return NextResponse.json({ imageUrl });
  } catch (error: any) {
    console.error("ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
