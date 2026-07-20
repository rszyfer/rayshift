import { useEffect, useMemo, useRef, useState } from "react";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { DEFAULT_MAP_STYLE } from "./constants";
import { boundsForRadiusKm, haversineKm } from "./geo";
import { passesFilters } from "./filters";
import { buildPinIcon, buildSearchMarkerIcon, opacityForState } from "./pinIcon";
import { useGoogleMapsScript } from "./useGoogleMaps";
import type { ActiveFilters, FieldConfig, LatLng, Pin, PinVisualState, SearchCenter } from "./types";

function computePinState(
  pin: Pin,
  filterConfig: FieldConfig[],
  activeFilters: ActiveFilters,
  searchCenter: SearchCenter | null,
  radiusKm: number
): PinVisualState {
  if (searchCenter && haversineKm(searchCenter, pin) <= radiusKm) return "radius";
  return passesFilters(pin, filterConfig, activeFilters) ? "on" : "off";
}

/** Centers the map on the visitor's geolocation once, falling back to the country default (already the Map's initial center) if permission is denied or unavailable. */
function useGeolocationCenter(map: google.maps.Map | null, fallbackCenter: LatLng) {
  const didInit = useRef(false);

  useEffect(() => {
    if (!map) return;
    map.setOptions({ zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_BOTTOM } });
  }, [map]);

  useEffect(() => {
    if (!map || didInit.current || !navigator.geolocation) return;
    didInit.current = true;
    navigator.geolocation.getCurrentPosition(
      (pos) => map.setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => map.setCenter(fallbackCenter),
      { timeout: 3000 }
    );
  }, [map, fallbackCenter]);
}

interface PinsLayerProps {
  map: google.maps.Map | null;
  pins: Pin[];
  filterConfig: FieldConfig[];
  activeFilters: ActiveFilters;
  searchCenter: SearchCenter | null;
  radiusKm: number;
  onSelectPin: (pin: Pin) => void;
}

/** Renders every pin as a clustered classic Marker; filter/search changes only swap icons in place, never rebuild markers or the clusterer. */
function PinsLayer({ map, pins, filterConfig, activeFilters, searchCenter, radiusKm, onSelectPin }: PinsLayerProps) {
  const markersRef = useRef<globalThis.Map<string, google.maps.Marker>>(new globalThis.Map());
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const onSelectRef = useRef(onSelectPin);
  onSelectRef.current = onSelectPin;

  const pinsById = useMemo(() => new globalThis.Map(pins.map((p) => [p.id, p] as const)), [pins]);

  useEffect(() => {
    if (!map || pins.length === 0) return;

    const markers = new globalThis.Map<string, google.maps.Marker>();
    pins.forEach((pin) => {
      const marker = new google.maps.Marker({
        position: { lat: pin.lat, lng: pin.lng },
        icon: buildPinIcon("on"),
      });
      marker.addListener("click", () => onSelectRef.current(pin));
      markers.set(pin.id, marker);
    });
    markersRef.current = markers;
    clustererRef.current = new MarkerClusterer({ map, markers: Array.from(markers.values()) });

    return () => {
      clustererRef.current?.setMap(null);
      clustererRef.current = null;
      markers.forEach((m) => m.setMap(null));
      markersRef.current = new globalThis.Map();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, pins]);

  useEffect(() => {
    markersRef.current.forEach((marker, id) => {
      const pin = pinsById.get(id);
      if (!pin) return;
      const state = computePinState(pin, filterConfig, activeFilters, searchCenter, radiusKm);
      marker.setIcon(buildPinIcon(state));
      marker.setOpacity(opacityForState(state));
      marker.setZIndex(state === "radius" ? 999 : state === "on" ? 500 : 1);
    });
  }, [pinsById, filterConfig, activeFilters, searchCenter, radiusKm]);

  return null;
}

/** Distinctive black marker + faint radius circle at the searched address; fits the map to ~radiusKm around it. */
function useSearchOverlay(map: google.maps.Map | null, searchCenter: SearchCenter | null, radiusKm: number) {
  const markerRef = useRef<google.maps.Marker | null>(null);
  const circleRef = useRef<google.maps.Circle | null>(null);

  useEffect(() => {
    if (!map) return;

    if (!searchCenter) {
      markerRef.current?.setMap(null);
      markerRef.current = null;
      circleRef.current?.setMap(null);
      circleRef.current = null;
      return;
    }

    if (!markerRef.current) {
      markerRef.current = new google.maps.Marker({ map, zIndex: 1000 });
    }
    markerRef.current.setIcon(buildSearchMarkerIcon());
    markerRef.current.setPosition(searchCenter);

    if (!circleRef.current) {
      circleRef.current = new google.maps.Circle({
        map,
        strokeColor: "#2f6f5e",
        strokeWeight: 1,
        fillColor: "#2f6f5e",
        fillOpacity: 0.04,
      });
    }
    circleRef.current.setCenter(searchCenter);
    circleRef.current.setRadius(radiusKm * 1000);

    map.fitBounds(boundsForRadiusKm(searchCenter, radiusKm));
  }, [map, searchCenter, radiusKm]);

  useEffect(
    () => () => {
      markerRef.current?.setMap(null);
      circleRef.current?.setMap(null);
    },
    []
  );
}

interface MapCanvasProps {
  apiKey: string;
  defaultCenter: LatLng;
  defaultZoom: number;
  pins: Pin[];
  filterConfig: FieldConfig[];
  activeFilters: ActiveFilters;
  searchCenter: SearchCenter | null;
  radiusKm: number;
  onSelectPin: (pin: Pin) => void;
}

/**
 * The Google Map itself plus its marker layers. Loads the Maps JS script
 * directly (see useGoogleMapsScript) instead of via a React wrapper
 * package, so sibling UI — like the address search box — can share the
 * same loaded `google.maps.places` library by calling the same hook.
 */
export function MapCanvas({
  apiKey,
  defaultCenter,
  defaultZoom,
  pins,
  filterConfig,
  activeFilters,
  searchCenter,
  radiusKm,
  onSelectPin,
}: MapCanvasProps) {
  const { loaded, error } = useGoogleMapsScript(apiKey, ["places"]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  useEffect(() => {
    if (!loaded || !containerRef.current || map) return;
    setMap(
      new google.maps.Map(containerRef.current, {
        center: defaultCenter,
        zoom: defaultZoom,
        styles: DEFAULT_MAP_STYLE,
        disableDefaultUI: true,
        zoomControl: true,
        clickableIcons: false,
        gestureHandling: "greedy",
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  useGeolocationCenter(map, defaultCenter);
  useSearchOverlay(map, searchCenter, radiusKm);

  return (
    <>
      <div ref={containerRef} className="rs-map-el" style={{ width: "100%", height: "100%" }} />
      {error && <div className="rs-status">Error cargando Google Maps: {error}</div>}
      <PinsLayer
        map={map}
        pins={pins}
        filterConfig={filterConfig}
        activeFilters={activeFilters}
        searchCenter={searchCenter}
        radiusKm={radiusKm}
        onSelectPin={onSelectPin}
      />
    </>
  );
}
