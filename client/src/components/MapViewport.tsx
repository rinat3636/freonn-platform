import { useEffect } from "react";
import { useMap } from "react-leaflet";
import * as L from "leaflet";

const MOSCOW_CENTER: [number, number] = [55.7558, 37.6173];

export default function MapViewport({
  positions,
}: {
  positions: Record<number, [number, number]>;
}) {
  const map = useMap();
  const positionKey = Object.entries(positions)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([id, [lat, lng]]) => `${id}:${lat},${lng}`)
    .join("|");

  useEffect(() => {
    const invalidate = () => map.invalidateSize({ animate: false });
    invalidate();
    const timeout = window.setTimeout(invalidate, 250);
    window.addEventListener("resize", invalidate);

    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener("resize", invalidate);
    };
  }, [map]);

  useEffect(() => {
    const points = Object.values(positions);
    if (!points.length) {
      map.setView(MOSCOW_CENTER, 10);
      return;
    }

    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, {
      padding: [40, 40],
      maxZoom: 15,
      animate: false,
    });
  }, [map, positionKey, positions]);

  return null;
}
