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
    const { descripcion, estilo, emocion, orientacion, elementos, titulo, tituloModo, userId } = await request.json();

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

    // Separar elementos con avatar de los que tienen imagen subida o descripcion
    const avatarElemento = elementos ? elementos.find((el: any) => el.usarAvatar && el.imagen) : null;

    // Construir descripcion de todos los elementos
    const posiciones = ["left side", "center", "right side"];
    const elementosDesc = elementos ? elementos.map((el: any, i: number) => {
      const pos = posiciones[i];
      if (el.usarAvatar) return `the main person (reference photo) on the ${pos}`;
      if (el.imagen && el.descripcion) return `${el.descripcion} on the ${pos}`;
      if (el.imagen) return `a person or character from the reference on the ${pos}`;
      if (el.descripcion) return `${el.descripcion} on the ${pos}`;
      return null;
    }).filter(Boolean).join(", ") : "";

    const tituloDesc = tituloModo === "ia"
      ? `with epic bold title text related to the scene`
      : tituloModo === "manual" && titulo
      ? `with bold text saying "${titulo}" at the top`
      : "no text, no words, no letters";

    const prompt1 = `Epic dramatic YouTube thumbnail, ${descripcion}, ${elementosDesc ? `composition: ${elementosDesc},` : ""} ${emocionEN} mood, vibrant colors, dramatic cinematic lighting, ultra detailed, ${tituloDesc}, no logos`;
    const prompt2 = `Cinematic YouTube thumbnail, ${descripcion}, ${elementosDesc ? `composition: ${elementosDesc},` : ""} ${emocionEN} atmosphere, dynamic composition, high contrast, vivid colors, ${tituloDesc}, no logos`;

    // Si hay avatar usar Kontext Max
    if (avatarElemento) {
      const [imageUrl1, imageUrl2] = await Promise.all([
        generarConKontext(prompt1, avatarElemento.imagen, aspectRatio),
        generarConKontext(prompt2, avatarElemento.imagen, aspectRatio),
      ]);
      return NextResponse.json({ imageUrl: imageUrl1, variaciones: [imageUrl1, imageUrl2] });
    }

    // Sin avatar usar FLUX 1.1 Pro
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
