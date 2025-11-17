// hooks/useFilterOptions.ts
import { useEffect, useState } from 'react';
import { useProfiles } from '../contexts/ProfilesContext';

interface FilterOptions {
  years: string[];
  majors: string[];
  isLoading: boolean;
  error: Error | undefined;
}

export function useFilterOptions(): FilterOptions {
  const [years, setYears] = useState<string[]>([]);
  const [majors, setMajors] = useState<string[]>([]);
  const { profiles, isLoading, error } = useProfiles();

  useEffect(() => {
    if (!profiles) return;

    // Extract unique years and majors from profiles
    const yearsSet = new Set(profiles.map(p => p.year));
    const majorsSet = new Set(profiles.map(p => p.major));

    setYears(Array.from(yearsSet).sort());
    setMajors(Array.from(majorsSet).sort());
  }, [profiles]);

  return { years, majors, isLoading, error };
}