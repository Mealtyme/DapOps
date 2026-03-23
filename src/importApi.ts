/**
 * importApi.ts — Chunked CSV ingestion layer for the Logistics Command Center
 *
 * Uses PapaParse for streaming (loads via CDN) to handle 100,000+ row files
 * without crashing the browser. All operations use UPSERT logic — never deletes
 * historical data.
 *
 * Projects:
 *   Material Master    → 9sy8yhd1UHzfyz3d
 *   Safety Stock       → CpW9WQoLYzuqb91C
 *   SAP Open Orders    → e25RPxxjfBW9tnay
 *   SKU Forecast       → SoG8adVjFc88TMvM
 *   Live Inventory     → m8SYarvCJNj5hK
 */

import axios from 'axios';
import type {
  MaterialMaster,
  SafetyStock,
  SAPOpenOrder,
  SalesForecast,
  LiveInventoryAging,
  ImportJob,
  ImportTableType,
  ImportRowError,
} from './types';

export type SyncResult = { created: number; updated: number; errors: number; errorLog: ImportRowError[] };

const BASE = '/api/taskade';

export const IMPORT_PROJECTS: Record<ImportTableType, string> = {
  material_master: '9sy8yhd1uHzfyZ1d',
  safety_stock: 'CpW9WQoLYzuqb91C',
  sap_open_orders: 'e25RPxxjfBW9tnay',
  sku_forecast: 'SoG8adVjFc88TMvM',
  live_inventory: 'm8SYarvCJNj5hK',
};

// ┐── PapaParse loader (CDN) ┐─────────────────────────────────────────
let papaPromise: Promise<any> | null = null;
function loadPapaParse(): Promise<any> {
  if ((window as any).Papa) return Promise.resolve((window as any).Papa);
  if (papaPromise) return papaPromise;
  papaPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js';
    s.onload = () => resolve((window as any).Papa);
    s.onerror = reject;
    document.head.appendChild(s);
  });
  return papaPromise;
}
