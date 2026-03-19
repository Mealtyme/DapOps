export type InboundStatus = 'planned' | 'arrived' | 'unloading' | 'completed';
export type LoadType = 'LTL' | 'FTL';
export type OTIFStatus = 'on_time' | 'at_risk' | 'late' | 'pending';
export type PlanStatus = 'Planned' | 'Shipped' | 'Pending' | 'Partial' | 'Critical';
export type Retailer = 'walmart' | 'homedepot' | 'canadiantire' | 'lowes' | 'rona';
export type SKUTier = 'tier_a' | 'tier_b' | 'tier_c' | 'other';
export type StockStatus = 'low' | 'healthy' | 'surplus';
export type ThreePLFlag = 'no' | 'flagged';
export type EventModule = 'inbound' | 'outbound' | 'inventory' | 'system';
export type EventSeverity = 'info' | 'warning' | 'critical';

// ─── OUTBOUND ORDER ───────────────────────────────────────────────
export interface OutboundOrder {
  id: string;
  ENTRY_DATE: string;
  REQUESTED_DELIVERY: string;
  REQUIRED_GI_DATE: string;
  PLANT: string;
  DELNUM: string;
  PO_NUMBER: string;
  ORDER_NUM: string;
  SHIP_TO_NAME: string;
  SHIP_TO_CITY: string;
  SHIP_TO_ST_PR: string;
  FOB: string;
  MATERIAL: string;
  MATERIAL_DESCRIPTION: string;
  DELIVERY_STATUS: string;
  OPEN_CS_QTY: number;
  OPEN_GR_WEIGHT: number;
  OPEN_LINE_AMU: number;
  Plan_Status: PlanStatus;
  Plan_Ship_Date: string;
  Required_TMS_Date: string;
  BOL: string;
  Trailer_Seal: string;
  Pallets: number;
  Actual_Cases_Shipped: number;
  Actual_Weight_Shipped: number;
  Pickup_Date: string;
  Pickup_Time: string;
  TMS_Date_Actual: string;
  Exceptions_Notes: string;
  otifStatus: OTIFStatus;
  penalty: number;
  retailer: Retailer;
}
