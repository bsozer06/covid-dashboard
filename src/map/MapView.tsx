import * as maplibregl from 'maplibre-gl';
import type { FeatureCollection, MultiPolygon, Polygon } from 'geojson';
import { useEffect, useRef, useState } from 'react';
import { COUNTRIES_GEOJSON_URL } from '../api/covid';
import { useMap } from '../hooks/useMap';
import type { CovidCountry, Metric, SelectedCountry } from '../types';
import {
  buildCountryLookup,
  countTiers,
  mergeAndClassify,
  toSelectedCountry,
  type ClassifiedProperties,
} from '../utils/classify';
import { MapLegend } from './MapLegend';
import {
  COUNTRIES_FILL,
  ensureCountryLayers,
  updateCountryData,
  updateCountryVisibility,
  updateSelectedCountry,
} from './layers';
import { syncPopup } from './popup';

type MapViewProps = {
  countries: CovidCountry[];
  metric: Metric;
  selected: SelectedCountry | null;
  onSelect: (country: SelectedCountry | null) => void;
  visibleIso2: string[] | null;
};

type CountryGeoJson = FeatureCollection<Polygon | MultiPolygon>;

export function MapView({
  countries,
  metric,
  selected,
  onSelect,
  visibleIso2,
}: MapViewProps) {
  const { mapContainerRef, mapRef, mapReady } = useMap();
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const geojsonRef = useRef<CountryGeoJson | null>(null);
  const [geojsonReady, setGeojsonReady] = useState(false);
  const countriesRef = useRef(countries);
  const metricRef = useRef(metric);
  countriesRef.current = countries;
  metricRef.current = metric;
  const [tierCounts, setTierCounts] = useState(
    countTiers({ type: 'FeatureCollection', features: [] }),
  );

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    map.addControl(new maplibregl.NavigationControl(), 'top-right');
    ensureCountryLayers(map);

    let cancelled = false;

    void fetch(COUNTRIES_GEOJSON_URL)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load country boundaries');
        return res.json() as Promise<CountryGeoJson>;
      })
      .then((geojson) => {
        if (cancelled) return;
        geojsonRef.current = geojson;
        setGeojsonReady(true);
      })
      .catch(() => {
        /* geojson load failure — map stays empty */
      });

    const onClick = (event: maplibregl.MapLayerMouseEvent) => {
      const feature = event.features?.[0];
      if (!feature?.properties) return;

      const props = feature.properties as ClassifiedProperties;
      const lookup = buildCountryLookup(countriesRef.current);
      const selectedCountry = toSelectedCountry(
        props,
        metricRef.current,
        lookup,
      );

      onSelect(selectedCountry);
      syncPopup(
        map,
        popupRef,
        props,
        [event.lngLat.lng, event.lngLat.lat],
        () => onSelect(null),
      );
    };

    const onBackgroundClick = (event: maplibregl.MapMouseEvent) => {
      const hits = map.queryRenderedFeatures(event.point, {
        layers: [COUNTRIES_FILL],
      });
      if (hits.length > 0) return;
      onSelect(null);
      syncPopup(map, popupRef, null, null, () => onSelect(null));
    };

    const onMouseEnter = () => {
      map.getCanvas().style.cursor = 'pointer';
    };
    const onMouseLeave = () => {
      map.getCanvas().style.cursor = '';
    };

    map.on('click', COUNTRIES_FILL, onClick);
    map.on('click', onBackgroundClick);
    map.on('mouseenter', COUNTRIES_FILL, onMouseEnter);
    map.on('mouseleave', COUNTRIES_FILL, onMouseLeave);

    return () => {
      cancelled = true;
      map.off('click', COUNTRIES_FILL, onClick);
      map.off('click', onBackgroundClick);
      map.off('mouseenter', COUNTRIES_FILL, onMouseEnter);
      map.off('mouseleave', COUNTRIES_FILL, onMouseLeave);
      popupRef.current?.remove();
      popupRef.current = null;
    };
  }, [mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    const geojson = geojsonRef.current;
    if (!map || !mapReady || !geojson || countries.length === 0) return;

    const classified = mergeAndClassify(geojson, countries, metric);
    updateCountryData(map, classified);
    setTierCounts(countTiers(classified));
  }, [countries, metric, mapReady, geojsonReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    updateSelectedCountry(map, selected?.iso2 ?? null);
  }, [selected, mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    updateCountryVisibility(map, visibleIso2);
  }, [visibleIso2, mapReady, countries, metric]);

  return (
    <div className="map-wrap">
      <div ref={mapContainerRef} className="map-container" />
      <MapLegend counts={tierCounts} />
    </div>
  );
}
