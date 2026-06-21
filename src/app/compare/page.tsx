'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function formatCurrency(amountStr: string) {
  const amount = Number(amountStr);
  if (amount === 0) return "—";
  return amount.toLocaleString();
}

function formatDelta(amount: number) {
  if (amount === 0) return "0";
  if (amount > 0) return <span className="text-[#008A05] font-medium">+{amount.toLocaleString()}</span>;
  return <span className="text-[#D93025] font-medium">-{Math.abs(amount).toLocaleString()}</span>;
}

export default function ComparePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [salaries, setSalaries] = useState<any[]>([]);
  const [s1, setS1] = useState(searchParams.get('s1') || '');
  const [s2, setS2] = useState(searchParams.get('s2') || '');
  const [compareData, setCompareData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 1. Fetch available salaries for dropdowns
  useEffect(() => {
    fetch('/api/salaries?limit=100')
      .then(res => res.json())
      .then(json => {
        if (json.data) setSalaries(json.data);
      })
      .catch(console.error);
  }, []);

  // 2. Sync URL when selections change
  useEffect(() => {
    const params = new URLSearchParams();
    if (s1) params.set('s1', s1);
    if (s2) params.set('s2', s2);
    // Use replace to avoid filling history
    router.replace(`/compare?${params.toString()}`);
  }, [s1, s2, router]);

  // 3. Fetch comparison data when s1 and s2 are present
  useEffect(() => {
    if (!s1 || !s2) {
      setCompareData(null);
      setLoading(false);
      return;
    }
    
    if (s1 === s2) {
      setCompareData({ error: 'Cannot compare identical records' });
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`/api/compare?s1=${s1}&s2=${s2}`)
      .then(res => res.json())
      .then(json => {
        if (json.error) setCompareData({ error: json.message });
        else setCompareData(json.data);
      })
      .catch(() => setCompareData({ error: 'Failed to fetch comparison' }))
      .finally(() => setLoading(false));
  }, [s1, s2]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-extrabold text-[#222222] tracking-tight mb-8">Compare Compensation</h1>
      
      {/* Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 bg-white p-6 rounded-lg shadow-sm border border-[#EBEBEB]">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Record A</label>
          <select
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border bg-white"
            value={s1}
            onChange={(e) => setS1(e.target.value)}
          >
            <option value="">-- Choose a record --</option>
            {salaries.map(s => (
              <option key={s.id} value={s.id}>
                {s.company.name} - {s.role} ({s.level}) - {s.location}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Record B</label>
          <select
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border bg-white"
            value={s2}
            onChange={(e) => setS2(e.target.value)}
          >
            <option value="">-- Choose a record --</option>
            {salaries.map(s => (
              <option key={s.id} value={s.id}>
                {s.company.name} - {s.role} ({s.level}) - {s.location}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparison Results */}
      {loading && s1 && s2 && (
        <div className="bg-white rounded-lg shadow-sm border border-[#EBEBEB] overflow-hidden animate-pulse">
          <div className="h-14 bg-[#F7F7F7] border-b border-[#EBEBEB] w-full flex">
             <div className="w-1/4 h-full"></div>
             <div className="w-1/4 h-full border-l border-[#EBEBEB]"></div>
             <div className="w-1/4 h-full border-l border-[#EBEBEB]"></div>
             <div className="w-1/4 h-full border-l border-[#EBEBEB]"></div>
          </div>
          {[...Array(6)].map((_, i) => (
             <div key={i} className="h-16 border-b border-[#EBEBEB] w-full flex items-center px-6">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
             </div>
          ))}
        </div>
      )}
      
      {!loading && compareData && compareData.error && (
        <div className="bg-red-50 p-4 rounded-md border border-red-200 text-red-700 text-center">
          {compareData.error}
        </div>
      )}

      {!loading && compareData && !compareData.error && (
        <div className="bg-white rounded-lg shadow-sm border border-[#EBEBEB] overflow-hidden">
          <table className="min-w-full divide-y divide-[#EBEBEB]">
            <thead className="bg-[#F7F7F7]">
              <tr>
                <th className="py-4 pl-6 text-left text-sm font-semibold text-[#717171] w-1/4">Metric</th>
                <th className="py-4 px-4 text-left text-lg font-bold text-[#222222] w-1/4">
                  {compareData.record_1.company.name}
                  {Number(compareData.record_1.total_compensation) > Number(compareData.record_2.total_compensation) && (
                    <span className="ml-2 inline-flex items-center rounded-full bg-[#E0F2FE] px-2.5 py-0.5 text-xs font-medium text-[#0369A1] ring-1 ring-inset ring-[#0369A1]/20">
                      Higher TC
                    </span>
                  )}
                </th>
                <th className="py-4 px-4 text-left text-lg font-bold text-[#222222] w-1/4">
                  {compareData.record_2.company.name}
                  {Number(compareData.record_2.total_compensation) > Number(compareData.record_1.total_compensation) && (
                    <span className="ml-2 inline-flex items-center rounded-full bg-[#E0F2FE] px-2.5 py-0.5 text-xs font-medium text-[#0369A1] ring-1 ring-inset ring-[#0369A1]/20">
                      Higher TC
                    </span>
                  )}
                </th>
                <th className="py-4 pr-6 text-right text-sm font-semibold text-[#717171] w-1/4">Delta (A - B)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBEBEB] bg-[#FFFFFF]">
              <tr className="hover:bg-[#F2F2F2]">
                <td className="py-4 pl-6 text-sm font-medium text-[#717171]">Role</td>
                <td className="py-4 px-4 text-sm text-[#222222]">{compareData.record_1.role}</td>
                <td className="py-4 px-4 text-sm text-[#222222]">{compareData.record_2.role}</td>
                <td className="py-4 pr-6 text-right text-sm text-gray-500">—</td>
              </tr>
              <tr className="hover:bg-[#F2F2F2]">
                <td className="py-4 pl-6 text-sm font-medium text-[#717171]">Level</td>
                <td className="py-4 px-4 text-sm text-[#222222]">{compareData.record_1.level}</td>
                <td className="py-4 px-4 text-sm text-[#222222]">{compareData.record_2.level}</td>
                <td className="py-4 pr-6 text-right text-sm text-gray-500">—</td>
              </tr>
              <tr className="hover:bg-[#F2F2F2]">
                <td className="py-4 pl-6 text-sm font-medium text-[#717171]">Location</td>
                <td className="py-4 px-4 text-sm text-[#222222]">{compareData.record_1.location}</td>
                <td className="py-4 px-4 text-sm text-[#222222]">{compareData.record_2.location}</td>
                <td className="py-4 pr-6 text-right text-sm text-gray-500">—</td>
              </tr>
              <tr className="hover:bg-[#F2F2F2]">
                <td className="py-4 pl-6 text-sm font-medium text-[#717171]">Experience</td>
                <td className="py-4 px-4 text-sm text-[#222222]">{compareData.record_1.experience_years} yrs</td>
                <td className="py-4 px-4 text-sm text-[#222222]">{compareData.record_2.experience_years} yrs</td>
                <td className="py-4 pr-6 text-right text-sm">{formatDelta(compareData.delta.experience_delta)} yrs</td>
              </tr>
              <tr className="hover:bg-[#F2F2F2]">
                <td className="py-4 pl-6 text-sm font-medium text-[#717171]">Base Salary</td>
                <td className="py-4 px-4 text-sm text-[#222222]">{compareData.record_1.currency} {formatCurrency(compareData.record_1.base_salary)}</td>
                <td className="py-4 px-4 text-sm text-[#222222]">{compareData.record_2.currency} {formatCurrency(compareData.record_2.base_salary)}</td>
                <td className="py-4 pr-6 text-right text-sm">{formatDelta(compareData.delta.base_delta)}</td>
              </tr>
              <tr className="hover:bg-[#F2F2F2]">
                <td className="py-4 pl-6 text-sm font-medium text-[#717171]">Bonus</td>
                <td className="py-4 px-4 text-sm text-[#222222]">{compareData.record_1.currency} {formatCurrency(compareData.record_1.bonus)}</td>
                <td className="py-4 px-4 text-sm text-[#222222]">{compareData.record_2.currency} {formatCurrency(compareData.record_2.bonus)}</td>
                <td className="py-4 pr-6 text-right text-sm">{formatDelta(compareData.delta.bonus_delta)}</td>
              </tr>
              <tr className="hover:bg-[#F2F2F2]">
                <td className="py-4 pl-6 text-sm font-medium text-[#717171]">Stock</td>
                <td className="py-4 px-4 text-sm text-[#222222]">{compareData.record_1.currency} {formatCurrency(compareData.record_1.stock)}</td>
                <td className="py-4 px-4 text-sm text-[#222222]">{compareData.record_2.currency} {formatCurrency(compareData.record_2.stock)}</td>
                <td className="py-4 pr-6 text-right text-sm">{formatDelta(compareData.delta.stock_delta)}</td>
              </tr>
              <tr className="bg-blue-50">
                <td className="py-5 pl-6 text-base font-bold text-[#0369A1]">Total Compensation</td>
                <td className="py-5 px-4 text-[32px] font-bold text-[#0369A1]">{compareData.record_1.currency} {formatCurrency(compareData.record_1.total_compensation)}</td>
                <td className="py-5 px-4 text-[32px] font-bold text-[#0369A1]">{compareData.record_2.currency} {formatCurrency(compareData.record_2.total_compensation)}</td>
                <td className="py-5 pr-6 text-right text-[32px] font-bold">{formatDelta(compareData.delta.tc_delta)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
