import Replicate from "replicate";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: "dgzlajqex",
  api_key: "193984114575619",
  api_secret: "c-9RJ3KL_evEueZP_cuwTwYITCo",
});

const replicate = new Replicate({ auth: "r8_6zGNm31ynPeWtTw08waMOjUzmYC8snu48RbWD" });

const fotoBase64 = fs.readFileSync("/Users/anthrax/Downloads/IMG_0484.jpg", { encoding: "base64" });
const fotoUrl = `data:image/jpeg;base64,${fotoBase64}`;

console.log("Paso 1: Generando escena medieval...");

const escena = await replicate.run(
  "bytedance/flux-pulid:8baa7ef2255075b46f4d91cd238c21d31181b3e6a864463f967960bb0112525b",
  {
    input: {
      main_face_image: fotoUrl,
      prompt: "YouTube thumbnail, epic medieval warrior facing camera directly, full front view face visible, holding sword, castle burning in background, dramatic cinematic lighting, heroic pose, 16:9 wide, close up portrait",
      negative_prompt: "ugly, blurry, low quality, deformed, back view, rear view, looking away, turned away, modern clothes",
      width: 1280,
      height: 720,
      num_steps: 20,
      guidance_scale: 4,
      id_weight: 1.0,
      start_step: 4,
    }
  }
);

let escenaBuffer;
for (const item of escena) {
  if (item instanceof ReadableStream) {
    const reader = item.getReader();
    const chunks = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    escenaBuffer = Buffer.concat(chunks.map(c => Buffer.from(c)));
    fs.writeFileSync("/Users/anthrax/Downloads/test-medieval-escena.jpg", escenaBuffer);
    console.log("Escena guardada!");
  }
}

console.log("Paso 2: Haciendo face swap...");

const fotoUpload = await cloudinary.uploader.upload("/Users/anthrax/Downloads/IMG_0484.jpg", { folder: "thumbslatam-test" });
const escenaUpload = await cloudinary.uploader.upload("/Users/anthrax/Downloads/test-medieval-escena.jpg", { folder: "thumbslatam-test" });

const output = await replicate.run(
  "codeplugtech/face-swap:d5900f9ebed33e7ae08a07f17e0d98b4ebc68ab9528a70462afc3899cfe23bab",
  {
    input: {
      source_image: fotoUpload.secure_url,
      target_image: escenaUpload.secure_url,
    }
  }
);

if (output?.image instanceof ReadableStream) {
  const reader = output.image.getReader();
  const chunks = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  const buffer = Buffer.concat(chunks.map(c => Buffer.from(c)));
  fs.writeFileSync("/Users/anthrax/Downloads/test-medieval-final.jpg", buffer);
  console.log("Resultado final guardado!");
}
