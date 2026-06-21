import prisma from '@/lib/prisma';
import { Level, Currency, Prisma } from '@prisma/client';
import Link from 'next/link';

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$', EUR: '€', GBP: '£', INR: '₹', CAD: 'C$', AUD: 'A$',
};

// Next.js 15: searchParams is a Promise
export default async function SalariesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  
  // 1. Pagination Offset Logic (25 rows max)
  const take = 25;
  const page = typeof params.page === 'string' ? Math.max(1, parseInt(params.page, 10) || 1) : 1;
  const skip = (page - 1) * take;

  // 2. Multi-Filter Parameter Extraction
  const companyFilter = typeof params.company === 'string' ? params.company : undefined;
  const roleFilter = typeof params.role === 'string' ? params.role : undefined;
  const locationFilter = typeof params.location === 'string' ? params.location : undefined;
  
  // Safely cast currency enum
  const currencyFilter = typeof params.currency === 'string' && Object.keys(Currency).includes(params.currency) 
    ? (params.currency as Currency) 
    : undefined;
  
  // Handle level checkboxes (can be single string or array of strings)
  let levelFilter: Level[] | undefined = undefined;
  if (params.level) {
    const rawLevels = Array.isArray(params.level) ? params.level : [params.level];
    const validLevels = rawLevels.filter(l => Object.keys(Level).includes(l)) as Level[];
    if (validLevels.length > 0) {
      levelFilter = validLevels;
    }
  }

  // 3. Dynamic Prisma WHERE Clause Construction
  const whereClause: Prisma.SalarySubmissionWhereInput = {};
  if (companyFilter) {
    whereClause.company = { normalized_name: companyFilter.toLowerCase() };
  }
  if (roleFilter) {
    whereClause.role = { name: { contains: roleFilter, mode: 'insensitive' } };
  }
  if (locationFilter) {
    whereClause.location = { contains: locationFilter, mode: 'insensitive' };
  }
  if (currencyFilter) {
    whereClause.currency = currencyFilter;
  }
  if (levelFilter) {
    whereClause.level = { in: levelFilter };
  }

  // 4. Parallel Query Execution for Performance
  // Fetches both the data and the total count simultaneously to prevent waterfall delays
  const [totalCount, rawSalaries] = await Promise.all([
    prisma.salarySubmission.count({ where: whereClause }),
    prisma.salarySubmission.findMany({
      where: whereClause,
      include: {
        company: true,
        role: true,
      },
      orderBy: { total_compensation: 'desc' },
      skip,
      take,
    })
  ]);

  const totalPages = Math.ceil(totalCount / take);

  // 5. Data Serialization & Localization
  const salaries = rawSalaries.map((salary) => {
    // Shift cents/paise back to whole units
    const scaledCompensation = Number(salary.total_compensation.toString()) / 100;
    
    // Implement en-IN (lakhs/crores) vs en-US (thousands/millions) locale logic
    const locale = salary.currency === 'INR' ? 'en-IN' : 'en-US';
    
    return {
      ...salary,
      formattedCompensation: scaledCompensation.toLocaleString(locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }),
      currencySymbol: CURRENCY_SYMBOLS[salary.currency] || '$'
    };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Tech Compensation Data</h1>
          <p className="mt-2 text-sm text-gray-500">
            Showing {Math.min(skip + 1, totalCount)} to {Math.min(skip + take, totalCount)} of {totalCount.toLocaleString()} submissions.
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
          {companyFilter && (
            <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
              Company: {companyFilter}
            </span>
          )}
          {roleFilter && (
            <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
              Role: {roleFilter}
            </span>
          )}
          {locationFilter && (
            <span className="inline-flex items-center rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10">
              Loc: {locationFilter}
            </span>
          )}
          {levelFilter && levelFilter.map(lvl => (
            <span key={lvl} className="inline-flex items-center rounded-full bg-gray-50 px-2.5 py-0.5 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-700/10">
              Lvl: {lvl}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Company</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Role & Level</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Location</th>
                    <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 pr-6">Total Comp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {salaries.map((salary) => (
                    <tr key={salary.id} className="hover:bg-gray-50 transition-colors">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {salary.company.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span className="font-medium text-gray-700">{salary.role.name}</span>
                        <span className="ml-2 inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                          {salary.level}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {salary.location}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm font-semibold text-gray-900 text-right pr-6">
                        {salary.currencySymbol}{salary.formattedCompensation}
                      </td>
                    </tr>
                  ))}
                  {salaries.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-sm text-gray-500">
                        No salaries found matching your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-b-lg">
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                      {page > 1 && (
                        <Link
                          href={`?page=${page - 1}`}
                          className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                        >
                          <span className="sr-only">Previous</span>
                          &larr; Prev
                        </Link>
                      )}
                      {page < totalPages && (
                        <Link
                          href={`?page=${page + 1}`}
                          className={`relative inline-flex items-center ${page === 1 ? 'rounded-l-md' : ''} rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0`}
                        >
                          <span className="sr-only">Next</span>
                          Next &rarr;
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
