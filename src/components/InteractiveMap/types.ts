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
 * Describes one column read from the sheet into pin.fields. A field can be
 * a dropdown filter, an info-panel row, both (the common case), or neither
 * (parsed but unused) — set `filterable`/`showInInfo` to false to opt out.
 * This is what makes each of the 6 countries' different columns a matter of
 * listing FieldConfig entries in countryConfigs.ts, no other code changes.
 */
export interface FieldConfig {
  /** Key under pin.fields this field reads/writes. */
  key: string;
  /** Label shown in the filter button / dropdown header / info panel row. */
  label: string;
  /** Exact column header in the Google Sheet this value comes from. */
  sheetColumn: string;
  /** True if the sheet cell can hold multiple comma-separated values. */
  multi?: boolean;
  /** Key of another field whose active filter values restrict this one's dropdown options. */
  dependsOn?: string;
  /** Show a dropdown/filter button for this field in the topbar. Default true. */
  filterable?: boolean;
  /** Show this field as a row in the pin info panel. Default true. */
  showInInfo?: boolean;
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
  /** Every filterable/info-panel column for this country's sheet. */
  fields: FieldConfig[];
  /** Which field's value is shown as the small category label above the pin name. Defaults to the first field in `fields`. */
  eyebrowKey?: string;
}
