import Replicate from "replicate";
import fs from "fs";

const replicate = new Replicate({ auth: "r8_6zGNm31ynPeWtTw08waMOjUzmYC8snu48RbWD" });

const fotoBase64 = fs.readFileSync("/Users/anthrax/Downloads/IMG_0484.jpg", { encoding: "base64" });
const fotoUrl = `data:image/jpeg;base64,${fotoBase64}`;

console.log("Probando InstantID...");

const output = await replicate.run(
  "zsxkib/instant-id:491ddf5be6b827f8931f088ef10c6d015f6d99685e6454e6f04c8ac298979686",
  {
    input: {
      image: fotoUrl,
      prompt: "YouTube thumbnail, man in superhero suit, epic battle scene, cinematic lighting, dramatic, 16:9",
      negative_prompt: "ugly, blurry, low quality, deformed",
      width: 1280,
      height: 720,
      num_inference_steps: 30,
      guidance_scale: 5,
    }
  }
);

// Manejar stream o URL
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
    fs.writeFileSync("/Users/anthrax/Downloads/test-instantid-result.jpg", Buffer.from(arrayBuffer));
    console.log("Imagen guardada en: /Users/anthrax/Downloads/test-instantid-result.jpg");
  } else {
    console.log("URL:", item);
  }
}
