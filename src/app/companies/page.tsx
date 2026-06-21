import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Metadata } from 'next';
import CompanyLogo from '@/components/ui/CompanyLogo';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Top Companies in India — Salaries & Reviews | TalentDash',
  description: 'Browse salaries and compensation data for top tech companies in India including Google, Amazon, Flipkart, TCS, Infosys and more.',
  alternates: { canonical: 'https://talentdash.com/companies' },
};

function formatMoney(amount: bigint) {
  if (amount === 0n) return '—';
  const num = Number(amount);
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(1).replace(/\.0$/, '')}Cr`;
  if (num >= 100000) return `₹${Math.round(num / 100000)}L`;
  return `₹${Math.round(num / 1000)}k`;
}

export default async function CompaniesPage() {
  const rawCompanies = await prisma.company.findMany({
    include: {
      salaries: {
        select: { total_compensation: true }
      }
    },
    orderBy: { name: 'asc' },
  });

  const companies = rawCompanies.map((c) => {
    let median = 0n;
    if (c.salaries.length > 0) {
      const sorted = [...c.salaries].sort((a, b) => a.total_compensation < b.total_compensation ? -1 : 1);
      const mid = Math.floor(sorted.length / 2);
      median = sorted.length % 2 === 0 
        ? (sorted[mid - 1].total_compensation + sorted[mid].total_compensation) / 2n
        : sorted[mid].total_compensation;
    }
    
    return {
      ...c,
      medianTotalComp: median,
      count: c.salaries.length
    };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <header className="mb-6">
        <h1 className="text-3xl md:text-4xl font-extrabold text-on-surface mb-2 tracking-tight">
          Company Profiles
        </h1>
        <p className="text-base text-on-surface-variant max-w-2xl font-normal">
          Gain verified salary insight, range spans, and level density structures across prestigious companies.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((company) => (
          <Link
            key={company.id}
            href={`/companies/${company.slug}`}
            className="bg-surface-container-lowest border border-surface-container-highest rounded-xl p-5 shadow-xs cursor-pointer hover-card-shadow flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg border border-surface-container-highest p-1 bg-surface-container-low flex items-center justify-center shrink-0">
                  <CompanyLogo name={company.name} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-on-surface group-hover:text-primary transition-colors">
                    {company.name}
                  </h3>
                  <span className="text-xs text-on-surface-variant font-medium line-clamp-1">
                    {company.industry || 'Technology'} • {company.headcount_range || '10,000+ Employees'}
                  </span>
                </div>
              </div>
              <p className="text-xs text-on-surface-variant line-clamp-3 mb-4 leading-relaxed">
                {/* @ts-expect-error missing description from Prisma */}
                {company.description || `Browse compensation data, level distribution, and salary ranges for ${company.name} across various roles and locations.`}
              </p>
            </div>

            <div className="pt-3 border-t border-surface-container-low flex justify-between items-center bg-surface p-2.5 rounded-lg">
              <div>
                <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider block mb-0.5">
                  Median Compensation
                </span>
                <div className="text-sm font-bold text-secondary">
                  {formatMoney(company.medianTotalComp)}
                </div>
              </div>
              <span className="text-xs font-semibold text-primary group-hover:underline">
                {company.count} records →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
