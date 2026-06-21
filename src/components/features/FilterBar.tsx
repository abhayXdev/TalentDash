'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback, useRef } from 'react';

const LEVELS = ['L3', 'L4', 'L5', 'L6', 'SDE_I', 'SDE_II', 'SDE_III', 'STAFF', 'PRINCIPAL', 'IC4', 'IC5'];

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
    <div className="bg-white p-4 rounded-lg shadow border border-gray-200 mb-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Company</label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            placeholder="Search company..."
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Role</label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border bg-white"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="">All Roles</option>
            {availableRoles.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Location</label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border bg-white"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          >
            <option value="">All Locations</option>
            {availableLocations.map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Currency</label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <button
              onClick={() => setCurrency('USD')}
              className={`relative inline-flex items-center rounded-l-md px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 focus:z-10 w-1/2 justify-center ${currency === 'USD' ? 'bg-blue-600 text-white' : 'bg-white text-gray-900 hover:bg-gray-50'}`}
            >
              USD
            </button>
            <button
              onClick={() => setCurrency('INR')}
              className={`relative -ml-px inline-flex items-center rounded-r-md px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 focus:z-10 w-1/2 justify-center ${currency === 'INR' ? 'bg-blue-600 text-white' : 'bg-white text-gray-900 hover:bg-gray-50'}`}
            >
              INR
            </button>
          </div>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Levels</label>
        <div className="flex flex-wrap gap-2">
          {LEVELS.map(l => (
            <label key={l} className="inline-flex items-center space-x-2 bg-gray-50 px-3 py-1 rounded-full border border-gray-200 cursor-pointer hover:bg-gray-100">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={level.includes(l)}
                onChange={() => toggleLevel(l)}
              />
              <span className="text-sm font-medium text-gray-700">{l}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="flex justify-end">
        <button onClick={clearAll} className="text-sm text-gray-500 hover:text-gray-700 font-medium">
          Clear All Filters
        </button>
      </div>
    </div>
  );
}
