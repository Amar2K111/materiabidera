import fs from "fs";
import sharp from "sharp";

const logo = "public/images/materiabtp-icon.png";
const source =
  "C:/Users/admin/.cursor/projects/c-Users-admin-Downloads-BIDERA-GOOD/assets/c__Users_admin_AppData_Roaming_Cursor_User_workspaceStorage_e7eb732d98fe4aca246374f218b8de94_images_ChatGPT_Image_11_sept._2026__19_08_54-9df14259-f4df-4e88-9aa0-d8dd5340e60b.jpg";

const sourceBuf = fs.readFileSync(source);
const sourceMeta = await sharp(sourceBuf).metadata();
const stackW = 1224;
const stackH = Math.round(stackW * (sourceMeta.height / sourceMeta.width));

const baseBuf = await sharp(sourceBuf).resize(stackW, stackH).png().toBuffer();

const outs = [
  ["materiabtp-assets/images/tech/stack.avif", stackW],
  ["materiabtp-assets/images/_r/tech/stack-480.avif", 480],
  ["materiabtp-assets/images/_r/tech/stack-640.avif", 640],
  ["materiabtp-assets/images/_r/tech/stack-960.avif", 960],
];

for (const [out, w] of outs) {
  const h = Math.round(w * (stackH / stackW));
  const lw = Math.round(w * 0.34);
  const lh = Math.round(lw * (342 / 1024));
  const logoBuf = await sharp(logo)
    .resize(lw, lh, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  const left = Math.round((w - lw) / 2);
  const top = Math.round(h * 0.055);

  await sharp(baseBuf)
    .resize(w, h)
    .composite([{ input: logoBuf, left, top }])
    .avif({ quality: 80 })
    .toFile(out);

  console.log("wrote", out);
}
