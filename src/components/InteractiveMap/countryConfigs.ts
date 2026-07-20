import type { CountryConfig, FieldConfig } from "./types";

/**
 * Chile's sheet columns. `key` is the field on pin.fields; `sheetColumn` is
 * the exact header text in the Google Sheet. Each entry is, by default,
 * both a topbar filter AND a row in the pin info panel — set
 * `filterable: false` or `showInInfo: false` to opt a column out of one of
 * those.
 */
const CHILE_FIELDS: FieldConfig[] = [
  { key: "negocio", label: "Negocio", sheetColumn: "Negocio" },
  { key: "distribuidor", label: "Distribuidor", sheetColumn: "Distribuidor", multi: true },
  { key: "importador", label: "Importador", sheetColumn: "Importador", multi: true },
  { key: "region", label: "Región", sheetColumn: "Región" },
  { key: "comuna", label: "Comuna", sheetColumn: "Comuna", dependsOn: "region" },
];

/**
 * Registry of per-country configs. Each country gets its own Google Sheet
 * (isolates permissions/quotas, per the brief) plus its own default map
 * center/zoom/search radius and its own sheet columns. To add the next of
 * the 6 countries: define a `<COUNTRY>_FIELDS` list matching that sheet's
 * columns, then add one entry below — the component itself stays
 * untouched, and the new country shows up automatically in the Framer
 * "País" property control.
 */
export const COUNTRY_CONFIGS: Record<string, CountryConfig> = {
  chile: {
    id: "chile",
    label: "Chile",
    spreadsheetId: "1z6oFMxEO0uHoLRBWzh-o-oMXJZvuoYSJ",
    sheetGid: 360593801,
    defaultCenter: { lat: -33.4489, lng: -70.6693 }, // Santiago
    defaultZoom: 12,
    radiusKm: 2,
    fields: CHILE_FIELDS,
    eyebrowKey: "negocio",
  },

  // Ejemplo para agregar el próximo país (duplicar y completar):
  // const PERU_FIELDS: FieldConfig[] = [ ... ];
  // peru: {
  //   id: "peru",
  //   label: "Perú",
  //   spreadsheetId: "<id del Sheet de Perú>",
  //   sheetGid: 0,
  //   defaultCenter: { lat: -12.0464, lng: -77.0428 }, // Lima
  //   defaultZoom: 12,
  //   radiusKm: 2,
  //   fields: PERU_FIELDS,
  //   eyebrowKey: "<key del campo que va como categoría arriba del nombre>",
  // },
};

export function getCountryConfig(id: string): CountryConfig | undefined {
  return COUNTRY_CONFIGS[id];
}
