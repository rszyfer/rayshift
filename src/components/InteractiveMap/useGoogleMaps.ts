import { useEffect, useState } from "react";

/**
 * Loads the Google Maps JS script directly (a plain <script> tag), instead
 * of going through a React wrapper package. Framer's Code Component bundler
 * has trouble resolving npm packages that carry their own nested "react"
 * peer dependency (like @vis.gl/react-google-maps) — this sidesteps that
 * entirely, at the cost of a little more manual wiring below.
 *
 * Safe to call from multiple components/instances: the actual script tag is
 * only ever injected once per (apiKey, libraries) combination, via a
 * module-level cache of the loading promise.
 */

interface LoaderState {
  loaded: boolean;
  error: string | null;
}

const loaderPromises = new Map<string, Promise<void>>();
let callbackCounter = 0;

function loadGoogleMapsScript(apiKey: string, libraries: string[]): Promise<void> {
  const cacheKey = `${apiKey}|${libraries.slice().sort().join(",")}`;
  const cached = loaderPromises.get(cacheKey);
  if (cached) return cached;

  const promise = new Promise<void>((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("No hay window"));
      return;
    }
    if ((window as any).google?.maps) {
      resolve();
      return;
    }

    const callbackName = `__rsGoogleMapsCallback${callbackCounter++}`;
    (window as any)[callbackName] = () => {
      delete (window as any)[callbackName];
      resolve();
    };

    const params = new URLSearchParams({
      key: apiKey,
      callback: callbackName,
      loading: "async",
    });
    if (libraries.length > 0) params.set("libraries", libraries.join(","));

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    script.async = true;
    script.onerror = () => reject(new Error("No se pudo cargar la Google Maps JavaScript API"));
    document.head.appendChild(script);
  });

  loaderPromises.set(cacheKey, promise);
  return promise;
}

export function useGoogleMapsScript(apiKey: string, libraries: string[] = []): LoaderState {
  const [state, setState] = useState<LoaderState>({ loaded: false, error: null });
  const librariesKey = libraries.slice().sort().join(",");

  useEffect(() => {
    if (!apiKey) return;
    let cancelled = false;
    loadGoogleMapsScript(apiKey, librariesKey ? librariesKey.split(",") : [])
      .then(() => {
        if (!cancelled) setState({ loaded: true, error: null });
      })
      .catch((e) => {
        if (!cancelled) setState({ loaded: false, error: e instanceof Error ? e.message : String(e) });
      });
    return () => {
      cancelled = true;
    };
  }, [apiKey, librariesKey]);

  return state;
}
