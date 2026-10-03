const mammoth = require("mammoth");

const extractTextFromFile = async (fileBuffer, mimeType) => {
  if (!fileBuffer) {
    throw new Error("Uploaded file buffer not found.");
  }

  if (mimeType === "application/pdf") {
    const { getDocument } = await import("pdfjs-serverless");

    const loadingTask = getDocument({
      data: new Uint8Array(fileBuffer),
      useSystemFonts: true,
    });

    const pdfDocument = await loadingTask.promise;
    const pages = [];

    for (
      let pageNumber = 1;
      pageNumber <= pdfDocument.numPages;
      pageNumber++
    ) {
      const page = await pdfDocument.getPage(pageNumber);
      const textContent = await page.getTextContent();

      const pageText = textContent.items
        .map((item) => item.str || "")
        .join(" ");

      pages.push(pageText);

      page.cleanup();
    }

    if (typeof loadingTask.destroy === "function") {
      await loadingTask.destroy();
    }

    return pages.join("\n").trim();
  }

  if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({
      buffer: fileBuffer,
    });

    return result.value.trim();
  }

  if (mimeType === "text/plain") {
    return Buffer.from(fileBuffer).toString("utf8").trim();
  }

  throw new Error(
    "Text extraction is currently supported for PDF, DOCX, and TXT files."
  );
};

module.exports = {
  extractTextFromFile,
};
