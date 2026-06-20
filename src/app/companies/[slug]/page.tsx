import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;
  
  const company = await prisma.company.findUnique({
    where: { slug },
    include: {
      salaries: {
        orderBy: { createdAt: 'desc' },
        take: 20,
      }
    }
  });

  if (!company) {
    notFound();
  }

  const totalReports = company.salaries.length;
  const avgCompensation = totalReports > 0 
    ? company.salaries.reduce((acc, curr) => acc + curr.totalCompensation, 0) / totalReports
    : 0;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8 bg-white p-8 rounded-xl shadow-sm border border-slate-100">
        <Link href="/salaries" className="text-blue-600 font-medium hover:underline mb-6 inline-block">&larr; Back to Salaries</Link>
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 bg-slate-100 rounded-lg flex items-center justify-center text-2xl font-bold text-slate-400">
            {company.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-1">{company.name}</h1>
            {company.industry && <p className="text-slate-500 font-medium">{company.industry}</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-10">
        <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100">
          <p className="text-emerald-800 text-sm font-bold uppercase tracking-wider mb-2">Avg Total Comp</p>
          <p className="text-4xl font-black text-emerald-600">${Math.round(avgCompensation).toLocaleString()}</p>
        </div>
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
          <p className="text-blue-800 text-sm font-bold uppercase tracking-wider mb-2">Salary Reports</p>
          <p className="text-4xl font-black text-blue-600">{totalReports}</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-slate-800 mb-6">Recent Salaries</h2>
      {totalReports === 0 ? (
        <div className="p-8 text-center bg-slate-50 rounded-xl text-slate-500 border border-dashed border-slate-200">No salary data available yet.</div>
      ) : (
        <div className="bg-white shadow-sm rounded-xl border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="p-4 text-slate-600 font-semibold">Role</th>
                <th className="p-4 text-slate-600 font-semibold">Compensation</th>
                <th className="p-4 text-slate-600 font-semibold">Level / YOE</th>
                <th className="p-4 text-slate-600 font-semibold">Location</th>
              </tr>
            </thead>
            <tbody>
              {company.salaries.map(s => (
                <tr key={s.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-medium text-slate-800">{s.title}</td>
                  <td className="p-4 text-emerald-600 font-bold">${s.totalCompensation.toLocaleString()}</td>
                  <td className="p-4 text-slate-600">
                    <span className="bg-slate-100 px-2 py-1 rounded text-sm mr-2">{s.level || s.seniority}</span>
                    <span className="text-sm">{s.yoe} YoE</span>
                  </td>
                  <td className="p-4 text-slate-500 text-sm">{s.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
