import Replicate from "replicate";
import fs from "fs";

const replicate = new Replicate({ auth: "r8_6zGNm31ynPeWtTw08waMOjUzmYC8snu48RbWD" });

const fotoBase64 = fs.readFileSync("/Users/anthrax/Downloads/IMG_0484.jpg", { encoding: "base64" });
const fotoUrl = `data:image/jpeg;base64,${fotoBase64}`;

console.log("Probando Photomaker mejorado...");

const output = await replicate.run(
  "tencentarc/photomaker:ddfc2b08d209f9fa8c1eca692712918bd449f695dabb4a958da31802a9570fe4",
  {
    input: {
      prompt: "Professional YouTube thumbnail 16:9, man img wearing superman suit, epic battle scene with fire, cinematic dramatic lighting, ultra realistic, sharp focus, full body shot, dynamic pose, 4k",
      input_image: fotoUrl,
      input_image2: fotoUrl,
      negative_prompt: "ugly, blurry, low quality, distorted face, deformed, watermark, text",
      style_name: "Photographic (Default)",
      num_outputs: 1,
      guidance_scale: 7.5,
      num_inference_steps: 35,
      style_strength_ratio: 20,
    }
  }
);

for (const item of output) {
  if (item instanceof ReadableStream) {
    const reader = item.getReader();
    const chunks = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    const blob = new Blob(chunks);
    const arrayBuffer = await blob.arrayBuffer();
    fs.writeFileSync("/Users/anthrax/Downloads/test-photomaker-result.jpg", Buffer.from(arrayBuffer));
    console.log("Guardado en: /Users/anthrax/Downloads/test-photomaker-result.jpg");
  } else {
    console.log("URL:", item);
  }
}
