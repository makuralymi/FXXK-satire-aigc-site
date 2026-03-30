export async function parseUploadedFile(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase();
  const buffer = await file.arrayBuffer();

  if (!ext) {
    throw new Error("无法识别文件扩展名");
  }

  if (ext === "txt") {
    return new TextDecoder("utf-8").decode(buffer);
  }

  throw new Error("Cloudflare Worker 模式当前仅支持 txt 文件");
}
