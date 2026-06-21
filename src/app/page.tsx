import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const revalidate = 3600;

export default async function HomePage() {
  const [salaryCount, companyCount] = await Promise.all([
    prisma.salary.count(),
    prisma.company.count(),
  ]);

  const topCompanies = await prisma.company.findMany({
    take: 6,
    include: {
      _count: { select: { salaries: true } },
    },
    orderBy: { created_at: 'desc' },
  });

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Hero Section */}
      <section className="bg-white border-b border-[#EBEBEB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-5xl font-bold text-[#222222] leading-[1.1] mb-4">
            Explore. Compare. <span className="text-[#FF5A5F]">Grow.</span>
          </h1>
          <p className="text-lg text-[#717171] max-w-2xl mx-auto mb-8">
            Explore salaries, compare offers, and make smarter career decisions — all backed by real, structured data from Indian professionals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/salaries"
              className="bg-[#FF5A5F] hover:bg-red-500 text-white font-semibold px-8 py-3 rounded-md transition-colors text-base"
            >
              Explore Salaries
            </Link>
            <Link
              href="/compare"
              className="bg-white border border-[#EBEBEB] hover:bg-[#F2F2F2] text-[#222222] font-semibold px-8 py-3 rounded-md transition-colors text-base"
            >
              Compare Offers
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="bg-white border-b border-[#EBEBEB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-[#222222]">{salaryCount.toLocaleString()}+</p>
              <p className="text-sm text-[#717171] mt-1">Salary Records</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-[#222222]">{companyCount.toLocaleString()}+</p>
              <p className="text-sm text-[#717171] mt-1">Companies</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-[#222222]">100%</p>
              <p className="text-sm text-[#717171] mt-1">Free</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-[#222222]">Verified</p>
              <p className="text-sm text-[#717171] mt-1">Real Data</p>
            </div>
          </div>
        </div>
      </section>

      {/* Top Companies */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="text-2xl font-bold text-[#222222] mb-6">Top Companies</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {topCompanies.map((company) => (
            <Link
              key={company.id}
              href={`/companies/${company.slug}`}
              className="bg-white border border-[#EBEBEB] rounded-lg p-5 hover:shadow-md hover:border-[#FF5A5F] transition-all"
            >
              <h3 className="text-base font-semibold text-[#222222]">{company.name}</h3>
              {company.industry && (
                <p className="text-sm text-[#717171] mt-1">{company.industry}</p>
              )}
              <p className="text-sm text-[#0369A1] font-medium mt-3">
                {company._count.salaries} salary records →
              </p>
            </Link>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link href="/salaries" className="text-[#FF5A5F] font-semibold hover:underline text-sm">
            View all salary data →
          </Link>
        </div>
      </section>

      {/* Quick Links */}
      <section className="bg-white border-t border-[#EBEBEB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h2 className="text-xl font-bold text-[#222222] mb-6">Browse by Role</h2>
          <div className="flex flex-wrap gap-3">
            {['Software Engineer', 'Product Manager', 'Data Analyst', 'Data Scientist', 'DevOps Engineer', 'Frontend Engineer'].map((role) => (
              <Link
                key={role}
                href={`/salaries?role=${encodeURIComponent(role)}`}
                className="bg-[#F7F7F7] border border-[#EBEBEB] hover:border-[#FF5A5F] hover:text-[#FF5A5F] text-[#484848] text-sm font-medium px-4 py-2 rounded-full transition-colors"
              >
                {role}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
