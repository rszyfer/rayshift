import { AddressSearch } from "./AddressSearch";
import { FilterDropdown } from "./FilterDropdown";
import { passesFilters } from "./filters";
import type { ActiveFilters, FieldConfig, Pin, SearchCenter } from "./types";

interface TopBarProps {
  filterConfig: FieldConfig[];
  pins: Pin[];
  activeFilters: ActiveFilters;
  onChangeFilter: (key: string, next: Set<string>) => void;
  openDropdown: string | null;
  onToggleDropdown: (key: string) => void;
  searchCenter: SearchCenter | null;
  onSelectAddress: (center: SearchCenter) => void;
  onClearAddress: () => void;
  isMobile: boolean;
  portalRoot: HTMLDivElement | null;
}

export function TopBar({
  filterConfig,
  pins,
  activeFilters,
  onChangeFilter,
  openDropdown,
  onToggleDropdown,
  searchCenter,
  onSelectAddress,
  onClearAddress,
  isMobile,
  portalRoot,
}: TopBarProps) {
  const onCount = pins.filter((p) => passesFilters(p, filterConfig, activeFilters)).length;

  return (
    <div className="rs-topbar">
      <AddressSearch onSelect={onSelectAddress} onClear={onClearAddress} active={!!searchCenter} />
      <div className="rs-bar-divider" />
      <div className="rs-filter-buttons" style={{ display: "flex", alignItems: "center", gap: 2 }}>
        {filterConfig.map((f) => (
          <FilterDropdown
            key={f.key}
            filter={f}
            pins={pins}
            activeFilters={activeFilters}
            isOpen={openDropdown === f.key}
            onToggleOpen={() => onToggleDropdown(f.key)}
            onChange={onChangeFilter}
            isMobile={isMobile}
            portalRoot={portalRoot}
          />
        ))}
      </div>
      <div className="rs-bar-divider rs-last" />
      <div className="rs-pin-count">
        {onCount} prendidos de {pins.length}
      </div>
    </div>
  );
}
