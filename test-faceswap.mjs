import Replicate from "replicate";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: "dgzlajqex",
  api_key: "193984114575619",
  api_secret: "c-9RJ3KL_evEueZP_cuwTwYITCo",
});

const replicate = new Replicate({ auth: "r8_6zGNm31ynPeWtTw08waMOjUzmYC8snu48RbWD" });

console.log("Subiendo imágenes a Cloudinary...");

const fotoUpload = await cloudinary.uploader.upload("/Users/anthrax/Downloads/IMG_0484.jpg", { folder: "thumbslatam-test" });
const resultadoUpload = await cloudinary.uploader.upload("/Users/anthrax/Downloads/test-flux-result.jpg", { folder: "thumbslatam-test" });

console.log("Probando face-swap...");

const output = await replicate.run(
  "codeplugtech/face-swap:d5900f9ebed33e7ae08a07f17e0d98b4ebc68ab9528a70462afc3899cfe23bab",
  {
    input: {
      source_image: fotoUpload.secure_url,
      target_image: resultadoUpload.secure_url,
    }
  }
);

// Leer el stream de la imagen
if (output?.image instanceof ReadableStream) {
  const reader = output.image.getReader();
  const chunks = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  const buffer = Buffer.concat(chunks.map(c => Buffer.from(c)));
  fs.writeFileSync("/Users/anthrax/Downloads/test-faceswap-result.jpg", buffer);
  console.log("Guardado en: /Users/anthrax/Downloads/test-faceswap-result.jpg");
} else {
  console.log("Output inesperado:", output);
}
