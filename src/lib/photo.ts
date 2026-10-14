const SIZE = 192;
const QUALITY = 0.82;
const MAX_CHARS = 120_000;

export async function compressPhoto(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("无法处理图片");
  const scale = Math.max(SIZE / bitmap.width, SIZE / bitmap.height);
  const w = bitmap.width * scale;
  const h = bitmap.height * scale;
  ctx.fillStyle = "#17241c";
  ctx.fillRect(0, 0, SIZE, SIZE);
  ctx.drawImage(bitmap, (SIZE - w) / 2, (SIZE - h) / 2, w, h);
  bitmap.close();
  const dataUrl = canvas.toDataURL("image/jpeg", QUALITY);
  if (dataUrl.length > MAX_CHARS) {
    const tighter = canvas.toDataURL("image/jpeg", 0.6);
    if (tighter.length > MAX_CHARS) throw new Error("图片太大，请换一张");
    return tighter;
  }
  return dataUrl;
}
