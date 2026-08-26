import type * as maplibregl from 'maplibre-gl';
import type { FeatureCollection, MultiPolygon, Polygon } from 'geojson';
import type { ClassifiedProperties } from '../utils/classify';

export const COUNTRIES_SOURCE = 'countries-source';
export const COUNTRIES_FILL = 'countries-fill';
export const COUNTRIES_LINE = 'countries-line';
export const COUNTRIES_HIGHLIGHT = 'countries-highlight';

const FILL_COLOR: maplibregl.ExpressionSpecification = [
  'match',
  ['get', 'tier'],
  'low',
  '#fef9c3',
  'moderate',
  '#fdba74',
  'high',
  '#f87171',
  'critical',
  '#991b1b',
  '#e5e7eb',
];

export function ensureCountryLayers(map: maplibregl.Map) {
  if (!map.getSource(COUNTRIES_SOURCE)) {
    map.addSource(COUNTRIES_SOURCE, {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
    });
  }

  if (!map.getLayer(COUNTRIES_FILL)) {
    map.addLayer({
      id: COUNTRIES_FILL,
      type: 'fill',
      source: COUNTRIES_SOURCE,
      paint: {
        'fill-color': FILL_COLOR,
        'fill-opacity': 0.75,
      },
    });
  }

  if (!map.getLayer(COUNTRIES_HIGHLIGHT)) {
    map.addLayer({
      id: COUNTRIES_HIGHLIGHT,
      type: 'fill',
      source: COUNTRIES_SOURCE,
      paint: {
        'fill-color': '#2563eb',
        'fill-opacity': 0.35,
      },
      filter: ['==', ['get', 'iso2'], ''],
    });
  }

  if (!map.getLayer(COUNTRIES_LINE)) {
    map.addLayer({
      id: COUNTRIES_LINE,
      type: 'line',
      source: COUNTRIES_SOURCE,
      paint: {
        'line-color': '#64748b',
        'line-width': 0.5,
      },
    });
  }
}

export function updateCountryData(
  map: maplibregl.Map,
  data: FeatureCollection<Polygon | MultiPolygon, ClassifiedProperties>,
) {
  const source = map.getSource(COUNTRIES_SOURCE) as maplibregl.GeoJSONSource | undefined;
  source?.setData(data);
}

export function updateSelectedCountry(map: maplibregl.Map, iso2: string | null) {
  if (!map.getLayer(COUNTRIES_HIGHLIGHT)) return;
  map.setFilter(COUNTRIES_HIGHLIGHT, [
    '==',
    ['get', 'iso2'],
    iso2 ?? '',
  ]);
}

export function updateCountryVisibility(
  map: maplibregl.Map,
  iso2s: string[] | null,
) {
  if (!map.getLayer(COUNTRIES_FILL)) return;
  if (!iso2s) {
    map.setPaintProperty(COUNTRIES_FILL, 'fill-opacity', 0.75);
    return;
  }

  map.setPaintProperty(COUNTRIES_FILL, 'fill-opacity', [
    'case',
    ['in', ['get', 'iso2'], ['literal', iso2s]],
    0.75,
    0.12,
  ]);
}
