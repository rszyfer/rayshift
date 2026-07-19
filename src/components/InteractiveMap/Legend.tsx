import { useState } from "react";
import { STATE_COLORS } from "./constants";

export function Legend() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="rs-legend-toggle"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        Leyenda
      </button>
      <div className={`rs-legend${open ? " rs-open" : ""}`}>
        <div className="rs-legend-row rs-legend-title">Estado del pin</div>
        <div className="rs-legend-row">
          <span className="rs-dot" style={{ background: STATE_COLORS.on }} />
          Prendido (pasa los filtros)
        </div>
        <div className="rs-legend-row">
          <span className="rs-dot" style={{ background: STATE_COLORS.off, opacity: 0.5 }} />
          Apagado (filtrado)
        </div>
        <div className="rs-legend-row" style={{ marginTop: 10, borderTop: "1px solid var(--line)", paddingTop: 8 }}>
          <span className="rs-dot" style={{ background: STATE_COLORS.radius }} />
          Dentro del radio buscado
        </div>
      </div>
    </>
  );
}
