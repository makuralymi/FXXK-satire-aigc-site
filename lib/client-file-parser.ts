type ParsedUpload = {
  ext: string;
  text: string;
};

function getExt(fileName: string): string {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

export async function parseFileInBrowser(file: File): Promise<ParsedUpload> {
  const ext = getExt(file.name);

  if (!ext) {
    throw new Error("无法识别文件扩展名");
  }

  if (ext === "doc") {
    throw new Error("doc 暂不支持，请先另存为 docx 后上传");
  }

  if (ext === "txt") {
    return {
      ext,
      text: (await file.text()).trim(),
    };
  }

  if (ext === "docx") {
    const mammoth = await import("mammoth/mammoth.browser");
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });

    return {
      ext,
      text: result.value.trim(),
    };
  }

  if (ext === "pdf") {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const data = new Uint8Array(await file.arrayBuffer());
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
      import.meta.url,
    ).toString();
    const loadingTask = pdfjs.getDocument({ data });
    const pdf = await loadingTask.promise;

    const pages: string[] = [];
    for (let i = 1; i <= pdf.numPages; i += 1) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item) => ("str" in item ? String(item.str) : ""))
        .join(" ")
        .trim();

      if (pageText) {
        pages.push(pageText);
      }
    }

    return {
      ext,
      text: pages.join("\n\n").trim(),
    };
  }

  throw new Error("仅支持 txt、docx、pdf 文件");
}
