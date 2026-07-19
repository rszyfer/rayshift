import { useEffect, useMemo, useRef, useState } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import type { SearchCenter } from "./types";

interface AddressSearchProps {
  onSelect: (center: SearchCenter) => void;
  onClear: () => void;
  active: boolean;
}

const DEBOUNCE_MS = 220;

export function AddressSearch({ onSelect, onClear, active }: AddressSearchProps) {
  const placesLib = useMapsLibrary("places");
  const [query, setQuery] = useState("");
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const autocompleteService = useMemo(
    () => (placesLib ? new placesLib.AutocompleteService() : null),
    [placesLib]
  );
  const geocoder = useMemo(() => (placesLib ? new google.maps.Geocoder() : null), [placesLib]);

  useEffect(() => {
    if (!active) setQuery("");
  }, [active]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!autocompleteService || !query.trim()) {
      setPredictions([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(() => {
      autocompleteService.getPlacePredictions({ input: query }, (results, status) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK || !results) {
          setPredictions([]);
          setOpen(false);
          return;
        }
        setPredictions(results);
        setOpen(true);
      });
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, autocompleteService]);

  function handleSelect(prediction: google.maps.places.AutocompletePrediction) {
    setQuery(prediction.description);
    setOpen(false);
    setPredictions([]);
    if (!geocoder) return;
    geocoder.geocode({ placeId: prediction.place_id }, (results, status) => {
      if (status !== google.maps.GeocoderStatus.OK || !results || results.length === 0) return;
      const loc = results[0].geometry.location;
      onSelect({ lat: loc.lat(), lng: loc.lng(), label: prediction.description });
    });
  }

  function handleClear() {
    setQuery("");
    setPredictions([]);
    setOpen(false);
    onClear();
  }

  return (
    <div className="rs-bar-search" onClick={(e) => e.stopPropagation()}>
      <svg className="rs-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="7" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        type="text"
        placeholder="Buscar dirección..."
        autoComplete="off"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => predictions.length > 0 && setOpen(true)}
      />
      {active && (
        <button type="button" className="rs-clear-btn" aria-label="Limpiar búsqueda" onClick={handleClear}>
          ✕
        </button>
      )}
      {open && predictions.length > 0 && (
        <div className="rs-suggestions">
          {predictions.map((p) => (
            <div key={p.place_id} onClick={() => handleSelect(p)}>
              {p.description}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
