import { useEffect, useState } from 'react';
import {
  fetchHistoricalCountry,
  fetchHistoricalGlobal,
} from '../api/covid';
import type { DateRangeDays, HistoricalTimeline } from '../types';

type CountryTimeline = {
  country: string;
  lastdays: DateRangeDays;
  timeline: HistoricalTimeline;
};

export function useHistorical(
  lastdays: DateRangeDays,
  country: string | null,
) {
  const [globalTimeline, setGlobalTimeline] =
    useState<HistoricalTimeline | null>(null);
  const [globalDays, setGlobalDays] = useState<DateRangeDays | null>(null);
  const [countryData, setCountryData] = useState<CountryTimeline | null>(null);

  useEffect(() => {
    let cancelled = false;

    void fetchHistoricalGlobal(lastdays)
      .then((data) => {
        if (cancelled) return;
        setGlobalTimeline(data);
        setGlobalDays(lastdays);
      })
      .catch(() => {
        if (cancelled) return;
        setGlobalTimeline(null);
        setGlobalDays(lastdays);
      });

    return () => {
      cancelled = true;
    };
  }, [lastdays]);

  useEffect(() => {
    if (!country) return;
    let cancelled = false;

    void fetchHistoricalCountry(country, lastdays)
      .then((data) => {
        if (cancelled) return;
        setCountryData({ country, lastdays, timeline: data });
      })
      .catch(() => {
        if (cancelled) return;
        setCountryData((current) =>
          current?.country === country ? null : current,
        );
      });

    return () => {
      cancelled = true;
    };
  }, [country, lastdays]);

  const countryMatch =
    country &&
    countryData?.country === country &&
    countryData.lastdays === lastdays
      ? countryData.timeline
      : null;

  return {
    timeline: countryMatch ?? globalTimeline,
    scopeLabel: countryMatch && country ? country : 'Global',
    loading: globalDays !== lastdays,
  };
}
