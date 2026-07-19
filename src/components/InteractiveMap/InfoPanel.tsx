import { fieldValues } from "./filters";
import type { FilterFieldConfig, Pin } from "./types";

interface InfoPanelProps {
  pin: Pin | null;
  filterConfig: FilterFieldConfig[];
  onClose: () => void;
}

// Fixed display order matching the prototype's info panel, independent of
// FILTER_CONFIG order. Any of these keys simply won't render a row if the
// active filter config doesn't define it.
const BODY_ROW_KEYS = ["comuna", "region", "distribuidor", "importador"];

export function InfoPanel({ pin, filterConfig, onClose }: InfoPanelProps) {
  const negocioFilter = filterConfig.find((f) => f.key === "negocio");
  const eyebrow = pin && negocioFilter ? fieldValues(pin, negocioFilter).join(", ") : "";

  return (
    <div className={`rs-info-panel${pin ? " rs-open" : ""}`}>
      <button type="button" className="rs-info-close" onClick={onClose} aria-label="Cerrar">
        ✕
      </button>
      {pin && (
        <>
          <p className="rs-info-eyebrow">{eyebrow}</p>
          <h3 className="rs-info-title">{pin.nombre}</h3>
          <div>
            <div className="rs-info-row">
              <b>Dirección:</b> {pin.direccion}
            </div>
            {BODY_ROW_KEYS.map((key) => {
              const f = filterConfig.find((fc) => fc.key === key);
              if (!f) return null;
              const value = fieldValues(pin, f).join(", ");
              return (
                <div className="rs-info-row" key={key}>
                  <b>{f.label}:</b> {value}
                </div>
              );
            })}
            <div className="rs-info-row">
              <b>ID:</b> {pin.id}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
