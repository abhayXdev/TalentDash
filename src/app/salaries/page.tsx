import Link from 'next/link';
import FilterBar from '@/components/features/FilterBar';

const EXCHANGE_RATE_USD_TO_INR = 83; // 1 USD = 83 INR

function getLevelColor(level: string) {
  if (['L3', 'SDE_I'].includes(level)) return 'bg-slate-100 text-slate-800 ring-slate-600/20';
  if (['L4', 'SDE_II'].includes(level)) return 'bg-blue-100 text-blue-800 ring-blue-600/20';
  if (['L5', 'SDE_III'].includes(level)) return 'bg-indigo-100 text-indigo-800 ring-indigo-600/20';
  if (['L6', 'STAFF'].includes(level)) return 'bg-purple-100 text-purple-800 ring-purple-600/20';
  if (['PRINCIPAL', 'IC5'].includes(level)) return 'bg-sky-100 text-sky-800 ring-sky-600/20'; // navy-ish
  return 'bg-gray-50 text-gray-600 ring-gray-500/10';
}

function formatCurrency(amountStr: string, fromCurrency: string, toCurrency: string) {
  let amount = Number(amountStr);
  if (amount === 0) return "—";

  if (fromCurrency !== toCurrency) {
    if (fromCurrency === 'USD' && toCurrency === 'INR') amount = amount * EXCHANGE_RATE_USD_TO_INR;
    if (fromCurrency === 'INR' && toCurrency === 'USD') amount = amount / EXCHANGE_RATE_USD_TO_INR;
    // simplify GBP/EUR logic for this trial
  }

  const locale = toCurrency === 'INR' ? 'en-IN' : 'en-US';
  const symbol = toCurrency === 'INR' ? '₹' : '$';
  
  return `${symbol}${amount.toLocaleString(locale, { maximumFractionDigits: 0 })}`;
}

export const metadata = {
  title: 'Software Engineer Salaries in India — L3 to L5 | TalentDash',
  description: 'Compare software engineer salaries across top tech companies in India. Filter by role, level, location, and total comp.',
  alternates: { canonical: 'https://talentdash.com/salaries' },
  openGraph: {
    title: 'Software Engineer Salaries in India — L3 to L5 | TalentDash',
    description: 'Compare software engineer salaries across top tech companies in India.',
    url: 'https://talentdash.com/salaries',
  }
};

export default async function SalariesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const queryString = new URLSearchParams(params as Record<string, string>).toString();

  // 1. Fetch from API (Integration Rule FS3)
  const host = process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : 'http://localhost:3000';
  const apiUrl = `${host}/api/salaries?${queryString}`;
  
  const res = await fetch(apiUrl, { cache: 'no-store' }); // Using dynamic fetching for search params
  const { data: salaries, meta } = await res.json();
  
  const displayCurrency = (typeof params.currency === 'string' ? params.currency : 'USD') || 'USD';

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "name": "Software Engineer Salaries in India",
    "description": "Compensation data for tech roles across top companies.",
    "url": "https://talentdash.com/salaries"
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="sm:flex sm:items-center sm:justify-between mb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#222222] tracking-tight">Software Engineer Salaries in India</h1>
          <p className="mt-2 text-sm text-[#717171]">
            Showing {(meta?.page - 1) * meta?.limit + 1} to {Math.min(meta?.page * meta?.limit, meta?.total)} of {meta?.total?.toLocaleString() || 0} records
          </p>
        </div>
      </div>

      <FilterBar />

      <div className="mt-4 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-[#EBEBEB] md:rounded-lg border border-[#EBEBEB]">
              <table className="min-w-full divide-y divide-[#EBEBEB]">
                <thead className="bg-[#F7F7F7]">
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-[#222222] sm:pl-6">Company</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-[#222222]">Role</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-[#222222]">Level</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-[#222222]">Location</th>
                    <th className="px-3 py-3.5 text-right text-sm font-semibold text-[#222222]">Exp. (Yrs)</th>
                    <th className="px-3 py-3.5 text-right text-sm font-semibold text-[#222222]">Base</th>
                    <th className="px-3 py-3.5 text-right text-sm font-semibold text-[#222222]">Stock</th>
                    <th className="px-3 py-3.5 text-right text-sm font-semibold text-[#222222] pr-6 hover:bg-[#F2F2F2] cursor-pointer">
                      <Link href={`?${new URLSearchParams({...params as any, sort: params.sort === 'highest_tc' ? 'recent' : 'highest_tc'}).toString()}`}>
                        Total Comp {params.sort === 'highest_tc' ? '↓' : '↕'}
                      </Link>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBEBEB] bg-[#FFFFFF]">
                  {salaries && salaries.map((salary: any) => (
                    <tr key={salary.id} className="hover:bg-[#F2F2F2] transition-colors">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-[#222222] sm:pl-6">
                        {salary.company.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-[#484848]">
                        {salary.role.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getLevelColor(salary.level)}`}>
                          {salary.level}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-[#717171]">
                        {salary.location}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-[#484848] text-right">
                        {salary.experience_years}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-[#484848] text-right">
                        {formatCurrency(salary.base_salary, salary.currency, displayCurrency)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-[#484848] text-right">
                        {formatCurrency(salary.stock, salary.currency, displayCurrency)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-lg font-bold text-[#0369A1] text-right pr-6">
                        {formatCurrency(salary.total_compensation, salary.currency, displayCurrency)}
                      </td>
                    </tr>
                  ))}
                  {!salaries || salaries.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-sm text-[#717171]">
                        No records found for these filters. <Link href="/salaries" className="text-[#0369A1] underline">Try removing a filter.</Link>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {meta?.totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between border-t border-[#EBEBEB] bg-[#FFFFFF] px-4 py-3 sm:px-6 rounded-b-lg">
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-[#717171]">
                      Page <span className="font-medium text-[#222222]">{meta.page}</span> of <span className="font-medium text-[#222222]">{meta.totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                      {meta.page > 1 && (
                        <Link
                          href={`?${new URLSearchParams({...params as any, page: String(meta.page - 1)}).toString()}`}
                          className="relative inline-flex items-center rounded-l-md px-2 py-2 text-[#717171] ring-1 ring-inset ring-[#EBEBEB] hover:bg-[#F2F2F2]"
                        >
                          Previous
                        </Link>
                      )}
                      {meta.page < meta.totalPages && (
                        <Link
                          href={`?${new URLSearchParams({...params as any, page: String(meta.page + 1)}).toString()}`}
                          className={`relative inline-flex items-center ${meta.page === 1 ? 'rounded-l-md' : ''} rounded-r-md px-2 py-2 text-[#717171] ring-1 ring-inset ring-[#EBEBEB] hover:bg-[#F2F2F2]`}
                        >
                          Next
                        </Link>
                      )}
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
