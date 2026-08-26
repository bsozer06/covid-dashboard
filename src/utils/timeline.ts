import type {
  HistoricalTimeline,
  Metric,
  TimelinePoint,
} from '../types';
import { parseMdY } from './format';

export function pickTimeline(
  timeline: HistoricalTimeline,
  metric: Metric,
): Record<string, number> {
  if (metric === 'deaths') return timeline.deaths;
  return timeline.cases;
}

export function timelineToSeries(
  timeline: Record<string, number>,
): TimelinePoint[] {
  return Object.entries(timeline)
    .map(([date, value]) => ({
      date,
      value,
      ts: parseMdY(date).getTime(),
    }))
    .sort((a, b) => a.ts - b.ts)
    .map(({ date, value }) => ({ date, value }));
}

export function toDailyNew(points: TimelinePoint[]): TimelinePoint[] {
  return points
    .map((point, index) => ({
      date: point.date,
      value:
        index === 0 ? 0 : Math.max(0, point.value - points[index - 1].value),
    }))
    .slice(1);
}
