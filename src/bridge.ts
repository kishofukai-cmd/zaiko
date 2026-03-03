import type {
  SkuMaster,
  InboundTransaction,
  OutboundTransaction,
  StocktakeRecord,
  BridgeRow,
} from "./types";

function toYearMonth(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function previousMonth(yearMonth: string): string {
  const [y, m] = yearMonth.split("-").map(Number);
  const d = new Date(y, m - 1 - 1, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function calculateBridge(
  targetMonth: string, // "YYYY-MM"
  partner: string,
  skuMaster: SkuMaster[],
  inbound: InboundTransaction[],
  outbound: OutboundTransaction[],
  stocktake: StocktakeRecord[]
): BridgeRow[] {
  const prevMonth = previousMonth(targetMonth);

  const skuMap = new Map<string, SkuMaster>(skuMaster.map((s) => [s.sku, s]));

  // All SKUs relevant to this partner across all data sources
  const allSkus = new Set<string>([
    ...inbound.filter((t) => t.partner === partner).map((t) => t.sku),
    ...outbound.filter((t) => t.partner === partner).map((t) => t.sku),
    ...stocktake
      .filter((r) => r.partner === partner && r.month === targetMonth)
      .map((r) => r.sku),
  ]);

  const rows: BridgeRow[] = [];

  for (const sku of allSkus) {
    const master = skuMap.get(sku);

    // Opening: previous month physical count for this partner/SKU
    const openingRecord = stocktake.find(
      (r) => r.partner === partner && r.sku === sku && r.month === prevMonth
    );
    const openingQty = openingRecord?.physicalQuantity ?? 0;

    // Inbound sum for target month
    const inboundQty = inbound
      .filter(
        (t) =>
          t.partner === partner &&
          t.sku === sku &&
          toYearMonth(t.date) === targetMonth
      )
      .reduce((sum, t) => sum + t.quantity, 0);

    // Outbound sum for target month
    const outboundQty = outbound
      .filter(
        (t) =>
          t.partner === partner &&
          t.sku === sku &&
          toYearMonth(t.date) === targetMonth
      )
      .reduce((sum, t) => sum + t.quantity, 0);

    const theoreticalQty = openingQty + inboundQty - outboundQty;

    // Physical count at end of target month
    const physicalRecord = stocktake.find(
      (r) => r.partner === partner && r.sku === sku && r.month === targetMonth
    );
    const physicalQty = physicalRecord?.physicalQuantity ?? 0;

    const variance = theoreticalQty - physicalQty;

    rows.push({
      sku,
      productName: master?.productName ?? "",
      openingQty,
      inbound: inboundQty,
      outbound: outboundQty,
      theoreticalQty,
      physicalQty,
      variance,
    });
  }

  // Sort by absolute variance descending
  rows.sort((a, b) => Math.abs(b.variance) - Math.abs(a.variance));

  return rows;
}
