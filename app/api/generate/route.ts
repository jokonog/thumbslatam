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

async function generarConKontext(prompt: string, imagenRef: string, aspectRatio: string): Promise<string> {
  const output: any = await replicate.run(
    "black-forest-labs/flux-kontext-max",
    {
      input: {
        prompt,
        input_image: imagenRef,
        aspect_ratio: aspectRatio,
      }
    }
  );
  const url = String(output);
  if (!url || !url.startsWith("http")) throw new Error("Kontext no genero imagen");
  const uploaded = await cloudinary.uploader.upload(url, { folder: "thumbslatam/fondos" });
  return uploaded.secure_url;
}

export async function POST(request: Request) {
  try {
    const { descripcion, estilo, emocion, orientacion, elementos, titulo, tituloModo } = await request.json();

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

    // Elementos con imagen subida
    const elementosConImagen = elementos ? elementos.filter((el: any) => el.imagen) : [];

    // Construir descripcion de elementos
    const elementosDesc = elementos ? elementos.map((el: any, i: number) => {
      const pos = i === 0 ? "left side" : i === 1 ? "center" : "right side";
      if (el.imagen) return `the reference image element placed on the ${pos}`;
      if (el.descripcion) return `${el.descripcion} on the ${pos}`;
      return null;
    }).filter(Boolean).join(", ") : "";

    const tituloDesc = tituloModo === "ia"
      ? `epic bold title text related to the scene integrated in the image`
      : tituloModo === "manual" && titulo
      ? `bold text saying "${titulo}" integrated in the image`
      : "NO TEXT, NO WORDS, NO LETTERS";

    const prompt1 = `Epic dramatic thumbnail scene, ${descripcion}${elementosDesc ? `, featuring ${elementosDesc}` : ""}, ${emocionEN} mood, vibrant colors, dramatic cinematic lighting, ultra detailed, ${tituloDesc}, NO LOGOS`;
    const prompt2 = `Cinematic thumbnail, ${descripcion}${elementosDesc ? `, featuring ${elementosDesc}` : ""}, ${emocionEN} atmosphere, dynamic composition, high contrast, vivid colors, ${tituloDesc}, NO LOGOS`;

    // Si hay imagenes subidas usar Kontext Max
    if (elementosConImagen.length > 0) {
      const imagenRef = elementosConImagen[0].imagen;
      const [imageUrl1, imageUrl2] = await Promise.all([
        generarConKontext(prompt1, imagenRef, aspectRatio),
        generarConKontext(prompt2, imagenRef, aspectRatio),
      ]);
      return NextResponse.json({ imageUrl: imageUrl1, variaciones: [imageUrl1, imageUrl2] });
    }

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
