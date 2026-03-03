import ExcelJS from "exceljs";
import type {
  SkuMaster,
  InboundTransaction,
  OutboundTransaction,
  StocktakeRecord,
} from "./types";

interface LoadedData {
  skuMaster: SkuMaster[];
  inbound: InboundTransaction[];
  outbound: OutboundTransaction[];
  stocktake: StocktakeRecord[];
}

function cellStr(cell: ExcelJS.Cell): string {
  return String(cell.value ?? "").trim();
}

function cellNum(cell: ExcelJS.Cell): number {
  const v = cell.value;
  if (typeof v === "number") return v;
  const n = Number(v);
  return isNaN(n) ? 0 : n;
}

function cellDate(cell: ExcelJS.Cell): Date {
  const v = cell.value;
  if (v instanceof Date) return v;
  const d = new Date(String(v));
  if (!isNaN(d.getTime())) return d;
  throw new Error(`Cannot parse date: ${v}`);
}

export async function loadWorkbook(filePath: string): Promise<LoadedData> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(filePath);

  const skuMaster = parseSkuMaster(wb);
  const inbound = parseInbound(wb);
  const outbound = parseOutbound(wb);
  const stocktake = parseStocktake(wb);

  return { skuMaster, inbound, outbound, stocktake };
}

function parseSkuMaster(wb: ExcelJS.Workbook): SkuMaster[] {
  const ws = wb.getWorksheet("SKU_MASTER");
  if (!ws) throw new Error("Sheet SKU_MASTER not found");

  const rows: SkuMaster[] = [];
  ws.eachRow((row, rowNum) => {
    if (rowNum === 1) return; // header
    const sku = cellStr(row.getCell(1));
    if (!sku) return;
    rows.push({
      sku,
      jan: cellStr(row.getCell(2)),
      productName: cellStr(row.getCell(3)),
      standardCost: cellNum(row.getCell(4)) || undefined,
    });
  });
  return rows;
}

function parseInbound(wb: ExcelJS.Workbook): InboundTransaction[] {
  const ws = wb.getWorksheet("IN_TX");
  if (!ws) throw new Error("Sheet IN_TX not found");

  const rows: InboundTransaction[] = [];
  ws.eachRow((row, rowNum) => {
    if (rowNum === 1) return;
    const sku = cellStr(row.getCell(3));
    if (!sku) return;
    rows.push({
      date: cellDate(row.getCell(1)),
      partner: cellStr(row.getCell(2)),
      sku,
      quantity: cellNum(row.getCell(4)),
      docNo: cellStr(row.getCell(5)),
    });
  });
  return rows;
}

function parseOutbound(wb: ExcelJS.Workbook): OutboundTransaction[] {
  const ws = wb.getWorksheet("OUT_TX");
  if (!ws) throw new Error("Sheet OUT_TX not found");

  const rows: OutboundTransaction[] = [];
  ws.eachRow((row, rowNum) => {
    if (rowNum === 1) return;
    const sku = cellStr(row.getCell(3));
    if (!sku) return;
    rows.push({
      date: cellDate(row.getCell(1)),
      partner: cellStr(row.getCell(2)),
      sku,
      quantity: cellNum(row.getCell(4)),
      docNo: cellStr(row.getCell(5)),
    });
  });
  return rows;
}

function parseStocktake(wb: ExcelJS.Workbook): StocktakeRecord[] {
  const ws = wb.getWorksheet("STOCKTAKE");
  if (!ws) throw new Error("Sheet STOCKTAKE not found");

  const rows: StocktakeRecord[] = [];
  ws.eachRow((row, rowNum) => {
    if (rowNum === 1) return;
    const sku = cellStr(row.getCell(3));
    if (!sku) return;
    rows.push({
      month: cellStr(row.getCell(1)), // expects "YYYY-MM"
      partner: cellStr(row.getCell(2)),
      sku,
      physicalQuantity: cellNum(row.getCell(4)),
    });
  });
  return rows;
}
