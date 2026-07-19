import InteractiveMap from "../components/InteractiveMap/InteractiveMap";

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? "";
const spreadsheetId = import.meta.env.VITE_SHEET_SPREADSHEET_ID ?? "";
const sheetGid = Number(import.meta.env.VITE_SHEET_GID ?? 0);

export default function App() {
  return (
    <InteractiveMap
      apiKey={apiKey}
      country="chile"
      sheet={{ spreadsheetId, sheetGid }}
      style={{ width: "100vw", height: "100vh" }}
    />
  );
}
