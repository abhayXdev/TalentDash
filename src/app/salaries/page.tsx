import Link from 'next/link';
import { Suspense } from 'react';
import FilterBar from '@/components/features/FilterBar';
import { CURRENCY_CONFIG } from '@/config/currency';
import Badge from '@/components/ui/Badge';
import CompanyLogo from '@/components/ui/CompanyLogo';

export const revalidate = 300;

function formatCurrency(amountStr: string, fromCurrency: string, toCurrency: string) {
  let amount = Number(amountStr);
  if (amount === 0) return "—";

  if (fromCurrency !== toCurrency) {
    if (fromCurrency === 'USD' && toCurrency === 'INR') amount = amount * CURRENCY_CONFIG.EXCHANGE_RATE_USD_TO_INR;
    if (fromCurrency === 'INR' && toCurrency === 'USD') amount = amount / CURRENCY_CONFIG.EXCHANGE_RATE_USD_TO_INR;
    if (fromCurrency === 'GBP' && toCurrency === 'INR') amount = amount * CURRENCY_CONFIG.EXCHANGE_RATE_GBP_TO_INR;
    if (fromCurrency === 'EUR' && toCurrency === 'INR') amount = amount * CURRENCY_CONFIG.EXCHANGE_RATE_EUR_TO_INR;
  }

  const locale = toCurrency === 'INR' ? 'en-IN' : 'en-US';
  const symbol = toCurrency === 'INR' ? '₹' : '$';
  return symbol + amount.toLocaleString(locale, { maximumFractionDigits: 0 });
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const role = typeof params.role === 'string' ? params.role : null;
  const company = typeof params.company === 'string' ? params.company : null;
  const location = typeof params.location === 'string' ? params.location : null;

  let title = 'Tech Salaries in India | TalentDash';
  let description = 'Compare verified salary data across top tech companies in India. Filter by role, level, location and more.';

  if (role && company && location) {
    title = `${role} Salaries at ${company} in ${location} | TalentDash`;
    description = `See verified ${role} compensation at ${company} in ${location}. Base salary, bonus, stock and total comp.`;
  } else if (role && company) {
    title = `${role} Salaries at ${company} | TalentDash`;
    description = `Verified ${role} salary data at ${company}. Compare levels, locations and total compensation.`;
  } else if (role && location) {
    title = `${role} Salaries in ${location} | TalentDash`;
    description = `Compare ${role} compensation in ${location} across top tech companies.`;
  } else if (role) {
    title = `${role} Salaries in India | TalentDash`;
    description = `Verified ${role} salary data across top Indian tech companies. Compare by level and location.`;
  } else if (company) {
    title = `${company} Salaries | TalentDash`;
    description = `See all verified salary records at ${company}. Compare roles, levels and total compensation.`;
  }

  return {
    title,
    description,
    alternates: { canonical: 'https://talentdash.com/salaries' },
    openGraph: { title, description, url: 'https://talentdash.com/salaries' },
  };
}

import { prisma } from '@/lib/prisma';
import { Prisma, Level, Currency } from '@prisma/client';

async function getSalariesData(params: Record<string, string | string[] | undefined>) {
  const roleString = typeof params.role === 'string' ? params.role : undefined;
  const companyString = typeof params.company === 'string' ? params.company : undefined;
  const levelParams = Array.isArray(params.level)
    ? params.level
    : params.level
    ? [params.level]
    : [];
  const locationString = typeof params.location === 'string' ? params.location : undefined;
  const currencyString = typeof params.currency === 'string' ? params.currency : undefined;
  
  const sort = typeof params.sort === 'string' ? params.sort : 'total_comp_desc';
  
  let page = parseInt(typeof params.page === 'string' ? params.page : '1', 10);
  if (isNaN(page) || page < 1) page = 1;
  let limit = parseInt(typeof params.limit === 'string' ? params.limit : '25', 10);
  if (isNaN(limit) || limit < 1) limit = 25;
  if (limit > 100) limit = 100;
  
  const skip = (page - 1) * limit;

  const where: Prisma.SalaryWhereInput = {};
  
  if (roleString) {
    where.role = { contains: roleString, mode: 'insensitive' };
  }
  if (companyString) {
    where.company = { normalized_name: { contains: companyString, mode: 'insensitive' } };
  }
  const validLevels = levelParams.filter(l => Object.keys(Level).includes(l)) as Level[];
  if (validLevels.length === 1) {
    where.level = validLevels[0];
  } else if (validLevels.length > 1) {
    where.level = { in: validLevels };
  }
  if (locationString) {
    where.location = { contains: locationString, mode: 'insensitive' };
  }
  if (currencyString && Object.keys(Currency).includes(currencyString)) {
    where.currency = currencyString as Currency;
  }

  let orderBy: Prisma.SalaryOrderByWithRelationInput[] = [{ total_compensation: 'desc' }, { id: 'asc' }];
  if (sort === 'date_desc') orderBy = [{ submitted_at: 'desc' }, { id: 'asc' }];
  if (sort === 'total_comp_asc') orderBy = [{ total_compensation: 'asc' }, { id: 'asc' }];
  if (sort === 'total_comp_desc') orderBy = [{ total_compensation: 'desc' }, { id: 'asc' }];

  const [totalCount, rawSalaries] = await Promise.all([
    prisma.salary.count({ where }),
    prisma.salary.findMany({
      where,
      take: limit,
      skip,
      orderBy,
      include: {
        company: { select: { name: true, slug: true } }
      }
    })
  ]);

  const salaries = rawSalaries.map(salary => ({
    ...salary,
    base_salary: salary.base_salary.toString(),
    bonus: salary.bonus.toString(),
    stock: salary.stock.toString(),
    total_compensation: salary.total_compensation.toString(),
    confidence_score: salary.confidence_score.toNumber(),
  }));

  return {
    data: salaries,
    meta: {
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit)
    }
  };
}

async function getFilterOptions() {
  const [rolesRaw, locationsRaw] = await Promise.all([
    prisma.salary.findMany({
      select: { role: true },
      distinct: ['role'],
      orderBy: { role: 'asc' },
    }),
    prisma.salary.findMany({
      select: { location: true },
      distinct: ['location'],
      orderBy: { location: 'asc' },
    }),
  ]);
  return {
    roles: rolesRaw.map(r => r.role),
    locations: locationsRaw.map(l => l.location),
  };
}

export default async function SalariesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const { data: salaries, meta } = await getSalariesData(params);
  const { roles, locations } = await getFilterOptions();
  
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
          <h1 className="text-4xl font-bold text-deep-text leading-[1.1]">
            {typeof params.role === 'string' && params.role
              ? typeof params.company === 'string' && params.company
                ? `${params.role} Salaries at ${params.company}`
                : typeof params.location === 'string' && params.location
                ? `${params.role} Salaries in ${params.location}`
                : `${params.role} Salaries in India`
              : typeof params.company === 'string' && params.company
              ? `${params.company} Salaries`
              : 'Tech Salaries in India'}
          </h1>
          <p className="mt-2 text-base text-muted-text">
            {meta?.total > 0
              ? `${meta.total.toLocaleString()} records found`
              : 'No records found'}
          </p>
        </div>
      </div>

      <Suspense fallback={
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200 mb-6 h-32 animate-pulse" />
      }>
        <FilterBar availableRoles={roles} availableLocations={locations} />
      </Suspense>

      <div className="mt-4 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="bg-surface-container-lowest border border-surface-container-highest rounded-xl shadow-xs overflow-hidden">
              <table className="w-full border-collapse text-left min-w-[900px]">
                <thead>
                  <tr className="bg-surface border-b border-surface-container-highest">
                    <th className="py-3 px-5 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Company</th>
                    <th className="py-3 px-5 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Role</th>
                    <th className="py-3 px-5 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Level</th>
                    <th className="py-3 px-5 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Location</th>
                    <th className="py-3 px-5 text-xs font-semibold text-on-surface-variant uppercase tracking-wider text-right">Exp. (Yrs)</th>
                    <th className="py-3 px-5 text-xs font-semibold text-on-surface-variant uppercase tracking-wider text-right">Base</th>
                    <th className="py-3 px-5 text-xs font-semibold text-on-surface-variant uppercase tracking-wider text-right">Bonus</th>
                    <th className="py-3 px-5 text-xs font-semibold text-on-surface-variant uppercase tracking-wider text-right">Stock</th>
                    <th className="py-3 px-5 text-xs font-semibold text-on-surface-variant uppercase tracking-wider text-right cursor-pointer hover:text-primary transition-colors">
                      <Link href={`?${new URLSearchParams({...params as Record<string, string>, sort: params.sort === 'total_comp_desc' ? 'total_comp_asc' : 'total_comp_desc'}).toString()}`}>
                        Total Comp {params.sort === 'total_comp_desc' ? '↓' : params.sort === 'total_comp_asc' ? '↑' : '↕'}
                      </Link>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high bg-surface-container-lowest">
                  {salaries.length > 0 ? (
                    salaries.map((salary: {id: string, company: {name: string}, role: string, level: string, location: string, experience_years: number, base_salary: string, bonus: string, currency: string, stock: string, total_compensation: string}) => (
                      <tr key={salary.id} className="hover:bg-surface-container-low hover:shadow-[inset_4px_0_0_0_var(--color-secondary)] transition-all cursor-pointer group">
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <CompanyLogo name={salary.company.name} />
                            <span className="font-semibold text-on-surface hover:text-primary transition-colors">{salary.company.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-5 text-sm text-on-surface font-medium">
                          {salary.role}
                        </td>
                        <td className="py-4 px-5">
                          <Badge level={salary.level} />
                        </td>
                        <td className="py-4 px-5 text-sm text-on-surface-variant">
                          {salary.location}
                        </td>
                        <td className="py-4 px-5 text-sm text-on-surface text-right font-mono">
                          {salary.experience_years}
                        </td>
                        <td className="py-4 px-5 text-sm text-on-surface text-right font-mono">
                          {formatCurrency(salary.base_salary, salary.currency, displayCurrency)}
                        </td>
                        <td className="py-4 px-5 text-sm text-on-surface text-right font-mono">
                          {formatCurrency(salary.bonus, salary.currency, displayCurrency)}
                        </td>
                        <td className="py-4 px-5 text-sm text-on-surface text-right font-mono">
                          {formatCurrency(salary.stock, salary.currency, displayCurrency)}
                        </td>
                        <td className="py-4 px-5 text-right">
                          <span className="text-[22px] font-bold text-[#0369A1] font-mono leading-none">
                            {formatCurrency(salary.total_compensation, salary.currency, displayCurrency)}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-on-surface-variant font-medium">
                        No records found matching your filters.{' '}
                        <Link href="/salaries" className="text-primary hover:underline">
                          Try removing a filter.
                        </Link>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {meta?.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-surface-container-high gap-4 bg-surface-container-lowest">
                <p className="text-xs text-on-surface-variant">
                  Showing <span className="font-semibold text-on-surface">{(meta.page - 1) * meta.limit + 1}</span> to <span className="font-semibold text-on-surface">{Math.min(meta.page * meta.limit, meta.total)}</span> of <span className="font-semibold text-on-surface">{meta.total}</span> records
                </p>
                <div className="flex items-center gap-2">
                  {meta.page > 1 && (
                    <Link
                      href={`?${new URLSearchParams({...params as Record<string, string>, page: String(meta.page - 1)}).toString()}`}
                      className="px-3.5 py-1.5 border border-surface-container-highest rounded-lg text-xs font-semibold text-on-surface-variant bg-surface-container-lowest hover:bg-surface-container-low transition-colors"
                    >
                      Previous
                    </Link>
                  )}
                  {meta.page < meta.totalPages && (
                    <Link
                      href={`?${new URLSearchParams({...params as Record<string, string>, page: String(meta.page + 1)}).toString()}`}
                      className="px-3.5 py-1.5 border border-surface-container-highest rounded-lg text-xs font-semibold text-on-surface-variant bg-surface-container-lowest hover:bg-surface-container-low transition-colors"
                    >
                      Next
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
