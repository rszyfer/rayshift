import { DEFAULT_FILTER_CONFIG } from "./constants";
import type { CountryConfig } from "./types";

/**
 * Registry of per-country configs. Each country gets its own Google Sheet
 * (isolates permissions/quotas, per the brief) plus its own default map
 * center/zoom/search radius. To add the next of the 6 countries, add one
 * entry here — the component itself stays untouched.
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
    filters: DEFAULT_FILTER_CONFIG,
  },

  // Ejemplo para agregar el próximo país (duplicar y completar):
  // peru: {
  //   id: "peru",
  //   label: "Perú",
  //   spreadsheetId: "<id del Sheet de Perú>",
  //   sheetGid: 0,
  //   defaultCenter: { lat: -12.0464, lng: -77.0428 }, // Lima
  //   defaultZoom: 12,
  //   radiusKm: 2,
  //   filters: DEFAULT_FILTER_CONFIG,
  // },
};

export function getCountryConfig(id: string): CountryConfig | undefined {
  return COUNTRY_CONFIGS[id];
}
