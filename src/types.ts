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
  OPEN_LINE_AMT: number;
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
  // Shipped reconciliation fields (written by syncSAPShippedOrders, read-only in UI)
  shipped_qty: number;   // AGI_CS column — cases actually shipped
  shipped_ea:  number;   // AGI_EA column — eaches shipped (reference)
  shipped_amt: number;   // OPEN LINE AMT from the shipped file — value shipped
  // Computed fields
  otifStatus: OTIFSctatus;
  penalty: number;
  retailer: Retailer;
}

export interface InboundShipment {
  id: string;
  Source: string;
  Destination: string;
  Carrier: string;
  Trailer_Num: string;
  LTL_FTL: LoadType;
  Material_SKU: string;
  DD_Num: string;
  PO_Num: string;
  Ship_Date: string;
  Appt_Date: string;
  Appt_Time: string;
  Arrive_Date: string;
  Arrive_Time: string;
  Receiving_Start_Time: string;
  Receiving_Status: InboundStatus;
  Total_CS: number;
  Pallet_Count: number;
  Weight_LB: number;
  Amount_Dollar: number;
  Shortages_CS: number;
  Notes_Exceptions: string;
}

export interface InboundPlannerRow {
  ETA_Date: string;
  Time: string;
  Source: string;
  Destination: string;
  Carrier: string;
  Trailer_Num: string;
  PO_Num: string;
  Material_SKU: string;
  Pallets: number;
  Total_CS: number;
  LTL_FTL: LoadType;
}

export interface SKUItem {
  id: string;
  sku: string;
  productName: string;
  tier: SKUT;
  onHand: number;
  inTransit: number;
  monthlyForecast: number;
  eachesPerCase: number;
  wos: number;
  safetyStockWeeks: number;
  stockStatus: StockStatus;
  threePLFlag: ThreePLFlag;
  category: string;
  safetyStockTarget: number;
  expiryDate?: string;
  scrapRisk?: boolean;
}

export interface EventLogItem {
  id: string;
  title: string;
  module: EventModule;
  severity: EventSeverity;
  referenceId: string;
  description: string;
  actor: string;
}

export type AppModule = 'dashboard' | 'inbound' | 'outbound' | 'inventory' | 'tools' | 'import' | 'command';

export type ImportTableType = 'material_master' | 'safety_stock' | 'sap_open_orders' | 'sku_forecast' | 'live_inventory';

export interface ImportRowError {
  rowNumber: number;
  primaryKey: string;
  reason: string;
}

export interface ImportJob {
  table: ImportTableType;
  totalRows: number;
  processedRows: number;
  created: number;
  updated: number;
  errors: number;
  errorLog: ImportRowError[];
  status: 'idle' | 'parsing' | 'uploading' | 'done' | 'error';
  message: string;
}
