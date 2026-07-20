import InteractiveMap from "../components/InteractiveMap/InteractiveMap";

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? "";
const spreadsheetId = import.meta.env.VITE_SHEET_SPREADSHEET_ID ?? "";
const sheetGid = Number(import.meta.env.VITE_SHEET_GID ?? 0);

// ?frame=narrow renders the component inside a fixed 375px box (regardless
// of the actual browser window width) to test container-based responsive
// behavior — the same situation as a narrow Framer frame on a wide canvas.
const isNarrowFrame = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("frame") === "narrow";

export default function App() {
  const map = (
    <InteractiveMap
      apiKey={apiKey}
      country="chile"
      sheet={{ spreadsheetId, sheetGid }}
      style={isNarrowFrame ? { width: "100%", height: "100%" } : { width: "100vw", height: "100vh" }}
    />
  );

  if (!isNarrowFrame) return map;

  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#ddd" }}>
      <div style={{ width: 375, height: 812, border: "1px solid #999", overflow: "hidden" }}>{map}</div>
    </div>
  );
}
