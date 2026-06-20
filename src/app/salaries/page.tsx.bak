import { prisma } from '@/lib/prisma';
import { Prisma, Seniority } from '@prisma/client';
import Link from 'next/link';

export default async function SalariesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  
  const page = parseInt(params.page as string || '1');
  const limit = 10;
  const skip = (page - 1) * limit;
  const sort = (params.sort as string) || 'recent';
  const companySlug = params.company as string | undefined;
  const location = params.location as string | undefined;
  const seniority = params.seniority as Seniority | undefined;

  const where: Prisma.SalaryWhereInput = {};
  if (companySlug) where.company = { slug: companySlug };
  if (location) where.location = { contains: location, mode: 'insensitive' };
  if (seniority && Object.values(Seniority).includes(seniority as Seniority)) where.seniority = seniority;

  const orderBy: Prisma.SalaryOrderByWithRelationInput = 
    sort === 'compensation_desc' ? { totalCompensation: 'desc' } : { createdAt: 'desc' };

  const [salaries, total] = await Promise.all([
    prisma.salary.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        company: { select: { name: true, slug: true } }
      }
    }),
    prisma.salary.count({ where })
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Tech Salaries</h1>
      
      {/* Simple Filter UI (Server Driven) */}
      <div className="flex gap-4 mb-6 bg-gray-100 p-4 rounded-lg flex-wrap">
         <Link href="/salaries" className="text-blue-600 hover:underline px-2 py-1 bg-white rounded shadow-sm">Clear Filters</Link>
         <Link href="?sort=compensation_desc" className="text-blue-600 hover:underline px-2 py-1 bg-white rounded shadow-sm">Highest Paid</Link>
         <Link href="?seniority=SENIOR" className="text-blue-600 hover:underline px-2 py-1 bg-white rounded shadow-sm">Seniors Only</Link>
         <Link href="?seniority=ENTRY" className="text-blue-600 hover:underline px-2 py-1 bg-white rounded shadow-sm">Entry Level</Link>
         <Link href="?company=google" className="text-blue-600 hover:underline px-2 py-1 bg-white rounded shadow-sm">Google Only</Link>
         <Link href="?company=meta" className="text-blue-600 hover:underline px-2 py-1 bg-white rounded shadow-sm">Meta Only</Link>
      </div>

      {salaries.length === 0 ? (
        <div className="p-10 text-center text-gray-500 bg-gray-50 rounded-lg">
          No salaries found matching your filters.
        </div>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg border border-gray-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b">
                <th className="p-4 font-semibold text-slate-700">Role</th>
                <th className="p-4 font-semibold text-slate-700">Company</th>
                <th className="p-4 font-semibold text-slate-700">Total Comp</th>
                <th className="p-4 font-semibold text-slate-700">Level / YOE</th>
                <th className="p-4 font-semibold text-slate-700">Location</th>
              </tr>
            </thead>
            <tbody>
              {salaries.map(s => (
                <tr key={s.id} className="border-b hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-medium text-slate-800">{s.title}</td>
                  <td className="p-4">
                    <Link href={`/companies/${s.company.slug}`} className="text-blue-600 font-medium hover:text-blue-800 hover:underline">
                      {s.company.name}
                    </Link>
                  </td>
                  <td className="p-4 text-emerald-600 font-bold tracking-tight">
                    ${s.totalCompensation.toLocaleString()}
                  </td>
                  <td className="p-4 text-slate-600">
                    <span className="bg-slate-100 px-2 py-1 rounded text-sm mr-2">{s.level || s.seniority}</span>
                    <span className="text-sm">{s.yoe} YoE</span>
                  </td>
                  <td className="p-4 text-slate-600 text-sm">{s.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <Link 
            href={`?page=${page > 1 ? page - 1 : 1}&sort=${sort}`}
            className={`px-4 py-2 bg-slate-100 font-medium text-slate-700 rounded transition-colors ${page === 1 ? 'opacity-50 pointer-events-none' : 'hover:bg-slate-200'}`}
          >
            &larr; Previous
          </Link>
          <span className="text-slate-600 font-medium">Page {page} of {totalPages}</span>
          <Link 
            href={`?page=${page < totalPages ? page + 1 : totalPages}&sort=${sort}`}
            className={`px-4 py-2 bg-slate-100 font-medium text-slate-700 rounded transition-colors ${page === totalPages ? 'opacity-50 pointer-events-none' : 'hover:bg-slate-200'}`}
          >
            Next &rarr;
          </Link>
        </div>
      )}
    </div>
  );
}
