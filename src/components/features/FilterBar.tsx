'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback, useRef } from 'react';

const LEVELS = [
  { id: 'L3', label: 'L3 (Entry)' },
  { id: 'L4', label: 'L4 (Mid)' },
  { id: 'L5', label: 'L5 (Senior)' },
  { id: 'L6', label: 'L6 (Staff)' },
  { id: 'SDE_I', label: 'SDE I' },
  { id: 'SDE_II', label: 'SDE II' },
  { id: 'SDE_III', label: 'SDE III' },
  { id: 'STAFF', label: 'Staff' },
  { id: 'PRINCIPAL', label: 'Principal+' },
  { id: 'IC4', label: 'IC4' },
  { id: 'IC5', label: 'IC5' }
];

interface FilterBarProps {
  availableRoles?: string[];
  availableLocations?: string[];
}

export default function FilterBar({ availableRoles = [], availableLocations = [] }: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [company, setCompany] = useState(searchParams.get('company') || '');
  const [role, setRole] = useState(searchParams.get('role') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [level, setLevel] = useState<string[]>(searchParams.getAll('level') || []);
  const [currency, setCurrency] = useState(searchParams.get('currency') || 'USD');

  const prevFilters = useRef({ company, role, location, level: level.join(','), currency });

  const updateFilters = useCallback(() => {
    const params = new URLSearchParams();
    if (company) params.set('company', company);
    if (role) params.set('role', role);
    if (location) params.set('location', location);
    level.forEach(l => params.append('level', l));
    params.set('currency', currency);
    params.set('page', '1'); // Reset pagination on new filter
    
    // Preserve sort
    const sort = searchParams.get('sort');
    if (sort) params.set('sort', sort);

    router.push(`/salaries?${params.toString()}`);
  }, [company, role, location, level, currency, router, searchParams]);

  // Debounced search for text fields
  useEffect(() => {
    const currentFilters = { company, role, location, level: level.join(','), currency };
    const hasChanged = JSON.stringify(prevFilters.current) !== JSON.stringify(currentFilters);
    
    if (hasChanged) {
      prevFilters.current = currentFilters;
      const timer = setTimeout(() => {
        updateFilters();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [company, role, location, level, currency, updateFilters]);

  const toggleLevel = (l: string) => {
    setLevel(prev => prev.includes(l) ? prev.filter(x => x !== l) : [...prev, l]);
  };

  const clearAll = () => {
    setCompany('');
    setRole('');
    setLocation('');
    setLevel([]);
    setCurrency('USD');
    router.push('/salaries');
  };

  return (
    <section className="bg-surface-container-lowest border border-surface-container-highest rounded-xl p-6 shadow-sm mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
        
        {/* Company Search */}
        <div className="lg:col-span-2">
          <label className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wider">
            Company
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-on-surface-variant text-lg">
                search
              </span>
            </div>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full pl-11 pr-4 py-2 bg-surface-container-low border border-surface-container-highest rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors h-[38px]"
              placeholder="Search by company name..."
            />
          </div>
        </div>

        {/* Role Dropdown */}
        <div>
          <label className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wider">
            Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary h-[38px]"
          >
            <option value="">All Roles</option>
            {availableRoles.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Location Dropdown */}
        <div>
          <label className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wider">
            Location
          </label>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary h-[38px]"
          >
            <option value="">All Locations</option>
            {availableLocations.map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        {/* Currency Toggle */}
        <div className="flex items-center justify-end h-[38px]">
          <div className="inline-flex rounded-lg shadow-sm overflow-hidden border border-surface-container-highest w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setCurrency('USD')}
              className={`w-1/2 sm:w-auto px-4 py-1.5 text-sm font-semibold transition-colors ${
                currency === 'USD'
                  ? 'bg-primary text-white'
                  : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-low'
              }`}
            >
              USD
            </button>
            <button
              type="button"
              onClick={() => setCurrency('INR')}
              className={`w-1/2 sm:w-auto px-4 py-1.5 text-sm font-semibold transition-colors border-l border-surface-container-highest ${
                currency === 'INR'
                  ? 'bg-primary text-white'
                  : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-low'
              }`}
            >
              INR
            </button>
          </div>
        </div>
      </div>

      {/* Level Checkboxes */}
      <div className="mt-4 pt-4 border-t border-surface-container-highest flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider">
            Level
          </span>
          <div className="flex flex-wrap gap-4">
            {LEVELS.map((lvl) => (
              <label key={lvl.id} className="inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={level.includes(lvl.id)}
                  onChange={() => toggleLevel(lvl.id)}
                  className="rounded border-outline text-primary focus:ring-primary h-4 w-4 accent-primary"
                />
                <span className="ml-2 text-sm text-on-surface font-medium">{lvl.label}</span>
              </label>
            ))}
          </div>
        </div>
        
        <button onClick={clearAll} className="text-sm text-on-surface-variant hover:text-primary font-medium transition-colors">
          Clear Filters
        </button>
      </div>
    </section>
  );
}
