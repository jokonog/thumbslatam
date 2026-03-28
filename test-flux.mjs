import Replicate from "replicate";
import fs from "fs";

const replicate = new Replicate({ auth: "r8_6zGNm31ynPeWtTw08waMOjUzmYC8snu48RbWD" });

const fotoBase64 = fs.readFileSync("/Users/anthrax/Downloads/IMG_0484.jpg", { encoding: "base64" });
const fotoUrl = `data:image/jpeg;base64,${fotoBase64}`;

console.log("Probando FLUX PuLID...");

const output = await replicate.run(
  "bytedance/flux-pulid:8baa7ef2255075b46f4d91cd238c21d31181b3e6a864463f967960bb0112525b",
  {
    input: {
      main_face_image: fotoUrl,
      prompt: "YouTube thumbnail, man in superhero suit, epic battle scene, cinematic lighting, dramatic, facing camera",
      negative_prompt: "ugly, blurry, low quality, deformed, elongated face",
      width: 1280,
      height: 720,
      num_steps: 20,
      guidance_scale: 4,
      id_weight: 1.0,
      start_step: 4,
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
    fs.writeFileSync("/Users/anthrax/Downloads/test-flux-result.jpg", Buffer.from(arrayBuffer));
    console.log("Imagen guardada en: /Users/anthrax/Downloads/test-flux-result.jpg");
  } else {
    console.log("URL:", item);
  }
}
