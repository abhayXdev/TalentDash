import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';

function getLevelColorHex(level: string) {
  if (['L3', 'SDE_I'].includes(level)) return '#F1F5F9';
  if (['L4', 'SDE_II'].includes(level)) return '#DBEAFE';
  if (['L5', 'SDE_III'].includes(level)) return '#E0E7FF';
  if (['L6', 'STAFF'].includes(level)) return '#F3E8FF';
  if (['PRINCIPAL', 'IC5'].includes(level)) return '#E0F2FE';
  return '#F9FAFB';
}

function getLevelColorClass(level: string) {
  if (['L3', 'SDE_I'].includes(level)) return 'bg-slate-100 text-slate-800 ring-slate-600/20';
  if (['L4', 'SDE_II'].includes(level)) return 'bg-blue-100 text-blue-800 ring-blue-600/20';
  if (['L5', 'SDE_III'].includes(level)) return 'bg-indigo-100 text-indigo-800 ring-indigo-600/20';
  if (['L6', 'STAFF'].includes(level)) return 'bg-purple-100 text-purple-800 ring-purple-600/20';
  if (['PRINCIPAL', 'IC5'].includes(level)) return 'bg-sky-100 text-sky-800 ring-sky-600/20';
  return 'bg-gray-50 text-gray-600 ring-gray-500/10';
}

function formatCurrency(amountStr: string, currency: string) {
  const amount = Number(amountStr);
  if (amount === 0) return '—';
  const locale = currency === 'INR' ? 'en-IN' : 'en-US';
  const symbol = currency === 'INR' ? '₹' : '$';
  return symbol + amount.toLocaleString(locale, { maximumFractionDigits: 0 });
}

async function getCompanyData(slug: string) {
  const host = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const res = await fetch(`${host}/api/companies/${slug}`, {
    next: { revalidate: 86400 },
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data;
}

export async function generateStaticParams() {
  const companies = await prisma.company.findMany({ select: { slug: true } });
  return companies.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCompanyData(slug);

  if (!data) {
    notFound();
  }

  const { company } = data;
  return {
    title: `${company.name} Salaries & Level Distribution | TalentDash`,
    description: `Detailed compensation data and level distribution for ${company.name}. See median TC, level breakdown, and individual salary records.`,
    alternates: { canonical: `https://talentdash.com/companies/${slug}` },
    openGraph: {
      title: `${company.name} Salaries | TalentDash`,
      description: `Compensation data for ${company.name}.`,
      url: `https://talentdash.com/companies/${slug}`,
    },
  };
}

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getCompanyData(slug);

  if (!data) {
    notFound();
  }

  const { company, median_total_compensation, level_distribution, salaries } = data;

  const totalRecords = salaries.length;
  const isINR = salaries.filter((s: any) => s.currency === 'INR').length > totalRecords / 2;
  const primaryCurrency = isINR ? 'INR' : 'USD';

  const minTC = totalRecords > 0 ? Number(salaries[salaries.length - 1].total_compensation) : 0;
  const maxTC = totalRecords > 0 ? Number(salaries[0].total_compensation) : 0;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: company.name,
    url: `https://talentdash.com/companies/${slug}`,
    industry: company.industry,
    foundingDate: company.founded_year ? String(company.founded_year) : undefined,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mb-6">
        <Link href="/salaries" className="text-sm font-medium text-[#717171] hover:text-[#222222]">
          ← Back to Salaries
        </Link>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-[#EBEBEB] mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold text-[#222222] capitalize leading-[1.1]">
              {company.name}
            </h1>
            <div className="mt-2 flex items-center flex-wrap gap-3 text-sm text-[#717171]">
              {company.industry && (
                <span className="bg-gray-100 px-2 py-1 rounded-md">{company.industry}</span>
              )}
              {company.headquarters && <span>📍 {company.headquarters}</span>}
              {company.founded_year && <span>Founded: {company.founded_year}</span>}
              {company.headcount_range && <span>👥 {company.headcount_range} employees</span>}
            </div>
          </div>
          <Link
            href={`/compare?c1=${company.slug}`}
            className="bg-[#FF5A5F] hover:bg-red-500 text-white font-semibold py-2 px-4 rounded-md shadow-sm transition-colors"
          >
            Compare {company.name}
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-[#EBEBEB]">
          <p className="text-[13px] font-medium text-[#717171] mb-1">Median Total Compensation</p>
          <p className="text-[32px] font-bold text-[#0369A1] leading-[1.1]">
            {formatCurrency(median_total_compensation, primaryCurrency)}
          </p>
          <p className="text-xs text-[#717171] mt-2">Computed from {totalRecords} records</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-[#EBEBEB]">
          <p className="text-[13px] font-medium text-[#717171] mb-1">Compensation Range</p>
          <p className="text-[28px] font-bold text-[#222222] mt-2">
            {formatCurrency(minTC.toString(), primaryCurrency)} –{' '}
            {formatCurrency(maxTC.toString(), primaryCurrency)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-[#EBEBEB]">
          <p className="text-sm font-medium text-[#717171] mb-4">Level Distribution</p>
          <div className="w-full h-4 rounded-full flex overflow-hidden">
            {Object.entries(level_distribution).map(([lvl, count]: any) => {
              const pct = (count / totalRecords) * 100;
              return (
                <div
                  key={lvl}
                  style={{ width: `${pct}%`, backgroundColor: getLevelColorHex(lvl) }}
                  title={`${lvl}: ${count} records (${pct.toFixed(1)}%)`}
                  className="h-full border-r border-white last:border-r-0"
                />
              );
            })}
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {Object.entries(level_distribution).map(([lvl, count]: any) => (
              <span key={lvl} className="text-xs text-gray-600">
                <span
                  className="inline-block w-2 h-2 rounded-full mr-1"
                  style={{ backgroundColor: getLevelColorHex(lvl) }}
                />
                {lvl}: {count}
              </span>
            ))}
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-[#222222] mb-4">Salary Submissions</h2>
      <div className="overflow-hidden shadow ring-1 ring-[#EBEBEB] md:rounded-lg border border-[#EBEBEB]">
        <table className="min-w-full divide-y divide-[#EBEBEB]">
          <thead className="bg-[#F7F7F7]">
            <tr>
              <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-[#222222] sm:pl-6">Role</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-[#222222]">Level</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-[#222222]">Location</th>
              <th className="px-3 py-3.5 text-right text-sm font-semibold text-[#222222]">Exp.</th>
              <th className="px-3 py-3.5 text-right text-sm font-semibold text-[#222222]">Base</th>
              <th className="px-3 py-3.5 text-right text-sm font-semibold text-[#222222]">Stock</th>
              <th className="px-3 py-3.5 text-right text-sm font-semibold text-[#222222] pr-6">Total Comp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EBEBEB] bg-white">
            {salaries.map((salary: any) => (
              <tr key={salary.id} className="hover:bg-[#F2F2F2] transition-colors">
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-[#222222] sm:pl-6">
                  {salary.role}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm">
                  <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getLevelColorClass(salary.level)}`}>
                    {salary.level}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-[#717171]">{salary.location}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-[#484848] text-right">{salary.experience_years}y</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-[#484848] text-right">
                  {formatCurrency(salary.base_salary, salary.currency)}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-[#484848] text-right">
                  {formatCurrency(salary.stock, salary.currency)}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-[32px] font-bold text-[#0369A1] text-right pr-6">
                  {formatCurrency(salary.total_compensation, salary.currency)}
                </td>
              </tr>
            ))}
            {salaries.length === 0 && (
              <tr>
                <td colSpan={7} className="py-10 text-center text-sm text-[#717171]">
                  No salary records found for this company.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
