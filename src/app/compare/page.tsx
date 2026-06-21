'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import CompanyLogo from '@/components/ui/CompanyLogo';

function formatMoney(amountStr: string, isShort = false) {
  const inrValue = Number(amountStr);
  if (inrValue === 0) return '—';
  
  if (isShort) {
    if (inrValue >= 10000000) {
      return `₹${(inrValue / 10000000).toFixed(1).replace(/\.0$/, '')}Cr`;
    }
    if (inrValue >= 100000) {
      return `₹${Math.round(inrValue / 100000)}L`;
    }
    return `₹${Math.round(inrValue / 1000)}k`;
  }
  return '₹' + Math.round(inrValue).toLocaleString('en-IN');
}

function CompareContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Let the user select two companies to compare.
  // We use our companies API endpoint or a pre-fetched list.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [companies, setCompanies] = useState<any[]>([]);
  const [compAId, setCompAId] = useState<string>(searchParams.get('c1') || '');
  const [compBId, setCompBId] = useState<string>(searchParams.get('c2') || '');
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [companyA, setCompanyA] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [companyB, setCompanyB] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 1. Fetch available companies for dropdowns
  useEffect(() => {
    fetch('/api/companies')
      .then(res => res.json())
      .then(json => {
        if (json.data) {
          setCompanies(json.data);
          const c1 = searchParams.get('c1');
          const c2 = searchParams.get('c2');
          if (!c1 && json.data.length > 0) setCompAId(json.data[0].slug);
          if (!c2 && json.data.length > 1) setCompBId(json.data[1].slug);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [searchParams]);

  // 2. Sync URL
  useEffect(() => {
    if (!compAId && !compBId) return;
    const params = new URLSearchParams();
    if (compAId) params.set('c1', compAId);
    if (compBId) params.set('c2', compBId);
    router.replace(`/compare?${params.toString()}`);
  }, [compAId, compBId, router]);

  // 3. Fetch Company A
  useEffect(() => {
    if (!compAId) return;
    setLoading(true);
    fetch(`/api/companies/${compAId}`)
      .then(res => res.json())
      .then(json => {
        if (json.data) setCompanyA(json.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [compAId]);

  // 4. Fetch Company B
  useEffect(() => {
    if (!compBId) return;
    setLoading(true);
    fetch(`/api/companies/${compBId}`)
      .then(res => res.json())
      .then(json => {
        if (json.data) setCompanyB(json.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [compBId]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <header className="mb-6">
        <h1 className="text-3xl md:text-4xl font-extrabold text-on-surface mb-2 tracking-tight">
          Compare Compensation Ranges
        </h1>
        <p className="text-base text-on-surface-variant max-w-2xl font-normal">
          Select any two premium tech giants to benchmark their compensation layouts, level structures, and median salaries side-by-side.
        </p>
      </header>

      {/* Select selectors */}
      <section className="bg-surface-container-lowest border border-surface-container-highest p-4 rounded-xl shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wider">
              Benchmark Target (Company A)
            </label>
            <select
              value={compAId}
              onChange={(e) => setCompAId(e.target.value)}
              className="w-full bg-surface border border-surface-container-highest rounded-lg px-3 py-2 text-sm font-semibold text-on-surface focus:outline-none focus:border-primary"
            >
              {companies.map((c) => (
                <option key={`a-${c.id}`} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wider">
              Comparison Target (Company B)
            </label>
            <select
              value={compBId}
              onChange={(e) => setCompBId(e.target.value)}
              className="w-full bg-surface border border-surface-container-highest rounded-lg px-3 py-2 text-sm font-semibold text-on-surface focus:outline-none focus:border-primary"
            >
              {companies.map((c) => (
                <option key={`b-${c.id}`} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Loading Skeleton */}
      {loading && (!companyA || !companyB) && (
        <div className="bg-surface-container-lowest border border-surface-container-highest p-6 rounded-xl animate-pulse">
          <div className="h-6 bg-surface-container-low rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-surface-container-low rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-surface-container-low rounded w-1/3"></div>
        </div>
      )}

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Company A comparison segment */}
        {companyA && (
          <article className="bg-surface-container-lowest border border-surface-container-highest rounded-xl p-6 shadow-xs space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 object-contain rounded-lg border border-surface-container-high p-1.5 flex items-center justify-center shrink-0">
                <CompanyLogo name={companyA.name} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-primary tracking-wider">
                  Listing A
                </span>
                <h2 className="text-2xl font-black text-on-surface leading-tight">
                  {companyA.name}
                </h2>
              </div>
            </div>

            {/* Median total comp */}
            <div className="bg-surface p-4 rounded-xl border border-surface-container-high">
              <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                Median Total Comp
              </span>
              <div className="text-2xl font-black text-secondary mt-1">
                {formatMoney(companyA.median_total_compensation)}
              </div>
              <div className="text-xs text-on-surface-variant font-medium mt-1">
                Based on verified peer benchmarks.
              </div>
            </div>

            {/* Span Range */}
            <div>
              <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-2">
                Compensation Span
              </span>
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-sm font-bold text-on-surface">
                  {formatMoney(companyA.minTC, true)}
                </span>
                <span className="text-xs text-on-surface-variant font-medium">to</span>
                <span className="text-sm font-bold text-on-surface">
                  {formatMoney(companyA.maxTC, true)}+
                </span>
              </div>
              <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden">
                <div className="bg-[#ff5a5f] w-4/6 h-full rounded-full"></div>
              </div>
            </div>

            {/* Level Distribution side comparison */}
            <div>
              <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-3">
                Level Distribution (SWE)
              </span>
              <div className="space-y-2 text-xs font-semibold text-on-surface-variant border-t border-surface-container-low pt-3">
                <div className="flex items-center justify-between">
                  <span>L3 (Entry)</span>
                  <span className="text-on-surface font-bold">{companyA.levelDistribution.l3}%</span>
                </div>
                <div className="w-full bg-surface-container-low h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#cde5ff] h-full" style={{ width: `${companyA.levelDistribution.l3}%` }} />
                </div>

                <div className="flex items-center justify-between">
                  <span>L4 (Mid)</span>
                  <span className="text-on-surface font-bold">{companyA.levelDistribution.l4}%</span>
                </div>
                <div className="w-full bg-surface-container-low h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#7bc2ff] h-full" style={{ width: `${companyA.levelDistribution.l4}%` }} />
                </div>

                <div className="flex items-center justify-between">
                  <span>L5 (Senior)</span>
                  <span className="text-on-surface font-bold">{companyA.levelDistribution.l5}%</span>
                </div>
                <div className="w-full bg-surface-container-low h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#006399] h-full" style={{ width: `${companyA.levelDistribution.l5}%` }} />
                </div>

                <div className="flex items-center justify-between">
                  <span>L6+ (Staff+)</span>
                  <span className="text-on-surface font-bold">{companyA.levelDistribution.l6Plus}%</span>
                </div>
                <div className="w-full bg-surface-container-low h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#001d32] h-full" style={{ width: `${companyA.levelDistribution.l6Plus}%` }} />
                </div>
              </div>
            </div>

            {/* Key Facts */}
            <div className="border-t border-surface-container-high pt-4 space-y-2">
              <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                Profile Parameters
              </h4>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-on-surface-variant block font-medium">Headquarters</span>
                  <strong className="text-on-surface font-semibold">{companyA.headquarters || 'Global'}</strong>
                </div>
                <div>
                  <span className="text-on-surface-variant block font-medium">Founded</span>
                  <strong className="text-on-surface font-semibold">{companyA.founded_year || 'N/A'}</strong>
                </div>
                <div>
                  <span className="text-on-surface-variant block font-medium">employees</span>
                  <strong className="text-on-surface font-semibold">{companyA.headcount_range || '10,000+'}</strong>
                </div>
                <div>
                  <span className="text-on-surface-variant block font-medium">Industry</span>
                  <strong className="text-on-surface font-semibold">{companyA.industry || 'Technology'}</strong>
                </div>
              </div>
            </div>
          </article>
        )}

        {/* Company B comparison segment */}
        {companyB && (
          <article className="bg-surface-container-lowest border border-surface-container-highest rounded-xl p-6 shadow-xs space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 object-contain rounded-lg border border-surface-container-high p-1.5 flex items-center justify-center shrink-0">
                <CompanyLogo name={companyB.name} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-primary tracking-wider">
                  Listing B
                </span>
                <h2 className="text-2xl font-black text-on-surface leading-tight">
                  {companyB.name}
                </h2>
              </div>
            </div>

            {/* Median total comp */}
            <div className="bg-surface p-4 rounded-xl border border-surface-container-high">
              <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                Median Total Comp
              </span>
              <div className="text-2xl font-black text-secondary mt-1">
                {formatMoney(companyB.median_total_compensation)}
              </div>
              <div className="text-xs text-on-surface-variant font-medium mt-1">
                Based on verified peer benchmarks.
              </div>
            </div>

            {/* Span Range */}
            <div>
              <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-2">
                Compensation Span
              </span>
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-sm font-bold text-on-surface">
                  {formatMoney(companyB.minTC, true)}
                </span>
                <span className="text-xs text-on-surface-variant font-medium">to</span>
                <span className="text-sm font-bold text-on-surface">
                  {formatMoney(companyB.maxTC, true)}+
                </span>
              </div>
              <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden">
                <div className="bg-[#ff5a5f] w-5/6 h-full rounded-full"></div>
              </div>
            </div>

            {/* Level Distribution side comparison */}
            <div>
              <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-3">
                Level Distribution (SWE)
              </span>
              <div className="space-y-2 text-xs font-semibold text-on-surface-variant border-t border-surface-container-low pt-3">
                <div className="flex items-center justify-between">
                  <span>L3 (Entry)</span>
                  <span className="text-on-surface font-bold">{companyB.levelDistribution.l3}%</span>
                </div>
                <div className="w-full bg-surface-container-low h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#cde5ff] h-full" style={{ width: `${companyB.levelDistribution.l3}%` }} />
                </div>

                <div className="flex items-center justify-between">
                  <span>L4 (Mid)</span>
                  <span className="text-on-surface font-bold">{companyB.levelDistribution.l4}%</span>
                </div>
                <div className="w-full bg-surface-container-low h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#7bc2ff] h-full" style={{ width: `${companyB.levelDistribution.l4}%` }} />
                </div>

                <div className="flex items-center justify-between">
                  <span>L5 (Senior)</span>
                  <span className="text-on-surface font-bold">{companyB.levelDistribution.l5}%</span>
                </div>
                <div className="w-full bg-surface-container-low h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#006399] h-full" style={{ width: `${companyB.levelDistribution.l5}%` }} />
                </div>

                <div className="flex items-center justify-between">
                  <span>L6+ (Staff+)</span>
                  <span className="text-on-surface font-bold">{companyB.levelDistribution.l6Plus}%</span>
                </div>
                <div className="w-full bg-surface-container-low h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#001d32] h-full" style={{ width: `${companyB.levelDistribution.l6Plus}%` }} />
                </div>
              </div>
            </div>

            {/* Key Facts */}
            <div className="border-t border-surface-container-high pt-4 space-y-2">
              <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                Profile Parameters
              </h4>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-on-surface-variant block font-medium">Headquarters</span>
                  <strong className="text-on-surface font-semibold">{companyB.headquarters || 'Global'}</strong>
                </div>
                <div>
                  <span className="text-on-surface-variant block font-medium">Founded</span>
                  <strong className="text-on-surface font-semibold">{companyB.founded_year || 'N/A'}</strong>
                </div>
                <div>
                  <span className="text-on-surface-variant block font-medium">employees</span>
                  <strong className="text-on-surface font-semibold">{companyB.headcount_range || '10,000+'}</strong>
                </div>
                <div>
                  <span className="text-on-surface-variant block font-medium">Industry</span>
                  <strong className="text-on-surface font-semibold">{companyB.industry || 'Technology'}</strong>
                </div>
              </div>
            </div>
          </article>
        )}
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-10">Loading compare...</div>}>
      <CompareContent />
    </Suspense>
  );
}
