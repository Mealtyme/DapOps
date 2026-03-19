import axios from 'axios';
import type { InboundShipment, OutboundOrder, SKUItem, EventLogItem } from './types';

const BASE = '/api/taskade';

const PROJECTS = {
  inbound: 'myKbpoCqTtou4QmD',
  outbound: 'E8sjHmBdLRoXeA8M',
  inventory: 'WHDMdxg4EorRPFMq',
  eventLog: 'KSJfBQjZkvy7mx5h',
};

type RawNode = { id: string; fieldValues: Record<string, unknown>; parentId: string | null };

async function getNodes(projectId: string): Promise<RawNode[]> {
  const res = await axios.get(`${BASE}/projects/${projectId}/nodes`);
  return (res.data?.payload?.nodes ?? []) as RawNode[];
}

async function createNode(projectId: string, data: Record<string, unknown>): Promise<void> {
  await axios.post(`${BASE}/projects/${projectId}/nodes`, { parentId: null, ...data });
}

async function updateNode(projectId: string, nodeId: string, data: Record<string, unknown>): Promise<void> {
  await axios.patch(`${BASE}/projects/${projectId}/nodes/${nodeId}`, data);
}

async function deleteNode(projectId: string, nodeId: string): Promise<void> {
  await axios.delete(`${BASE}/projects/${projectId}/nodes/${nodeId}`);
}

function fv(node: RawNode, key: string): unknown {
  return node.fieldValues?.[`/attributes/${key}`] ?? node.fieldValues?.[key];
}
function str(node: RawNode, key: string): string { return String(fv(node, key) ?? ''); }
function num(node: RawNode, key: string): number { return Number(fv(node, key) ?? 0); }

function parseInboundNote(raw: string): Record<string, unknown> {
  try { return JSON.parse(raw); } catch { return {}; }
}

function buildInboundNote(data: Partial<InboundShipment>): string {
  return JSON.stringify({
    Source: data.Source ?? '', Destination: data.Destination ?? '',
    Material_SKU: data.Material_SKU ?? '', DD_Num: data.DD_Num ?? '',
    Ship_Date: data.Ship_Date ?? '', Appt_Date: data.Appt_Date ?? '',
    Appt_Time: data.Appt_Time ?? '', Arrive_Date: data.Arrive_Date ?? '',
    Arrive_Time: data.Arrive_Time ?? '', Receiving_Start_Time: data.Receiving_Start_Time ?? '',
    Pallet_Count: data.Pallet_Count ?? 0, Weight_LB: data.Weight_LB ?? 0,
    Amount_Dollar: data.Amount_Dollar ?? 0, Shortages_CS: data.Shortages_CS ?? 0,
  });
}

export async function fetchInbound(): Promise<InboundShipment[]> {
  const nodes = await getNodes(PROJECTS.inbound);
  return nodes.filter(n => n.parentId === null).map(n => {
    const extra = parseInboundNote(str(n, 'note'));
    return {
      id: n.id,
      Source: (extra.Source as string) || str(n, '@inb10'),
      Destination: (extra.Destination as string) || str(n, '@inb07'),
      Carrier: str(n, '@inb02'), Trailer_Num: str(n, '@inb03'),
      LTL_FTL: (str(n, '@inb04').toUpperCase() || 'FTL') as InboundShipment['LTL_FTL'],
      Material_SKU: (extra.Material_SKU as string) || str(n, '/text'),
      DD_Num: (extra.DD_Num as string) || '',
      PO_Num: str(n, '@inb01'),
      Ship_Date: (extra.Ship_Date as string) || '',
      Appt_Date: (extra.Appt_Date as string) || '',
      Appt_Time: (extra.Appt_Time as string) || '',
      Arrive_Date: (extra.Arrive_Date as string) || '',
      Arrive_Time: (extra.Arrive_Time as string) || '',
      Receiving_Start_Time: (extra.Receiving_Start_Time as string) || '',
      Receiving_Status: (str(n, '@inb05') || 'planned') as InboundShipment['Receiving_Status'],
      Total_CS: num(n, '@inb08'),
      Pallet_Count: (extra.Pallet_Count as number) || 0,
      Weight_LB: (extra.Weight_LB as number) || 0,
      Amount_Dollar: (extra.Amount_Dollar as number) || 0,
      Shortages_CS: (extra.Shortages_CS as number) || num(n, '@inb09'),
      Notes_Exceptions: str(n, '@inb11'),
    };
  });
}

export async function createInbound(data: Omit<InboundShipment, 'id'>): Promise<void> {
  await createNode(PROJECTS.inbound, {
    '/text': data.Material_SKU || data.PO_Num || data.Source,
    '/attributes/@inb01': data.PO_Num, '/attributes/@inb02': data.Carrier,
    '/attributes/@inb03': data.Trailer_Num, '/attributes/@inb04': data.LTL_FTL?.toLowerCase() ?? 'ftl',
    '/attributes/@inb05': data.Receiving_Status || 'planned',
    '/attributes/@inb07': data.Destination, '/attributes/@inb08': data.Total_CS,
    '/attributes/@inb09': data.Shortages_CS, '/attributes/@inb10': data.Source,
    '/attributes/@inb11': data.Notes_Exceptions,
    '/attributes/note': buildInboundNote(data),
  });
}

export async function updateInboundStatus(id: string, status: string): Promise<void> {
  await updateNode(PROJECTS.inbound, id, { '/attributes/@inb05': status });
}

export async function updateInboundNode(id: string, data: Partial<InboundShipment>, currentRow: InboundShipment): Promise<void> {
  const merged = { ...currentRow, ...data };
  const payload: Record<string, unknown> = { '/attributes/note': buildInboundNote(merged) };
  if (data.PO_Num !== undefined) payload['/attributes/@inb01'] = data.PO_Num;
  if (data.Carrier !== undefined) payload['/attributes/@inb02'] = data.Carrier;
  if (data.Trailer_Num !== undefined) payload['/attributes/@inb03'] = data.Trailer_Num;
  if (data.LTL_FTL !== undefined) payload['/attributes/@inb04'] = data.LTL_FTL.toLowerCase();
  if (data.Receiving_Status !== undefined) payload['/attributes/@inb05'] = data.Receiving_Status;
  if (data.Total_CS !== undefined) payload['/attributes/@inb08'] = data.Total_CS;
  if (data.Shortages_CS !== undefined) payload['/attributes/@inb09'] = data.Shortages_CS;
  if (data.Source !== undefined) payload['/attributes/@inb10'] = data.Source;
  if (data.Notes_Exceptions !== undefined) payload['/attributes/@inb11'] = data.Notes_Exceptions;
  if (data.Material_SKU !== undefined) payload['/text'] = data.Material_SKU;
  await updateNode(PROJECTS.inbound, id, payload);
}

export async function deleteInbound(id: string): Promise<void> { await deleteNode(PROJECTS.inbound, id); }

function parseOutboundNote(raw: string): Record<string, unknown> {
  try { return JSON.parse(raw); } catch { return {}; }
}

function buildOutboundNote(data: Partial<OutboundOrder>): string {
  return JSON.stringify({
    ENTRY_DATE: data.ENTRY_DATE ?? '', REQUESTED_DELIVERY: data.REQUESTED_DELIVERY ?? '',
    REQUIRED_GI_DATE: data.REQUIRED_GI_DATE ?? '', PLANT: data.PLANT ?? '',
    ORDER_NUM: data.ORDER_NUM ?? '', SHIP_TO_NAME: data.SHIP_TO_NAME ?? '',
    SHIP_TO_CITY: data.SHIP_TO_CITY ?? '', SHIP_TO_ST_PR: data.SHIP_TO_ST_PR ?? '',
    FOB: data.FOB ?? '', MATERIAL: data.MATERIAL ?? '',
    MATERIAL_DESCRIPTION: data.MATERIAL_DESCRIPTION ?? '', DELIVERY_STATUS: data.DELIVERY_STATUS ?? '',
    OPEN_GR_WEIGHT: data.OPEN_GR_WEIGHT ?? 0, Required_TMS_Date: data.Required_TMS_Date ?? '',
    Trailer_Seal: data.Trailer_Seal ?? '', Pallets: data.Pallets ?? 0,
    Actual_Cases_Shipped: data.Actual_Cases_Shipped ?? 0, Actual_Weight_Shipped: data.Actual_Weight_Shipped ?? 0,
    Pickup_Time: data.Pickup_Time ?? '', TMS_Date_Actual: data.TMS_Date_Actual ?? '',
    Exceptions_Notes: data.Exceptions_Notes ?? '',
  });
}

export async function fetchOutbound(): Promise<OutboundOrder[]> {
  const nodes = await getNodes(PROJECTS.outbound);
  return nodes.filter(n => n.parentId === null).map(n => {
    const extra = parseOutboundNote(str(n, 'note'));
    return {
      id: n.id, DELNUM: str(n, '@out01'), PO_NUMBER: str(n, '@out02'),
      retailer: (str(n, '@out03') || 'walmart') as OutboundOrder['retailer'],
      OPEN_CS_QTY: num(n, '@out04'), OPEN_LINE_AMT: num(n, '@out05'),
      Plan_Ship_Date: str(n, '@out06'), Pickup_Date: str(n, '@out07'),
      otifStatus: (str(n, '@out08') || 'pending') as OutboundOrder['otifStatus'],
      BOL: str(n, '@out10'), penalty: num(n, '@out11'),
      Plan_Status: (str(n, '@out12') || 'Pending') as OutboundOrder['Plan_Status'],
      ENTRY_DATE: (extra.ENTRY_DATE as string) || '', REQUESTED_DELIVERY: (extra.REQUESTED_DELIVERY as string) || '',
      REQUIRED_GI_DATE: (extra.REQUIRED_GI_DATE as string) || '', PLANT: (extra.PLANT as string) || '',
      ORDER_NUM: (extra.ORDER_NUM as string) || '', SHIP_TO_NAME: (extra.SHIP_TO_NAME as string) || str(n, '/text'),
      SHIP_TO_CITY: (extra.SHIP_TO_CITY as string) || '', SHIP_TO_ST_PR: (extra.SHIP_TO_ST_PR as string) || '',
      FOB: (extra.FOB as string) || '', MATERIAL: (extra.MATERIAL as string) || '',
      MATERIAL_DESCRIPTION: (extra.MATERIAL_DESCRIPTION as string) || '',
      DELIVERY_STATUS: (extra.DELIVERY_STATUS as string) || '', OPEN_GR_WEIGHT: (extra.OPEN_GR_WEIGHT as number) || 0,
      Required_TMS_Date: (extra.Required_TMS_Date as string) || '', Trailer_Seal: (extra.Trailer_Seal as string) || '',
      Pallets: (extra.Pallets as number) || 0, Actual_Cases_Shipped: (extra.Actual_Cases_Shipped as number) || 0,
      Actual_Weight_Shipped: (extra.Actual_Weight_Shipped as number) || 0,
      Pickup_Time: (extra.Pickup_Time as string) || '', TMS_Date_Actual: (extra.TMS_Date_Actual as string) || '',
      Exceptions_Notes: (extra.Exceptions_Notes as string) || '',
    };
  });
}

export async function createOutbound(data: Omit<OutboundOrder, 'id'>): Promise<void> {
  await createNode(PROJECTS.outbound, {
    '/text': data.SHIP_TO_NAME || data.DELNUM,
    '/attributes/@out01': data.DELNUM, '/attributes/@out02': data.PO_NUMBER,
    '/attributes/@out03': data.retailer, '/attributes/@out04': data.OPEN_CS_QTY,
    '/attributes/@out05': data.OPEN_LINE_AMT, '/attributes/@out06': data.Plan_Ship_Date || data.REQUESTED_DELIVERY,
    '/attributes/@out07': data.Pickup_Date || data.TMS_Date_Actual,
    '/attributes/@out08': data.otifStatus || 'pending', '/attributes/@out09': '',
    '/attributes/@out10': data.BOL, '/attributes/@out11': data.penalty || 0,
    '/attributes/@out12': data.Plan_Status || 'Pending',
    '/attributes/note': buildOutboundNote(data),
  });
}

export async function updateOutboundNode(id: string, data: Partial<OutboundOrder>, currentRow?: OutboundOrder): Promise<void> {
  const payload: Record<string, unknown> = {};
  const merged = { ...(currentRow ?? {}), ...data };
  payload['/attributes/note'] = buildOutboundNote(merged);
  if (data.SHIP_TO_NAME !== undefined) payload['/text'] = data.SHIP_TO_NAME;
  if (data.DELNUM !== undefined) payload['/attributes/@out01'] = data.DELNUM;
  if (data.PO_NUMBER !== undefined) payload['/attributes/@out02'] = data.PO_NUMBER;
  if (data.retailer !== undefined) payload['/attributes/@out03'] = data.retailer;
  if (data.OPEN_CS_QTY !== undefined) payload['/attributes/@out04'] = data.OPEN_CS_QTY;
  if (data.OPEN_LINE_AMT !== undefined) payload['/attributes/@out05'] = data.OPEN_LINE_AMT;
  if (data.Plan_Ship_Date !== undefined) payload['/attributes/@out06'] = data.Plan_Ship_Date;
  if (data.Pickup_Date !== undefined) payload['/attributes/@out07'] = data.Pickup_Date;
  if (data.otifStatus !== undefined) payload['/attributes/@out08'] = data.otifStatus;
  if (data.BOL !== undefined) payload['/attributes/@out10'] = data.BOL;
  if (data.penalty !== undefined) payload['/attributes/@out11'] = data.penalty;
  if (data.Plan_Status !== undefined) payload['/attributes/@out12'] = data.Plan_Status;
  await updateNode(PROJECTS.outbound, id, payload);
}

export async function deleteOutbound(id: string): Promise<void> { await deleteNode(PROJECTS.outbound, id); }

function parseInventoryNote(raw: string): Record<string, unknown> {
  try { return JSON.parse(raw); } catch { return {}; }
}

function buildInventoryNote(data: Partial<SKUItem>): string {
  return JSON.stringify({
    eachesPerCase: data.eachesPerCase ?? 0, safetyStockWeeks: data.safetyStockWeeks ?? 0,
    expiryDate: data.expiryDate ?? '', scrapRisk: data.scrapRisk ?? false,
  });
}

export async function fetchInventory(): Promise<SKUItem[]> {
  const nodes = await getNodes(PROJECTS.inventory);
  return nodes.filter(n => n.parentId === null).map(n => {
    const extra = parseInventoryNote(str(n, 'note'));
    return {
      id: n.id, sku: str(n, '@sku01'), productName: str(n, '@sku02'),
      tier: (str(n, '@sku03') || 'other') as SKUItem['tier'],
      onHand: num(n, '@sku04'), inTransit: num(n, '@sku05'),
      monthlyForecast: num(n, '@sku06'), wos: num(n, '@sku07'),
      stockStatus: (str(n, '@sku08') || 'healthy') as SKUItem['stockStatus'],
      threePLFlag: (str(n, '@sku09') || 'no') as SKUItem['threePLFlag'],
      category: str(n, '@sku10'), safetyStockTarget: num(n, '@sku11'),
      eachesPerCase: (extra.eachesPerCase as number) || 0,
      safetyStockWeeks: (extra.safetyStockWeeks as number) || 0,
      expiryDate: (extra.expiryDate as string) || '',
      scrapRisk: (extra.scrapRisk as boolean) || false,
    };
  });
}

export async function createInventoryItem(data: Omit<SKUItem, 'id'>): Promise<void> {
  await createNode(PROJECTS.inventory, {
    '/text': data.sku, '/attributes/@sku01': data.sku,
    '/attributes/@sku02': data.productName, '/attributes/@sku03': data.tier,
    '/attributes/@sku04': data.onHand, '/attributes/@sku05': data.inTransit,
    '/attributes/@sku06': data.monthlyForecast, '/attributes/@sku07': data.wos,
    '/attributes/@sku08': data.stockStatus, '/attributes/@sku09': data.threePLFlag,
    '/attributes/@sku10': data.category, '/attributes/@sku11': data.safetyStockTarget,
    '/attributes/note': buildInventoryNote(data),
  });
}

export async function updateInventoryNode(id: string, data: Partial<SKUItem>, currentRow?: SKUItem): Promise<void> {
  const payload: Record<string, unknown> = {};
  const merged = { ...(currentRow ?? {}), ...data };
  payload['/attributes/note'] = buildInventoryNote(merged);
  if (data.sku !== undefined) { payload['/text'] = data.sku; payload['/attributes/@sku01'] = data.sku; }
  if (data.productName !== undefined) payload['/attributes/@sku02'] = data.productName;
  if (data.tier !== undefined) payload['/attributes/@sku03'] = data.tier;
  if (data.onHand !== undefined) payload['/attributes/@sku04'] = data.onHand;
  if (data.inTransit !== undefined) payload['/attributes/@sku05'] = data.inTransit;
  if (data.monthlyForecast !== undefined) payload['/attributes/@sku06'] = data.monthlyForecast;
  if (data.wos !== undefined) payload['/attributes/@sku07'] = data.wos;
  if (data.stockStatus !== undefined) payload['/attributes/@sku08'] = data.stockStatus;
  if (data.threePLFlag !== undefined) payload['/attributes/@sku09'] = data.threePLFlag;
  if (data.category !== undefined) payload['/attributes/@sku10'] = data.category;
  if (data.safetyStockTarget !== undefined) payload['/attributes/@sku11'] = data.safetyStockTarget;
  await updateNode(PROJECTS.inventory, id, payload);
}

export async function deleteInventory(id: string): Promise<void> { await deleteNode(PROJECTS.inventory, id); }

export async function fetchEventLog(): Promise<EventLogItem[]> {
  const nodes = await getNodes(PROJECTS.eventLog);
  return nodes.filter(n => n.parentId === null).map(n => ({
    id: n.id, title: str(n, '/text') || str(n, '@evn03'),
    module: (str(n, '@evn01') || 'system') as EventLogItem['module'],
    severity: (str(n, '@evn02') || 'info') as EventLogItem['severity'],
    referenceId: str(n, '@evn03'), description: str(n, '@evn04'), actor: str(n, '@evn05'),
  }));
}

export async function addEventLog(data: Omit<EventLogItem, 'id'>): Promise<void> {
  await createNode(PROJECTS.eventLog, {
    '/text': data.title, '/attributes/@evn01': data.module,
    '/attributes/@evn02': data.severity, '/attributes/@evn03': data.referenceId,
    '/attributes/@evn04': data.description, '/attributes/@evn05': data.actor,
  });
}

let xlsxLoadPromise: Promise<any> | null = null;
function loadXLSX(): Promise<any> {
  if ((window as any).XLSX) return Promise.resolve((window as any).XLSX);
  if (xlsxLoadPromise) return xlsxLoadPromise;
  xlsxLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js';
    script.onload = () => resolve((window as any).XLSX);
    script.onerror = () => {
      const s2 = document.createElement('script');
      s2.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
      s2.onload = () => resolve((window as any).XLSX);
      s2.onerror = reject;
      document.head.appendChild(s2);
    };
    document.head.appendChild(script);
  });
  return xlsxLoadPromise;
}

function excelSerialToDate(serial: number): string {
  const d = new Date(Date.UTC(1899, 11, 30) + Math.floor(serial) * 86400000);
  return `${String(d.getUTCMonth()+1).padStart(2,'0')}/${String(d.getUTCDate()).padStart(2,'0')}/${d.getUTCFullYear()}`;
}

function excelSerialToTime(serial: number): string {
  const frac = serial - Math.floor(serial);
  const totalMinutes = Math.round(frac * 1440);
  const h24 = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const ampm = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${String(h12).padStart(2,'0')}:${String(m).padStart(2,'0')} ${ampm}`;
}

const TIME_COLS_SET = new Set(['appttime','appointmenttime','apptdatetime','scheduledtime','arrivetime','arrivaltime','actualtime','receivingstarttime','rcvstart','receivingstart','starttime']);
const DATE_COLS_SET = new Set(['shipdate','shipped','shippingdate','apptdate','appointmentdate','appt','appointment','scheduleddate','arrivedate','arrivaldate','arrived','actualdate']);

function normaliseColKey(raw: string): string { return raw.toLowerCase().replace(/[\s_#\-\/\\]+/g,''); }

export async function parseExcelFile(file: File): Promise<Record<string, string>[]> {
  const XLSX = await loadXLSX();
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array', cellDates: false });
  const sheetName = workbook.SheetNames.find((n: string) => n.toLowerCase().replace(/\s/g,'').includes('inbound')) ?? workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' }) as Record<string, unknown>[];
  return rows.map(row => {
    const out: Record<string, string> = {};
    for (const [rawKey, rawVal] of Object.entries(row)) {
      const colKey = normaliseColKey(rawKey);
      const isDate = DATE_COLS_SET.has(colKey);
      const isTime = TIME_COLS_SET.has(colKey);
      let strVal: string;
      if (typeof rawVal === 'number') {
        strVal = isDate ? excelSerialToDate(rawVal) : isTime ? excelSerialToTime(rawVal) : String(rawVal);
      } else if (rawVal instanceof Date) {
        if (isTime) { const h=rawVal.getHours(),m=rawVal.getMinutes(),ap=h>=12?'PM':'AM',h12=h%12===0?12:h%12; strVal=`${String(h12).padStart(2,'0')}:${String(m).padStart(2,'0')} ${ap}`; }
        else { strVal=`${String(rawVal.getMonth()+1).padStart(2,'0')}/${String(rawVal.getDate()).padStart(2,'0')}/${rawVal.getFullYear()}`; }
      } else { strVal = String(rawVal ?? '').trim(); }
      out[rawKey] = strVal;
    }
    return out;
  });
}

export const AGENT_ID = '01KKS04JSGQH62Z0PSYVJJNXBZ';
