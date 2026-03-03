import ExcelJS from "exceljs";
import type { BridgeRow } from "./types";

export async function writeBridgeSheet(
  rows: BridgeRow[],
  targetMonth: string,
  partner: string,
  outputPath: string
): Promise<void> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("BRIDGE_QUANTITY");

  // Header row
  ws.addRow([
    "SKU",
    "Product Name",
    "Opening Qty",
    "Inbound",
    "Outbound",
    "Theoretical Qty",
    "Physical Qty",
    "Variance",
  ]);

  const headerRow = ws.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFD9E1F2" },
  };

  // Data rows
  for (const row of rows) {
    const excelRow = ws.addRow([
      row.sku,
      row.productName,
      row.openingQty,
      row.inbound,
      row.outbound,
      row.theoreticalQty,
      row.physicalQty,
      row.variance,
    ]);

    // Highlight non-zero variance
    if (row.variance !== 0) {
      const varianceCell = excelRow.getCell(8);
      varianceCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: row.variance > 0 ? "FFFFF2CC" : "FFFCE4D6" },
      };
      varianceCell.font = { bold: true };
    }
  }

  // Auto-fit column widths (approximate)
  ws.columns = [
    { key: "sku", width: 20 },
    { key: "productName", width: 30 },
    { key: "openingQty", width: 14 },
    { key: "inbound", width: 12 },
    { key: "outbound", width: 12 },
    { key: "theoreticalQty", width: 18 },
    { key: "physicalQty", width: 14 },
    { key: "variance", width: 12 },
  ];

  // Metadata sheet
  const meta = wb.addWorksheet("META");
  meta.addRow(["Partner", partner]);
  meta.addRow(["Month", targetMonth]);
  meta.addRow(["Generated", new Date().toISOString()]);

  await wb.xlsx.writeFile(outputPath);
}
