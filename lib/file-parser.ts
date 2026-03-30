import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import WordExtractor from "word-extractor";

export async function parseUploadedFile(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase();
  const buffer = Buffer.from(await file.arrayBuffer());

  if (!ext) {
    throw new Error("无法识别文件扩展名");
  }

  if (ext === "txt") {
    return buffer.toString("utf-8");
  }

  if (ext === "docx") {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  if (ext === "pdf") {
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    await parser.destroy();
    return result.text;
  }

  if (ext === "doc") {
    const extractor = new WordExtractor();
    const tempPath = path.join(os.tmpdir(), `${randomUUID()}.doc`);

    await fs.writeFile(tempPath, buffer);
    try {
      const document = await extractor.extract(tempPath);
      return document.getBody();
    } finally {
      await fs.unlink(tempPath).catch(() => {
        return undefined;
      });
    }
  }

  throw new Error("仅支持 txt、doc、docx、pdf 文件");
}
