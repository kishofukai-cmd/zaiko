/**
 * zaiko — Inventory Reconciliation Tool
 *
 * Usage: ts-node src/index.ts <input.xlsx> <partner> <YYYY-MM> [output.xlsx]
 *
 * Phase 1: Quantity bridge (theoretical vs physical) per SKU.
 */
import path from "path";
import { loadWorkbook } from "./loader";
import { calculateBridge } from "./bridge";
import { writeBridgeSheet } from "./excel";

async function main(): Promise<void> {
  const [, , inputFile, partner, targetMonth, outputFile] = process.argv;

  if (!inputFile || !partner || !targetMonth) {
    console.error(
      "Usage: ts-node src/index.ts <input.xlsx> <partner> <YYYY-MM> [output.xlsx]"
    );
    process.exit(1);
  }

  const out =
    outputFile ??
    path.join(
      path.dirname(inputFile),
      `bridge_${partner}_${targetMonth}.xlsx`
    );

  console.log(`Loading: ${inputFile}`);
  const { skuMaster, inbound, outbound, stocktake } =
    await loadWorkbook(inputFile);

  console.log(`Calculating bridge for ${partner} / ${targetMonth}...`);
  const rows = calculateBridge(
    targetMonth,
    partner,
    skuMaster,
    inbound,
    outbound,
    stocktake
  );

  console.log(`Writing output: ${out}`);
  await writeBridgeSheet(rows, targetMonth, partner, out);

  const variances = rows.filter((r) => r.variance !== 0);
  console.log(
    `Done. ${rows.length} SKUs processed, ${variances.length} with variance.`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
