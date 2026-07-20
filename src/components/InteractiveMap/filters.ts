import type { ActiveFilters, FieldConfig, Pin } from "./types";

export function fieldValues(pin: Pin, f: FieldConfig): string[] {
  const v = pin.fields[f.key];
  if (v === undefined) return [];
  return Array.isArray(v) ? v : [v];
}

/** A pin passes if, for every active filter, at least one of its values is active. */
export function passesFilters(pin: Pin, filterConfig: FieldConfig[], activeFilters: ActiveFilters): boolean {
  return filterConfig.every((f) => {
    const active = activeFilters[f.key];
    if (!active) return true;
    return fieldValues(pin, f).some((v) => active.has(v));
  });
}

export function allValuesFor(pins: Pin[], f: FieldConfig): string[] {
  return Array.from(new Set(pins.flatMap((p) => fieldValues(p, f)))).sort((a, b) => a.localeCompare(b));
}

export function initialActiveFilters(pins: Pin[], filterConfig: FieldConfig[]): ActiveFilters {
  const active: ActiveFilters = {};
  filterConfig.forEach((f) => {
    active[f.key] = new Set(allValuesFor(pins, f));
  });
  return active;
}

/**
 * Values available for a filter's dropdown, restricted by any `dependsOn`
 * filter's currently active values (e.g. Comuna narrowed by active Región).
 */
export function getValuesForFilter(pins: Pin[], f: FieldConfig, activeFilters: ActiveFilters): string[] {
  let source = pins;
  if (f.dependsOn) {
    const parentActive = activeFilters[f.dependsOn];
    const parentConfig: FieldConfig = { key: f.dependsOn, label: "", sheetColumn: "" };
    if (parentActive) {
      source = pins.filter((p) => fieldValues(p, parentConfig).some((v) => parentActive.has(v)));
    }
  }
  return allValuesFor(source, f);
}

export function countForValue(pins: Pin[], f: FieldConfig, value: string): number {
  return pins.filter((p) => fieldValues(p, f).includes(value)).length;
}
