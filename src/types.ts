export interface SkuMaster {
  sku: string;
  jan: string;
  productName: string;
  standardCost?: number;
}

export interface InboundTransaction {
  date: Date;
  partner: string;
  sku: string;
  quantity: number;
  docNo: string;
}

export interface OutboundTransaction {
  date: Date;
  partner: string;
  sku: string;
  quantity: number;
  docNo: string;
}

export interface StocktakeRecord {
  month: string; // "YYYY-MM"
  partner: string;
  sku: string;
  physicalQuantity: number;
}

export interface BridgeRow {
  sku: string;
  productName: string;
  openingQty: number;
  inbound: number;
  outbound: number;
  theoreticalQty: number;
  physicalQty: number;
  variance: number;
}
