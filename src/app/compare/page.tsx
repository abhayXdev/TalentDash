'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function formatMoney(amountStr: string, currency: string = 'INR') {
  const amount = Number(amountStr);
  if (amount === 0) return '—';
  const locale = currency === 'INR' ? 'en-IN' : 'en-US';
  const symbol = currency === 'INR' ? '₹' : '$';
  return symbol + amount.toLocaleString(locale, { maximumFractionDigits: 0 });
}

function formatDelta(delta: number, currency: string = 'INR') {
  if (delta === 0) return <span className="text-gray-400">—</span>;
  const locale = currency === 'INR' ? 'en-IN' : 'en-US';
  const symbol = currency === 'INR' ? '₹' : '$';
  const abs = Math.abs(delta);
  const formatted = symbol + abs.toLocaleString(locale, { maximumFractionDigits: 0 });
  return delta > 0
    ? <span className="text-green-600 font-semibold">+{formatted}</span>
    : <span className="text-red-500 font-semibold">-{formatted}</span>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SalaryRecord = any;

function CompareContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [salaries, setSalaries] = useState<SalaryRecord[]>([]);
  const [s1Id, setS1Id] = useState<string>(searchParams.get('s1') || '');
  const [s2Id, setS2Id] = useState<string>(searchParams.get('s2') || '');
  const [result, setResult] = useState<{ record1: SalaryRecord; record2: SalaryRecord; delta: Record<string, number> } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load all salary records for dropdowns
  useEffect(() => {
    fetch('/api/salaries?limit=100&sort=total_comp_desc')
      .then(res => res.json())
      .then(json => {
        if (json.data) {
          setSalaries(json.data);
          if (!s1Id && json.data.length > 0) setS1Id(json.data[0].id);
          if (!s2Id && json.data.length > 1) setS2Id(json.data[1].id);
        }
      })
      .catch(() => setError('Failed to load salary records'));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync URL when selections change
  useEffect(() => {
    if (!s1Id || !s2Id) return;
    const params = new URLSearchParams();
    params.set('s1', s1Id);
    params.set('s2', s2Id);
    router.replace(`/compare?${params.toString()}`);
  }, [s1Id, s2Id, router]);

  // Fetch comparison when both IDs are set
  useEffect(() => {
    if (!s1Id || !s2Id || s1Id === s2Id) return;
    setLoading(true);
    setError(null);
    fetch(`/api/compare?s1=${s1Id}&s2=${s2Id}`)
      .then(res => res.json())
      .then(json => {
        if (json.error) setError(json.message || 'Comparison failed');
        else setResult(json.data);
      })
      .catch(() => setError('Failed to fetch comparison'))
      .finally(() => setLoading(false));
  }, [s1Id, s2Id]);

  const higherTC = result
    ? result.delta.tc_delta > 0
      ? 'record1'
      : result.delta.tc_delta < 0
      ? 'record2'
      : 'tie'
    : null;

  const rows = result ? [
    { label: 'Company', a: result.record1.company?.name, b: result.record2.company?.name, delta: null },
    { label: 'Role', a: result.record1.role, b: result.record2.role, delta: null },
    { label: 'Level', a: result.record1.level, b: result.record2.level, delta: null },
    { label: 'Location', a: result.record1.location, b: result.record2.location, delta: null },
    { label: 'Experience', a: `${result.record1.experience_years} yrs`, b: `${result.record2.experience_years} yrs`, delta: result.delta.experience_delta, isDelta: true, isExp: true },
    { label: 'Base Salary', a: formatMoney(result.record1.base_salary, result.record1.currency), b: formatMoney(result.record2.base_salary, result.record2.currency), delta: result.delta.base_delta, isDelta: true },
    { label: 'Bonus', a: formatMoney(result.record1.bonus, result.record1.currency), b: formatMoney(result.record2.bonus, result.record2.currency), delta: result.delta.bonus_delta, isDelta: true },
    { label: 'Stock', a: formatMoney(result.record1.stock, result.record1.currency), b: formatMoney(result.record2.stock, result.record2.currency), delta: result.delta.stock_delta, isDelta: true },
    { label: 'Total Comp', a: formatMoney(result.record1.total_compensation, result.record1.currency), b: formatMoney(result.record2.total_compensation, result.record2.currency), delta: result.delta.tc_delta, isDelta: true, isTC: true },
  ] : [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-[#222222] mb-2">Compare Salary Records</h1>
      <p className="text-[#717171] mb-8 text-sm">Select any two salary records to compare compensation side by side.</p>

      {/* Dropdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div>
          <label className="block text-xs font-semibold text-[#484848] uppercase tracking-wider mb-1">Record A</label>
          <select
            value={s1Id}
            onChange={e => setS1Id(e.target.value)}
            className="w-full border border-[#EBEBEB] rounded-lg px-3 py-2 text-sm text-[#222222] bg-white focus:outline-none focus:border-[#0369A1]"
          >
            {salaries.map(s => (
              <option key={`a-${s.id}`} value={s.id}>
                {s.company?.name} — {s.role} — {s.level} — {formatMoney(s.total_compensation, s.currency)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#484848] uppercase tracking-wider mb-1">Record B</label>
          <select
            value={s2Id}
            onChange={e => setS2Id(e.target.value)}
            className="w-full border border-[#EBEBEB] rounded-lg px-3 py-2 text-sm text-[#222222] bg-white focus:outline-none focus:border-[#0369A1]"
          >
            {salaries.map(s => (
              <option key={`b-${s.id}`} value={s.id}>
                {s.company?.name} — {s.role} — {s.level} — {formatMoney(s.total_compensation, s.currency)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Same record warning */}
      {s1Id && s2Id && s1Id === s2Id && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-sm text-yellow-800">
          Please select two different records to compare.
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-sm text-red-700">{error}</div>
      )}

      {/* Loading */}
      {loading && (
        <div className="bg-white border border-[#EBEBEB] rounded-xl p-8 text-center text-[#717171] animate-pulse">
          Loading comparison...
        </div>
      )}

      {/* Comparison Table */}
      {result && !loading && (
        <div className="bg-white border border-[#EBEBEB] rounded-xl overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F7F7F7] border-b border-[#EBEBEB]">
                <th className="py-3 px-4 text-left text-xs font-semibold text-[#717171] uppercase tracking-wider w-32">Field</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-[#717171] uppercase tracking-wider">
                  Record A
                  {higherTC === 'record1' && (
                    <span className="ml-2 inline-block bg-[#0369A1] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Higher TC</span>
                  )}
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-[#717171] uppercase tracking-wider">
                  Record B
                  {higherTC === 'record2' && (
                    <span className="ml-2 inline-block bg-[#0369A1] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Higher TC</span>
                  )}
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-[#717171] uppercase tracking-wider">Delta (A − B)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBEBEB]">
              {rows.map((row, i) => (
                <tr key={i} className={`hover:bg-[#F7F7F7] transition-colors ${row.isTC ? 'font-bold bg-[#F0F9FF]' : ''}`}>
                  <td className="py-3 px-4 text-xs font-semibold text-[#717171] uppercase tracking-wider whitespace-nowrap">{row.label}</td>
                  <td className={`py-3 px-4 text-sm text-[#222222] ${row.isTC ? 'text-[#0369A1] text-base font-bold' : ''}`}>{row.a}</td>
                  <td className={`py-3 px-4 text-sm text-[#222222] ${row.isTC ? 'text-[#0369A1] text-base font-bold' : ''}`}>{row.b}</td>
                  <td className="py-3 px-4 text-sm">
                    {row.isDelta && row.delta !== null && row.delta !== undefined
                      ? row.isExp
                        ? row.delta === 0
                          ? <span className="text-gray-400">—</span>
                          : row.delta > 0
                          ? <span className="text-green-600 font-semibold">+{row.delta} yrs</span>
                          : <span className="text-red-500 font-semibold">{row.delta} yrs</span>
                        : formatDelta(row.delta, result.record1.currency)
                      : <span className="text-[#717171]">—</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="max-w-5xl mx-auto px-4 py-10 text-[#717171]">Loading...</div>}>
      <CompareContent />
    </Suspense>
  );
}
