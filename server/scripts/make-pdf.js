const fs = require("fs");
const path = require("path");

/*
 * Minimal text-only PDF writer used to generate test CV fixtures.
 * Produces standard Helvetica text that pdfjs can extract.
 */

const escapePdfText = (value) =>
  String(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

const buildContentStream = (lines) => {
  const parts = ["BT", "/F1 9 Tf", "12 TL", "48 748 Td"];

  lines.forEach((line, index) => {
    if (index > 0) {
      parts.push("T*");
    }

    parts.push(`(${escapePdfText(line)}) Tj`);
  });

  parts.push("ET");

  return parts.join("\n");
};

const createPdf = (lines) => {
  const PAGE_HEIGHT = 792;
  const FONT_SIZE = 9;
  const LINE_HEIGHT = 11;
  const TOP_MARGIN = 748;
  const BOTTOM_LIMIT = 54;

  const linesPerPage = Math.floor(
    (TOP_MARGIN - BOTTOM_LIMIT) / LINE_HEIGHT
  );

  const pages = [];

  for (
    let i = 0;
    i < Math.max(1, lines.length);
    i += linesPerPage
  ) {
    pages.push(lines.slice(i, i + linesPerPage));
  }

  const objects = [];

  const pageCount = pages.length;
  const firstPageObj = 4;
  const kids = pages
    .map((_, index) => `${firstPageObj + index * 2} 0 R`)
    .join(" ");

  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[2] = `<< /Type /Pages /Kids [${kids}] /Count ${pageCount} >>`;

  pages.forEach((pageLines, pageIndex) => {
    const pageObjNum = firstPageObj + pageIndex * 2;
    const contentObjNum = pageObjNum + 1;

    objects[pageObjNum] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 ${PAGE_HEIGHT}] ` +
      `/Contents ${contentObjNum} 0 R ` +
      `/Resources << /Font << /F1 ${4 + pageCount * 2} 0 R >> >> >>`;

    const stream = buildContentStream(pageLines);

    objects[contentObjNum] =
      `<< /Length ${Buffer.byteLength(stream, "latin1")} >>\n` +
      `stream\n${stream}\nendstream`;
  });

  const fontObjNum = 4 + pageCount * 2;
  objects[fontObjNum] =
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>";

  const header = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
  let body = header;
  const offsets = [];

  for (let num = 1; num < objects.length; num += 1) {
    if (!objects[num]) {
      continue;
    }

    offsets[num] = Buffer.byteLength(body, "latin1");

    body += `${num} 0 obj\n${objects[num]}\nendobj\n`;
  }

  const xrefOffset = Buffer.byteLength(body, "latin1");
  const maxObj = objects.length;

  let xref = `xref\n0 ${maxObj}\n0000000000 65535 f \n`;

  for (let num = 1; num < maxObj; num += 1) {
    const offset = offsets[num];

    if (offset === undefined) {
      xref += "0000000000 65535 f \n";
    } else {
      xref += `${String(offset).padStart(10, "0")} 00000 n \n`;
    }
  }

  const trailer =
    `trailer\n<< /Size ${maxObj} /Root 1 0 R >>\n` +
    `startxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(body + xref + trailer, "latin1");
};

const outputDir = path.join(__dirname, "fixtures");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

module.exports = { createPdf, outputDir };
