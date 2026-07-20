import { fieldValues } from "./filters";
import type { FieldConfig, Pin } from "./types";

interface InfoPanelProps {
  pin: Pin | null;
  /** All of the country's fields (filterable or not) that may show in this panel. */
  fields: FieldConfig[];
  /** Key of the field shown as the small category label above the pin name. Defaults to the first info-visible field. */
  eyebrowKey?: string;
  onClose: () => void;
}

export function InfoPanel({ pin, fields, eyebrowKey, onClose }: InfoPanelProps) {
  const infoFields = fields.filter((f) => f.showInInfo !== false);
  const resolvedEyebrowKey = eyebrowKey ?? infoFields[0]?.key;
  const eyebrowField = infoFields.find((f) => f.key === resolvedEyebrowKey);
  const bodyFields = infoFields.filter((f) => f.key !== resolvedEyebrowKey);
  const eyebrow = pin && eyebrowField ? fieldValues(pin, eyebrowField).join(", ") : "";

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
            {bodyFields.map((f) => (
              <div className="rs-info-row" key={f.key}>
                <b>{f.label}:</b> {fieldValues(pin, f).join(", ")}
              </div>
            ))}
            <div className="rs-info-row">
              <b>ID:</b> {pin.id}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
