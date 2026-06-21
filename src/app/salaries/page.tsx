import Link from 'next/link';
import { Suspense } from 'react';
import FilterBar from '@/components/features/FilterBar';
import { CURRENCY_CONFIG } from '@/config/currency';
import Badge from '@/components/ui/Badge';

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
              ? `Showing ${(meta.page - 1) * meta.limit + 1} to ${Math.min(meta.page * meta.limit, meta.total)} of ${meta.total.toLocaleString()} records`
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
                    <th className="px-3 py-3.5 text-right text-sm font-semibold text-[#222222]">Bonus</th>
                    <th className="px-3 py-3.5 text-right text-sm font-semibold text-[#222222]">Stock</th>
                    <th className="px-3 py-3.5 text-right text-sm font-semibold text-[#222222] pr-6 hover:bg-[#F2F2F2] cursor-pointer">
                      <Link href={`?${new URLSearchParams({...params as Record<string, string>, sort: params.sort === 'total_comp_desc' ? 'total_comp_asc' : 'total_comp_desc'}).toString()}`}>
                        Total Comp {params.sort === 'total_comp_desc' ? '↓' : params.sort === 'total_comp_asc' ? '↑' : '↕'}
                      </Link>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBEBEB] bg-[#FFFFFF]">
                  {salaries.length > 0 ? (
                    salaries.map((salary: {id: string, company: {name: string}, role: string, level: string, location: string, experience_years: number, base_salary: string, bonus: string, currency: string, stock: string, total_compensation: string}) => (
                      <tr key={salary.id} className="hover:bg-[#F2F2F2] transition-colors">
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-[#222222] sm:pl-6">
                          {salary.company.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-[#484848]">
                          {salary.role}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <Badge level={salary.level} />
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
                          {formatCurrency(salary.bonus, salary.currency, displayCurrency)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-[#484848] text-right">
                          {formatCurrency(salary.stock, salary.currency, displayCurrency)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-[32px] font-bold text-[#0369A1] text-right pr-6">
                          {formatCurrency(salary.total_compensation, salary.currency, displayCurrency)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="py-10 text-center text-sm text-[#717171]">
                        No records found for these filters.{' '}
                        <Link href="/salaries" className="text-[#0369A1] underline">
                          Try removing a filter.
                        </Link>
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
                          href={`?${new URLSearchParams({...params as Record<string, string>, page: String(meta.page - 1)}).toString()}`}
                          className="relative inline-flex items-center rounded-l-md px-2 py-2 text-[#717171] ring-1 ring-inset ring-[#EBEBEB] hover:bg-[#F2F2F2]"
                        >
                          Previous
                        </Link>
                      )}
                      {meta.page < meta.totalPages && (
                        <Link
                          href={`?${new URLSearchParams({...params as Record<string, string>, page: String(meta.page + 1)}).toString()}`}
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
