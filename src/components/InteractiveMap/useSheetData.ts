import { useEffect, useRef, useState } from "react";
import type { FilterFieldConfig, Pin } from "./types";

const BASE_COLUMNS = {
  id: "ID",
  nombre: "Nombre",
  direccion: "Direccion",
  region: "Región",
  latitud: "Latitud",
  longitud: "Longitud",
} as const;

interface UseSheetDataArgs {
  apiKey: string;
  spreadsheetId: string;
  sheetGid?: number;
  sheetName?: string;
  filterConfig: FilterFieldConfig[];
}

interface UseSheetDataResult {
  pins: Pin[];
  loading: boolean;
  error: string | null;
}

async function resolveSheetName(spreadsheetId: string, gid: number, apiKey: string): Promise<string> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?key=${apiKey}&fields=sheets.properties(sheetId,title)`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`No se pudo leer la metadata del Sheet (${res.status})`);
  const json = await res.json();
  const sheet = (json.sheets ?? []).find((s: any) => s.properties?.sheetId === gid);
  if (!sheet) throw new Error(`No se encontró la pestaña con gid=${gid} en el Sheet`);
  return sheet.properties.title as string;
}

function splitMulti(raw: string): string[] {
  return raw
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

export function parseSheetRows(values: string[][], filterConfig: FilterFieldConfig[]): Pin[] {
  if (values.length === 0) return [];
  const header = values[0];
  const colIndex = (name: string) => header.indexOf(name);

  const idIdx = colIndex(BASE_COLUMNS.id);
  const nombreIdx = colIndex(BASE_COLUMNS.nombre);
  const direccionIdx = colIndex(BASE_COLUMNS.direccion);
  const latIdx = colIndex(BASE_COLUMNS.latitud);
  const lngIdx = colIndex(BASE_COLUMNS.longitud);

  const filterIdx = filterConfig.map((f) => ({ f, idx: colIndex(f.sheetColumn) }));

  const missing = [
    ["ID", idIdx],
    ["Nombre", nombreIdx],
    ["Direccion", direccionIdx],
    ["Latitud", latIdx],
    ["Longitud", lngIdx],
  ].filter(([, idx]) => idx === -1);
  if (missing.length > 0) {
    throw new Error(`Faltan columnas requeridas en el Sheet: ${missing.map(([n]) => n).join(", ")}`);
  }

  const pins: Pin[] = [];
  for (const row of values.slice(1)) {
    const id = row[idIdx]?.trim();
    const lat = parseFloat(row[latIdx]);
    const lng = parseFloat(row[lngIdx]);
    if (!id || Number.isNaN(lat) || Number.isNaN(lng)) continue;

    const fields: Record<string, string | string[]> = {};
    filterIdx.forEach(({ f, idx }) => {
      const raw = idx >= 0 ? row[idx] ?? "" : "";
      fields[f.key] = f.multi ? splitMulti(raw) : raw.trim();
    });

    pins.push({
      id,
      nombre: row[nombreIdx]?.trim() ?? "",
      direccion: row[direccionIdx]?.trim() ?? "",
      lat,
      lng,
      fields,
    });
  }
  return pins;
}

export function useSheetData({ apiKey, spreadsheetId, sheetGid, sheetName, filterConfig }: UseSheetDataArgs): UseSheetDataResult {
  const [pins, setPins] = useState<Pin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const filterConfigRef = useRef(filterConfig);
  filterConfigRef.current = filterConfig;

  useEffect(() => {
    let cancelled = false;
    if (!apiKey || !spreadsheetId) {
      setLoading(false);
      setError("Falta apiKey o spreadsheetId");
      return;
    }

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const tabName = sheetName ?? (await resolveSheetName(spreadsheetId, sheetGid ?? 0, apiKey));
        const range = encodeURIComponent(`${tabName}!A:Z`);
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`No se pudo leer el Sheet (${res.status})`);
        const json = await res.json();
        const values: string[][] = json.values ?? [];
        const parsed = parseSheetRows(values, filterConfigRef.current);
        if (!cancelled) setPins(parsed);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [apiKey, spreadsheetId, sheetGid, sheetName]);

  return { pins, loading, error };
}
