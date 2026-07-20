import { useEffect, useState } from "react";
import { MOBILE_BREAKPOINT_PX } from "./constants";

/**
 * Mobile layout is driven by the component's own rendered width, not the
 * browser window's — a Framer frame can be narrow while the page/window
 * around it stays wide (e.g. a responsive-variant preview, or the canvas
 * editor), and `window.matchMedia` would never see that. A ResizeObserver
 * on the root element is what actually tracks "is this component narrow
 * right now," matching how Framer's own breakpoints resize the frame.
 */
export function useContainerIsMobile(el: HTMLElement | null): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (!el || typeof ResizeObserver === "undefined") return;
    const update = (width: number) => setIsMobile(width <= MOBILE_BREAKPOINT_PX);
    update(el.getBoundingClientRect().width);

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (width != null) update(width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [el]);

  return isMobile;
}
