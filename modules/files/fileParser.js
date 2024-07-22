const XLSX = require("xlsx");
const fs = require("fs");
const { PDFDocument, rgb } = require("pdf-lib");

function base64ToBuffer(base64) {
  return Buffer.from(base64, "base64");
}

function parseExcelFile(base64) {
  const buffer = base64ToBuffer(base64);
  const workbook = XLSX.read(buffer, { type: "buffer" });
  return workbook;
}

async function generatePDFFromExcel(workbook) {
  const pdfDoc = await PDFDocument.create();

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    const page = pdfDoc.addPage([600, 800]);
    const { width, height } = page.getSize();

    page.drawText(`Sheet: ${sheetName}`, {
      x: 50,
      y: height - 50,
      size: 12,
      color: rgb(0, 0, 0),
    });

    let y = height - 70;
    data.forEach((row) => {
      page.drawText(row.join(" "), {
        x: 50,
        y: y,
        size: 10,
        color: rgb(0, 0, 0),
      });
      y -= 20;

      // Ajustar a posição se a página estiver cheia
      if (y < 50) {
        page = pdfDoc.addPage([600, 800]);
        y = height - 50;
      }
    });
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes).toString("base64"); // Converte PDF bytes para Base64
}

class FileExcel {
  async initialize(base64) {
    const workbook = parseExcelFile(base64);
    const pdfBase64 = await generatePDFFromExcel(workbook);
    return pdfBase64;
  }
}

class FileExcel {
  async initialize(base64) {
    const workbook = parseExcelFile(base64);
    const pdfBase64 = await generatePDFFromExcel(workbook);
    return pdfBase64;
  }
}

class FileDocx {}

module.exports = { FileExcel, FileDocx };
