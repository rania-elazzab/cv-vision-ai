const fs = require("fs");
const { getDocument } = require("pdfjs-serverless");
const mammoth = require("mammoth");

const extractTextFromFile = async (filePath, mimeType) => {
  if (!fs.existsSync(filePath)) {
    throw new Error("Uploaded file not found.");
  }

  if (mimeType === "application/pdf") {
    const buffer = fs.readFileSync(filePath);

    const loadingTask = getDocument({
      data: new Uint8Array(buffer),
      useSystemFonts: true,
    });

    const pdfDocument = await loadingTask.promise;
    const pages = [];

    for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber++) {
      const page = await pdfDocument.getPage(pageNumber);
      const textContent = await page.getTextContent();

      const pageText = textContent.items
        .map((item) => item.str || "")
        .join(" ");

      pages.push(pageText);
      page.cleanup();
    }

    await loadingTask.destroy();

    return pages.join("\n").trim();
  }

  if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({
      path: filePath,
    });

    return result.value.trim();
  }

  if (mimeType === "text/plain") {
    return fs.readFileSync(filePath, "utf8").trim();
  }

  throw new Error(
    "Text extraction is currently supported for PDF, DOCX, and TXT files."
  );
};

module.exports = {
  extractTextFromFile,
};
