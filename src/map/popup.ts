import * as maplibregl from 'maplibre-gl';
import type { RefObject } from 'react';
import type { ClassifiedProperties } from '../utils/classify';
import { TIER_LABELS } from '../types';

const formatter = new Intl.NumberFormat('en-US');

function formatStat(label: string, value: number): string {
  return `<tr><td>${label}</td><td>${formatter.format(value)}</td></tr>`;
}

export function buildPopupHtml(props: ClassifiedProperties): string {
  const tierLabel = TIER_LABELS[props.tier];
  const hasData = props.tier !== 'no_data';

  if (!hasData) {
    return `
      <div class="popup">
        <h3>${props.adminName}</h3>
        <p class="tier tier-no_data">${tierLabel}</p>
        <p>No COVID data available for this country.</p>
      </div>
    `;
  }

  return `
    <div class="popup">
      <h3>${props.countryName}</h3>
      <p class="tier tier-${props.tier}">${tierLabel} risk</p>
      <table>
        ${formatStat('Cases', props.cases)}
        ${formatStat('Deaths', props.deaths)}
        ${formatStat('Recovered', props.recovered)}
        ${formatStat('Active', props.active)}
      </table>
    </div>
  `;
}

export function syncPopup(
  map: maplibregl.Map,
  popupRef: RefObject<maplibregl.Popup | null>,
  props: ClassifiedProperties | null,
  lngLat: [number, number] | null,
  onClose: () => void,
) {
  if (!props || !lngLat) {
    popupRef.current?.remove();
    return;
  }

  if (!popupRef.current) {
    popupRef.current = new maplibregl.Popup({ offset: 12, maxWidth: '260px' });
    popupRef.current.on('close', onClose);
  }

  popupRef.current
    .setLngLat(lngLat)
    .setHTML(buildPopupHtml(props))
    .addTo(map);
}
