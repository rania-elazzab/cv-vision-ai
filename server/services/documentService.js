const fs = require("fs");
const { PDFParse } = require("pdf-parse");
const mammoth = require("mammoth");

const extractTextFromFile = async (filePath, mimeType) => {
  if (!fs.existsSync(filePath)) {
    throw new Error("Uploaded file not found.");
  }

  if (mimeType === "application/pdf") {
    const buffer = fs.readFileSync(filePath);

    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();

    await parser.destroy();

    return result.text.trim();
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
    "Text extraction is currently supported for PDF and DOCX files."
  );
};

module.exports = {
  extractTextFromFile,
};
