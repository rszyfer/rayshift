import { useEffect } from "react";
import { DEFAULT_ACCENT, MOBILE_BREAKPOINT_PX } from "./constants";

export const ROOT_CLASS = "rs-imap";
const STYLE_TAG_ID = "rs-interactive-map-styles";

/**
 * All component CSS, scoped under .rs-imap so it can't leak into (or be
 * clobbered by) the host page/Framer project. Injected once globally,
 * shared across every instance on the page — per-instance theming (accent
 * color) goes through the --rs-accent custom property set on each root
 * element instead, so multiple instances with different accents don't
 * fight over one <style> tag.
 */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.${ROOT_CLASS} {
  --ink: #1c1f24;
  --muted: #767b85;
  --line: #e4e2dd;
  --bar-bg: rgba(255,255,255,.92);
  --accent: var(--rs-accent, ${DEFAULT_ACCENT});
  --sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;

  position: relative;
  width: 100%;
  height: 100%;
  min-height: 320px;
  overflow: hidden;
  font-family: var(--sans);
  color: var(--ink);
  box-sizing: border-box;
}
.${ROOT_CLASS} *, .${ROOT_CLASS} *::before, .${ROOT_CLASS} *::after { box-sizing: border-box; }

.${ROOT_CLASS} .rs-map-el { position: absolute; inset: 0; background: #eceae5; }

.${ROOT_CLASS} .rs-status {
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
  font-family: var(--sans); font-size: 13px; color: var(--muted); background: #eceae5;
  text-align: center; padding: 24px;
}

/* ---- Barra flotante ---- */
.${ROOT_CLASS} .rs-topbar {
  position: absolute; top: 16px; left: 50%; transform: translateX(-50%);
  z-index: 1000; display: flex; align-items: center; gap: 2px;
  background: var(--bar-bg); backdrop-filter: blur(10px);
  border: 1px solid var(--line); border-radius: 14px;
  box-shadow: 0 8px 24px rgba(20,20,20,.10);
  padding: 6px; max-width: 92%;
}
.${ROOT_CLASS} .rs-bar-search { position: relative; }
.${ROOT_CLASS} .rs-bar-search input {
  width: 220px; border: none; background: transparent; padding: 8px 10px 8px 30px;
  font-family: var(--sans); font-size: 13.5px; color: var(--ink); outline: none;
}
.${ROOT_CLASS} .rs-bar-search input::placeholder { color: var(--muted); }
.${ROOT_CLASS} .rs-bar-search .rs-search-icon {
  position: absolute; left: 10px; top: 50%; transform: translateY(-50%);
  width: 14px; height: 14px; pointer-events: none; color: var(--muted);
}
.${ROOT_CLASS} .rs-bar-search .rs-clear-btn {
  position: absolute; right: 6px; top: 50%; transform: translateY(-50%);
  border: none; background: none; color: var(--muted); font-size: 15px; cursor: pointer; line-height: 1;
  padding: 4px;
}
.${ROOT_CLASS} .rs-bar-divider { width: 1px; align-self: stretch; background: var(--line); margin: 4px 2px; }

.${ROOT_CLASS} .rs-filter-btn {
  display: flex; align-items: center; gap: 6px; padding: 8px 12px; border: none; background: transparent;
  border-radius: 9px; font-family: var(--sans); font-size: 13px; font-weight: 500; color: var(--ink); cursor: pointer;
  white-space: nowrap;
}
.${ROOT_CLASS} .rs-filter-btn:hover { background: #f1efe9; }
.${ROOT_CLASS} .rs-filter-btn.rs-active-open { background: #eceae3; }
.${ROOT_CLASS} .rs-filter-btn .rs-chev { font-size: 9px; color: var(--muted); transition: transform .15s; }
.${ROOT_CLASS} .rs-filter-btn .rs-badge {
  font-size: 10.5px; color: #fff; background: var(--accent); border-radius: 999px; padding: 1px 6px; font-weight: 600;
}

.${ROOT_CLASS} .rs-pin-count { padding: 8px 12px; font-size: 12px; color: var(--muted); white-space: nowrap; }

.${ROOT_CLASS} .rs-dropdown-panel {
  position: absolute; top: calc(100% + 8px); left: 0; background: #fff; border: 1px solid var(--line);
  border-radius: 12px; box-shadow: 0 10px 28px rgba(20,20,20,.14); padding: 10px;
  min-width: 210px; max-height: 260px; overflow-y: auto; z-index: 1001;
}
.${ROOT_CLASS} .rs-dd-head {
  display: flex; justify-content: space-between; align-items: center;
  padding: 2px 4px 8px; border-bottom: 1px solid var(--line); margin-bottom: 6px;
}
.${ROOT_CLASS} .rs-dd-head span { font-size: 11px; text-transform: uppercase; letter-spacing: .05em; color: var(--muted); font-weight: 600; }
.${ROOT_CLASS} .rs-dd-head button {
  border: none; background: none; color: var(--accent); font-size: 11.5px; cursor: pointer; font-family: var(--sans); font-weight: 600;
}
.${ROOT_CLASS} .rs-dd-chip { display: flex; align-items: center; gap: 8px; padding: 6px 4px; font-size: 13px; cursor: pointer; border-radius: 6px; }
.${ROOT_CLASS} .rs-dd-chip:hover { background: #f6f5f1; }
.${ROOT_CLASS} .rs-dd-chip input { accent-color: var(--accent); width: 14px; height: 14px; }
.${ROOT_CLASS} .rs-dd-count { margin-left: auto; font-size: 10.5px; color: var(--muted); }
.${ROOT_CLASS} .rs-dd-empty { padding: 10px 4px; font-size: 12px; color: var(--muted); }

.${ROOT_CLASS} .rs-suggestions {
  position: absolute; top: calc(100% + 8px); left: 0; width: 260px; background: #fff; border: 1px solid var(--line);
  border-radius: 12px; box-shadow: 0 10px 28px rgba(20,20,20,.14); z-index: 1001; overflow: hidden;
}
.${ROOT_CLASS} .rs-suggestions div { padding: 9px 12px; font-size: 13px; cursor: pointer; }
.${ROOT_CLASS} .rs-suggestions div:hover { background: #f6f5f1; }

/* ---- Panel de info ---- */
.${ROOT_CLASS} .rs-info-panel {
  position: absolute; left: 16px; bottom: 16px; width: 260px;
  background: var(--bar-bg); backdrop-filter: blur(10px);
  border: 1px solid var(--line); border-radius: 14px;
  box-shadow: 0 8px 24px rgba(20,20,20,.12);
  padding: 16px; z-index: 1000; display: none;
}
.${ROOT_CLASS} .rs-info-panel.rs-open { display: block; }
.${ROOT_CLASS} .rs-info-close { position: absolute; top: 10px; right: 12px; border: none; background: none; font-size: 15px; cursor: pointer; color: var(--muted); }
.${ROOT_CLASS} .rs-info-eyebrow { font-size: 10.5px; text-transform: uppercase; letter-spacing: .06em; color: var(--accent); font-weight: 600; margin: 0; }
.${ROOT_CLASS} .rs-info-title { font-size: 15px; font-weight: 700; margin: 4px 0 8px; }
.${ROOT_CLASS} .rs-info-row { font-size: 12.5px; color: #555; margin-bottom: 4px; line-height: 1.4; }
.${ROOT_CLASS} .rs-info-row b { color: var(--ink); font-weight: 600; }

/* ---- Leyenda ---- */
.${ROOT_CLASS} .rs-legend-toggle {
  position: absolute; right: 16px; bottom: 16px; z-index: 1000;
  background: var(--bar-bg); backdrop-filter: blur(10px); border: 1px solid var(--line);
  border-radius: 10px; padding: 7px 11px; font-size: 12px; font-weight: 500; cursor: pointer; box-shadow: 0 6px 18px rgba(20,20,20,.10);
}
.${ROOT_CLASS} .rs-legend {
  position: absolute; right: 16px; bottom: 54px; background: var(--bar-bg); backdrop-filter: blur(10px);
  border: 1px solid var(--line); border-radius: 12px; padding: 12px 14px; font-size: 12px; z-index: 1000;
  box-shadow: 0 8px 24px rgba(20,20,20,.12); display: none;
}
.${ROOT_CLASS} .rs-legend.rs-open { display: block; }
.${ROOT_CLASS} .rs-legend .rs-legend-row { display: flex; align-items: center; gap: 7px; margin-top: 6px; }
.${ROOT_CLASS} .rs-legend .rs-legend-title { margin-top: 0; font-weight: 600; color: var(--muted); text-transform: uppercase; font-size: 10px; letter-spacing: .05em; }
.${ROOT_CLASS} .rs-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

/* ---- Responsive / mobile ---- */
@media (max-width: ${MOBILE_BREAKPOINT_PX}px) {
  .${ROOT_CLASS} .rs-topbar {
    left: 0; right: 0; top: 0; transform: none; width: 100%; max-width: 100%;
    border-radius: 0 0 16px 16px; border-top: none;
    padding: 8px; padding-top: max(8px, env(safe-area-inset-top));
  }
  .${ROOT_CLASS} .rs-bar-search { flex: 1; min-width: 0; }
  .${ROOT_CLASS} .rs-bar-search input { width: 100%; }
  .${ROOT_CLASS} .rs-filter-buttons {
    flex: 1; min-width: 0; overflow-x: auto; -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }
  .${ROOT_CLASS} .rs-filter-buttons::-webkit-scrollbar { display: none; }
  .${ROOT_CLASS} .rs-filter-btn { flex-shrink: 0; }
  .${ROOT_CLASS} .rs-pin-count { display: none; }
  .${ROOT_CLASS} .rs-bar-divider.rs-last { display: none; }

  .${ROOT_CLASS} .rs-dropdown-panel {
    /* fixed (not absolute): the panel is nested inside a small per-button
       wrapper, so it must escape that positioning context to dock as a
       true full-width sheet at the bottom of the viewport. */
    position: fixed; left: 0; right: 0; bottom: 0; top: auto; width: 100%;
    border-radius: 18px 18px 0 0; max-height: 60vh;
    box-shadow: 0 -10px 30px rgba(20,20,20,.20);
    padding-bottom: max(12px, env(safe-area-inset-bottom));
  }

  .${ROOT_CLASS} .rs-info-panel {
    left: 0; right: 0; bottom: 0; width: 100%; border-radius: 18px 18px 0 0;
    padding-bottom: max(16px, env(safe-area-inset-bottom));
    max-height: 45vh; overflow-y: auto;
  }

  .${ROOT_CLASS} .rs-legend-toggle { bottom: max(16px, env(safe-area-inset-bottom)); }
  .${ROOT_CLASS} .rs-legend { bottom: calc(54px + env(safe-area-inset-bottom)); max-width: calc(100% - 32px); }
}
`;

export function useInjectStyles(): void {
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.getElementById(STYLE_TAG_ID)) return;
    const tag = document.createElement("style");
    tag.id = STYLE_TAG_ID;
    tag.textContent = CSS;
    document.head.appendChild(tag);
  }, []);
}
