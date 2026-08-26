import { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';

maplibregl.setWorkerUrl(workerUrl);

export function useMap() {
  const [mapReady, setMapReady] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: [20, 20],
      zoom: 1.5,
    });
    mapRef.current = map;

    const onLoad = () => setMapReady(true);
    map.on('load', onLoad);

    const observer = new ResizeObserver(() => {
      map.resize();
    });
    observer.observe(mapContainerRef.current);

    return () => {
      observer.disconnect();
      map.off('load', onLoad);
      map.remove();
      mapRef.current = null;
      setMapReady(false);
    };
  }, []);

  return { mapContainerRef, mapRef, mapReady };
}
