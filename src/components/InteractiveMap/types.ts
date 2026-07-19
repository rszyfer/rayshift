/**
 * `fields` holds every filterable column value, keyed by FilterFieldConfig.key
 * (single value as string, multi-value cells as string[]). This is what
 * makes adding a new filterable column trivial: add one entry to a
 * FilterFieldConfig[] and it automatically flows into every pin's `fields`
 * bag, the topbar buttons, the dropdown UI and passesFilters() — no other
 * code, and no edit to this Pin type, is needed.
 */
export interface Pin {
  id: string;
  nombre: string;
  direccion: string;
  lat: number;
  lng: number;
  fields: Record<string, string | string[]>;
}

/**
 * Describes one filterable column read from the sheet.
 */
export interface FilterFieldConfig {
  /** Key under pin.fields this filter reads/writes. */
  key: string;
  /** Label shown in the filter button / dropdown header. */
  label: string;
  /** Exact column header in the Google Sheet this value comes from. */
  sheetColumn: string;
  /** True if the sheet cell can hold multiple comma-separated values. */
  multi?: boolean;
  /** Key of another filter whose active values restrict this one's options. */
  dependsOn?: string;
}

export type ActiveFilters = Record<string, Set<string>>;

export type PinVisualState = "on" | "off" | "radius";

export interface LatLng {
  lat: number;
  lng: number;
}

export interface SearchCenter extends LatLng {
  label: string;
}

/**
 * Per-country parametrization. One instance of the component per country;
 * duplicate + fill in a new entry in countryConfigs.ts for each of the
 * remaining 5 countries, each backed by its own Google Sheet.
 */
export interface CountryConfig {
  id: string;
  label: string;
  spreadsheetId: string;
  /** Tab (gid) to read within the spreadsheet, as seen in the sheet URL. */
  sheetGid?: number;
  /** Alternative to sheetGid: exact tab name, skips one metadata lookup. */
  sheetName?: string;
  defaultCenter: LatLng;
  defaultZoom: number;
  /** Address-search highlight radius, in kilometers. */
  radiusKm: number;
  filters?: FilterFieldConfig[];
}
