import { STATE_COLORS } from "./constants";
import type { PinVisualState } from "./types";

// Same teardrop "location pin" glyph as the Leaflet prototype (26x34 viewBox,
// white center dot), rebuilt as a raster-able SVG data URI so it can be used
// as a classic google.maps.Marker icon (required for @googlemaps/markerclusterer).
const BASE_W = 26;
const BASE_H = 34;
const PIN_PATH = "M13 0C5.8 0 0 5.8 0 13c0 9.7 13 21 13 21s13-11.3 13-21C26 5.8 20.2 0 13 0z";

function pinSvg(color: string, scale: number, glow: boolean): string {
  const w = BASE_W * scale;
  const h = BASE_H * scale;
  const filter = glow
    ? `<defs><filter id="glow" x="-120%" y="-120%" width="340%" height="340%">
         <feGaussianBlur stdDeviation="2.6" result="blur"/>
         <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
       </filter></defs>`
    : "";
  const path = `<path d="${PIN_PATH}" fill="${color}"${glow ? ' filter="url(#glow)"' : ""}/>`;
  const dot = `<circle cx="13" cy="13" r="5" fill="#fff"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 26 34">${filter}${path}${dot}</svg>`;
}

function svgToDataUrl(svg: string): string {
  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}

const STATE_ICON_CONFIG: Record<PinVisualState, { color: string; scale: number; glow: boolean }> = {
  on: { color: STATE_COLORS.on, scale: 1, glow: false },
  off: { color: STATE_COLORS.off, scale: 0.8, glow: false },
  radius: { color: STATE_COLORS.radius, scale: 1.15, glow: true },
};

export function buildPinIcon(state: PinVisualState): google.maps.Icon {
  const { color, scale, glow } = STATE_ICON_CONFIG[state];
  const w = BASE_W * scale;
  const h = BASE_H * scale;
  return {
    url: svgToDataUrl(pinSvg(color, scale, glow)),
    scaledSize: new google.maps.Size(w, h),
    anchor: new google.maps.Point(w / 2, h),
  };
}

export function buildSearchMarkerIcon(): google.maps.Icon {
  const scale = 1.05;
  const w = BASE_W * scale;
  const h = BASE_H * scale;
  return {
    url: svgToDataUrl(pinSvg(STATE_COLORS.search, scale, false)),
    scaledSize: new google.maps.Size(w, h),
    anchor: new google.maps.Point(w / 2, h),
  };
}

/** Marker.setOpacity() handles the "apagado" translucency; the icon itself stays opaque. */
export function opacityForState(state: PinVisualState): number {
  return state === "off" ? 0.4 : 1;
}
