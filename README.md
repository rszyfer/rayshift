# Mapa interactivo — Componente React para Framer

Migración del prototipo `prototipo_mapa.html` (Leaflet + datos mock) a un
componente React/TypeScript sobre **Google Maps**, pensado para pegarse
directo como *Code Component* en Framer. Lee los pines desde un Google
Sheet, agrupa con clustering, filtra por columna y busca direcciones —
ver `brief_claude_code.md` para la spec completa.

## Estructura

```
src/components/InteractiveMap/
  InteractiveMap.tsx   Componente principal (el que se pega en Framer). Property controls acá.
  MapCanvas.tsx         El <Map> de Google + capa de pines clusterizados + marcador/círculo de búsqueda
  TopBar.tsx            Barra flotante: buscador + botones de filtro + contador
  AddressSearch.tsx     Autocomplete de direcciones (Places) + Geocoding
  FilterDropdown.tsx    Un dropdown de filtro (checkboxes, contador, todas/ninguna)
  InfoPanel.tsx          Panel de info del pin seleccionado
  Legend.tsx             Leyenda de estados del pin
  styles.ts               CSS inyectado una sola vez, scopeado bajo .rs-imap
  constants.ts            Colores de estado, FILTER_CONFIG default, estilo del mapa (Styled Map JSON)
  countryConfigs.ts       Registro de configs por país (Chile ya cargado; acá se agregan los otros 5)
  useSheetData.ts          Fetch + parseo del Google Sheet (Sheets API v4)
  filters.ts               Lógica de filtrado genérica sobre FILTER_CONFIG
  geo.ts / pinIcon.ts      Haversine, bounds del radio, ícono SVG del pin (3 estados)
  types.ts                 Tipos compartidos

src/dev/App.tsx      Harness de desarrollo (no se usa en Framer)
src/framer-stub.ts    Stub local del módulo "framer" para poder correr `npm run dev` fuera de Framer
```

## Cómo correrlo localmente

```bash
npm install
cp .env.example .env.local   # completar con tu API key y el ID del Sheet
npm run dev
```

`.env.local` está en `.gitignore` — nunca se commitea una key real.

## Cómo pegarlo en Framer

1. En Framer, crear un **Code Component** nuevo.
2. Copiar el contenido de cada archivo de `src/components/InteractiveMap/`
   como su propio **Code File** dentro del mismo proyecto de Framer,
   respetando los nombres (los imports son relativos, ej.
   `import { MapCanvas } from "./MapCanvas"`), y designar
   `InteractiveMap.tsx` como el Code Component (tiene el `export default`
   y el `addPropertyControls`).
3. Framer resuelve automáticamente los paquetes de npm que se importan
   (`@vis.gl/react-google-maps`, `@googlemaps/markerclusterer`) — no hace
   falta instalarlos a mano, pero puede pedir confirmación la primera vez.
4. Arrastrar el componente al canvas. En el panel de propiedades vas a ver:
   - **Google API Key** — la key de Google Cloud (Maps JS, Places,
     Geocoding y Sheets habilitadas — ver sección de abajo).
   - **País** — selector con los países configurados en `countryConfigs.ts`
     (por ahora solo Chile).
   - **Google Sheet** — para overridear el spreadsheet ID / gid del país
     seleccionado si hiciera falta.
   - **Mapa** — centro, zoom inicial y radio de búsqueda, con overrides
     opcionales sobre el preset del país.
   - **Color acento** — color de los badges/checkboxes/eyebrow.
5. Ajustar tamaño del layer a pantalla completa (o al contenedor que
   corresponda) — el componente ocupa 100% del frame que le da Framer.

No hace falta tocar código para usarlo en Framer: toda la configuración
sensible (key, sheet) se completa desde el panel de propiedades, así la
key nunca queda escrita en el repo.

## Google Cloud — APIs que necesita la key

Habilitar en el proyecto de Google Cloud, y permitir las cuatro en las
restricciones de la API key:

- **Maps JavaScript API**
- **Places API** (Autocomplete)
- **Geocoding API**
- **Google Sheets API**

> Con la key provista en esta sesión, sólo **Maps JavaScript API** respondía
> al probarla — Sheets y Geocoding devolvían `PERMISSION_DENIED` /
> `REQUEST_DENIED` (`API_KEY_SERVICE_BLOCKED` / API no habilitada). Hay que
> habilitarlas en Cloud Console antes de que el componente pueda leer el
> Sheet o buscar direcciones. Esto es justo lo que el brief deja como
> "pendiente".

Una vez que exista la URL final del sitio en Framer, restringir la key por
dominio (HTTP referrers) — hoy no tiene esa restricción.

## Cómo agregar el segundo país (y los siguientes 4)

Un solo lugar: `countryConfigs.ts`. Agregar una entrada nueva al registro
`COUNTRY_CONFIGS` con su propio `spreadsheetId`/`sheetGid`, centro/zoom por
defecto y radio de búsqueda — un Google Sheet por país, como pide el
brief. El componente no cambia; en Framer el nuevo país aparece solo en el
dropdown "País".

## Cómo agregar una columna filtrable nueva

Un solo lugar: `DEFAULT_FILTER_CONFIG` en `constants.ts`. Agregar
`{ key, label, sheetColumn, multi?, dependsOn? }` — el botón en la barra,
el dropdown con checkboxes/contadores, y la lógica de `passesFilters` ya
son genéricos sobre esa config, no hay que tocar nada más. Si la columna
depende jerárquicamente de otra (como Comuna de Región), se declara con
`dependsOn`.

## Qué se validó en este entorno

- `tsc --noEmit` sin errores.
- Harness de desarrollo (`npm run dev`) corriendo en un navegador headless:
  con el Sheet mockeado (misma forma de datos que especifica el brief) se
  verificó el pipeline completo — parseo de filas, conteo de pines,
  barra de filtros, dropdown con checkboxes/contadores, layout mobile con
  bottom sheet y safe areas.
- El renderizado del mapa de Google en sí (tiles/markers) **no** se pudo
  ver en este sandbox porque el proxy de red saliente del entorno no deja
  llegar a `maps.googleapis.com` desde el navegador headless (sí funciona
  por `curl` directo, y va a funcionar normal en un navegador real o
  dentro de Framer). Recomiendo probarlo una vez habilitadas las APIs
  pendientes.
