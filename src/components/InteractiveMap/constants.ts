import type { FilterFieldConfig } from "./types";

export const MOBILE_BREAKPOINT_PX = 680;

export const STATE_COLORS = {
  on: "#2f6fed",
  off: "#a9adb4",
  radius: "#d64545",
  search: "#1c1f24",
} as const;

export const DEFAULT_ACCENT = "#2f6f5e";

/**
 * Default filterable columns for the Chile sheet. `key` is the field on the
 * parsed Pin object; `sheetColumn` is the exact header text in the Google
 * Sheet. To make a new column filterable, add one entry here — the topbar
 * buttons, dropdown checkboxes, per-value counts, and the passesFilters()
 * logic all read this config generically, no other code changes needed.
 */
export const DEFAULT_FILTER_CONFIG: FilterFieldConfig[] = [
  { key: "negocio", label: "Negocio", sheetColumn: "Negocio" },
  { key: "distribuidor", label: "Distribuidor", sheetColumn: "Distribuidor", multi: true },
  { key: "importador", label: "Importador", sheetColumn: "Importador", multi: true },
  { key: "region", label: "Región", sheetColumn: "Región" },
  { key: "comuna", label: "Comuna", sheetColumn: "Comuna", dependsOn: "region" },
];

/**
 * Minimalist, near-monochrome Google Maps style approximating the CartoDB
 * Positron basemap used in the HTML prototype: muted warm-grey land, white
 * roads, pale water, POI/transit noise stripped out.
 */
export const DEFAULT_MAP_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#f5f3ef" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#9a9da3" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#f5f3ef" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#dedad2" }] },
  { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
  { featureType: "administrative.neighborhood", stylers: [{ visibility: "off" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#e7e5dd" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#e4e2dd" }] },
  { featureType: "road", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#fbfaf8" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#f0eee7" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#e4e2dd" }] },
  { featureType: "road.local", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#e6e9ea" }] },
];
