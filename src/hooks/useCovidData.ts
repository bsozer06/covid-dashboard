import { useCallback, useEffect, useState } from 'react';
import { fetchCountries, fetchGlobalStats } from '../api/covid';
import type { CovidCountry, GlobalStats } from '../types';

export function useCovidData() {
  const [global, setGlobal] = useState<GlobalStats | null>(null);
  const [countries, setCountries] = useState<CovidCountry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [globalStats, countryStats] = await Promise.all([
        fetchGlobalStats(),
        fetchCountries(),
      ]);
      setGlobal(globalStats);
      setCountries(countryStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { global, countries, loading, error, refresh: load };
}
