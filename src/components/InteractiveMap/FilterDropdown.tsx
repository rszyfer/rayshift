import { createPortal } from "react-dom";
import { countForValue, getValuesForFilter } from "./filters";
import type { ActiveFilters, FieldConfig, Pin } from "./types";

interface FilterDropdownProps {
  filter: FieldConfig;
  pins: Pin[];
  activeFilters: ActiveFilters;
  isOpen: boolean;
  onToggleOpen: () => void;
  onChange: (key: string, next: Set<string>) => void;
  isMobile: boolean;
  portalRoot: HTMLDivElement | null;
}

export function FilterDropdown({
  filter,
  pins,
  activeFilters,
  isOpen,
  onToggleOpen,
  onChange,
  isMobile,
  portalRoot,
}: FilterDropdownProps) {
  const values = getValuesForFilter(pins, filter, activeFilters);
  const active = activeFilters[filter.key] ?? new Set<string>();
  const activeCount = values.filter((v) => active.has(v)).length;

  function toggleAll() {
    onChange(filter.key, active.size === values.length ? new Set() : new Set(values));
  }

  function toggleValue(value: string, checked: boolean) {
    const next = new Set(active);
    if (checked) next.add(value);
    else next.delete(value);
    onChange(filter.key, next);
  }

  const panel = isOpen && (
    <div className="rs-dropdown-panel" onClick={(e) => e.stopPropagation()}>
      <div className="rs-dd-head">
        <span>{filter.label}</span>
        <button type="button" onClick={toggleAll}>
          todas / ninguna
        </button>
      </div>
      {values.length === 0 && <div className="rs-dd-empty">Sin opciones disponibles</div>}
      {values.map((value) => (
        <label className="rs-dd-chip" key={value}>
          <input type="checkbox" checked={active.has(value)} onChange={(e) => toggleValue(value, e.target.checked)} />
          <span>{value}</span>
          <span className="rs-dd-count">{countForValue(pins, filter, value)}</span>
        </label>
      ))}
    </div>
  );

  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        className={`rs-filter-btn${isOpen ? " rs-active-open" : ""}`}
        onClick={(e) => {
          e.stopPropagation();
          onToggleOpen();
        }}
      >
        <span>{filter.label}</span>
        {activeCount < values.length && <span className="rs-badge">{activeCount}</span>}
        <span className="rs-chev">▾</span>
      </button>

      {/* Desktop: rendered inline, positioned relative to this button.
          Mobile: portaled to a root-level layer so its `position: fixed`
          bottom-sheet isn't trapped inside the topbar's backdrop-filter
          containing block (see InteractiveMap.tsx). */}
      {isMobile ? portalRoot && createPortal(panel, portalRoot) : panel}
    </div>
  );
}
