import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { addPropertyControls, ControlType } from "framer";
import { APIProvider } from "@vis.gl/react-google-maps";
import { MapCanvas } from "./MapCanvas";
import { TopBar } from "./TopBar";
import { InfoPanel } from "./InfoPanel";
import { Legend } from "./Legend";
import { useSheetData } from "./useSheetData";
import { useInjectStyles, ROOT_CLASS } from "./styles";
import { useContainerIsMobile } from "./useResponsive";
import { initialActiveFilters } from "./filters";
import { COUNTRY_CONFIGS, getCountryConfig } from "./countryConfigs";
import { DEFAULT_ACCENT } from "./constants";
import type { ActiveFilters, Pin, SearchCenter } from "./types";

export interface SheetOverride {
  /** Overrides the preset's Google Sheet ID. Leave empty to use the country preset. */
  spreadsheetId?: string;
  /** Tab to read, as the numeric `gid` from the sheet's URL. */
  sheetGid?: number;
}

export interface MapOverride {
  centerLat?: number;
  centerLng?: number;
  zoom?: number;
  /** Address-search highlight radius, in kilometers. */
  radiusKm?: number;
}

export interface InteractiveMapProps {
  /** Google Cloud API key with Maps JS, Places, Geocoding and Sheets APIs enabled. */
  apiKey: string;
  /** Selects the base config (default center/zoom/sheet) for one of the 6 countries. */
  country: string;
  sheet?: SheetOverride;
  map?: MapOverride;
  accentColor?: string;
  style?: CSSProperties;
  className?: string;
}

function StatusMessage({ children }: { children: React.ReactNode }) {
  return <div className="rs-status">{children}</div>;
}

/**
 * Interactive pin map — Framer Code Component. Reads rows from a Google
 * Sheet (one row = one pin), renders clustered Google Maps markers with a
 * blue/gray/red state model driven by column filters and an address search,
 * and adapts to a bottom-sheet layout under ~680px. See brief_claude_code.md
 * for the full spec; countryConfigs.ts is where the other 5 countries get
 * added.
 */
export default function InteractiveMap({ apiKey, country, sheet, map, accentColor, style, className }: InteractiveMapProps) {
  useInjectStyles();
  const [rootEl, setRootEl] = useState<HTMLDivElement | null>(null);
  const isMobile = useContainerIsMobile(rootEl);

  const preset = getCountryConfig(country) ?? COUNTRY_CONFIGS.chile;
  const spreadsheetId = sheet?.spreadsheetId || preset.spreadsheetId;
  const sheetGid = sheet?.sheetGid ?? preset.sheetGid;
  const defaultCenter =
    map?.centerLat != null && map?.centerLng != null ? { lat: map.centerLat, lng: map.centerLng } : preset.defaultCenter;
  const defaultZoom = map?.zoom ?? preset.defaultZoom;
  const radiusKm = map?.radiusKm ?? preset.radiusKm;
  const fields = preset.fields;
  const filterableFields = useMemo(() => fields.filter((f) => f.filterable !== false), [fields]);

  const { pins, loading, error } = useSheetData({
    apiKey,
    spreadsheetId,
    sheetGid,
    sheetName: preset.sheetName,
    fields,
  });

  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({});
  const [searchCenter, setSearchCenter] = useState<SearchCenter | null>(null);
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [portalRoot, setPortalRoot] = useState<HTMLDivElement | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (pins.length > 0 && !initializedRef.current) {
      initializedRef.current = true;
      setActiveFilters(initialActiveFilters(pins, filterableFields));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pins]);

  useEffect(() => {
    setOpenDropdown(null);
  }, [isMobile]);

  function handleChangeFilter(key: string, next: Set<string>) {
    setActiveFilters((prev) => ({ ...prev, [key]: next }));
  }

  const rootStyle = {
    ...style,
    "--rs-accent": accentColor || DEFAULT_ACCENT,
  } as CSSProperties;

  let mapArea: React.ReactNode;
  if (!apiKey) {
    mapArea = <StatusMessage>Falta la API key de Google.</StatusMessage>;
  } else if (!spreadsheetId) {
    mapArea = <StatusMessage>Falta el ID del Google Sheet.</StatusMessage>;
  } else if (error) {
    mapArea = <StatusMessage>Error cargando datos: {error}</StatusMessage>;
  } else if (loading) {
    mapArea = <StatusMessage>Cargando pines…</StatusMessage>;
  } else {
    mapArea = (
      <APIProvider apiKey={apiKey} libraries={["places"]}>
        <MapCanvas
          defaultCenter={defaultCenter}
          defaultZoom={defaultZoom}
          pins={pins}
          filterConfig={filterableFields}
          activeFilters={activeFilters}
          searchCenter={searchCenter}
          radiusKm={radiusKm}
          onSelectPin={setSelectedPin}
        />
        <TopBar
          filterConfig={filterableFields}
          pins={pins}
          activeFilters={activeFilters}
          onChangeFilter={handleChangeFilter}
          openDropdown={openDropdown}
          onToggleDropdown={(key) => setOpenDropdown((prev) => (prev === key ? null : key))}
          searchCenter={searchCenter}
          onSelectAddress={setSearchCenter}
          onClearAddress={() => setSearchCenter(null)}
          isMobile={isMobile}
          portalRoot={portalRoot}
        />
      </APIProvider>
    );
  }

  return (
    <div
      ref={setRootEl}
      className={`${ROOT_CLASS}${isMobile ? " rs-mobile" : ""}${className ? ` ${className}` : ""}`}
      style={rootStyle}
      onClick={() => setOpenDropdown(null)}
    >
      {mapArea}
      <InfoPanel pin={selectedPin} fields={fields} eyebrowKey={preset.eyebrowKey} onClose={() => setSelectedPin(null)} />
      <Legend />
      {/*
        Plain sibling of the topbar (which has backdrop-filter — a CSS
        containing block for `position: fixed` descendants). Mobile filter
        dropdowns portal here so their fixed bottom-sheet positioning
        actually anchors to the viewport instead of the blurred topbar.
      */}
      <div ref={setPortalRoot} className="rs-portal-layer" />
    </div>
  );
}

addPropertyControls(InteractiveMap, {
  apiKey: {
    type: ControlType.String,
    title: "Google API Key",
    defaultValue: "",
    placeholder: "AIza…",
  },
  country: {
    type: ControlType.Enum,
    title: "País",
    options: Object.keys(COUNTRY_CONFIGS),
    optionTitles: Object.values(COUNTRY_CONFIGS).map((c) => c.label),
    defaultValue: "chile",
  },
  sheet: {
    type: ControlType.Object,
    title: "Google Sheet",
    controls: {
      spreadsheetId: {
        type: ControlType.String,
        title: "Spreadsheet ID",
        placeholder: "vacío = usar el del país",
      },
      sheetGid: {
        type: ControlType.Number,
        title: "Tab (gid)",
        defaultValue: 0,
      },
    },
  },
  map: {
    type: ControlType.Object,
    title: "Mapa",
    controls: {
      centerLat: { type: ControlType.Number, title: "Centro lat", step: 0.0001 },
      centerLng: { type: ControlType.Number, title: "Centro lng", step: 0.0001 },
      zoom: { type: ControlType.Number, title: "Zoom inicial", defaultValue: 12, min: 1, max: 20, step: 1 },
      radiusKm: { type: ControlType.Number, title: "Radio búsqueda (km)", defaultValue: 2, min: 0.1, step: 0.1 },
    },
  },
  accentColor: {
    type: ControlType.Color,
    title: "Color acento",
    defaultValue: DEFAULT_ACCENT,
  },
});
