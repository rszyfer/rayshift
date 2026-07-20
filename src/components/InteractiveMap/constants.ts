export const MOBILE_BREAKPOINT_PX = 680;

export const STATE_COLORS = {
  on: "#2f6fed",
  off: "#a9adb4",
  radius: "#d64545",
  search: "#1c1f24",
} as const;

export const DEFAULT_ACCENT = "#2f6f5e";

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
