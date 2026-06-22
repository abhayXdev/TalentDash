import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TalentDash — Salary Intelligence for Indian Tech',
  description: 'Compare verified salaries, read real reviews, and prepare for interviews. India\'s career intelligence platform for software engineers and tech professionals.',
  openGraph: {
    title: 'TalentDash — Salary Intelligence for Indian Tech',
    description: 'Compare verified salaries, read real reviews, and prepare for interviews.',
    url: 'https://talentdash.com',
  },
  alternates: { canonical: 'https://talentdash.com' },
};

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
    <div className="min-h-screen bg-surface-container-low">
      {/* Hero Section */}
      <section className="bg-surface-container-lowest border-b border-surface-container-highest">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-5xl font-extrabold text-on-surface leading-[1.1] mb-4 tracking-tight">
            Explore. Compare. <span className="text-primary">Grow.</span>
          </h1>
          <p className="text-lg text-on-surface-variant max-w-2xl mx-auto mb-8 font-medium">
            Explore salaries, compare offers, and make smarter career decisions — all backed by real, structured data from Indian professionals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/salaries"
              className="bg-primary hover:bg-primary-container hover:text-on-primary-container text-white font-semibold px-8 py-3 rounded-xl transition-colors text-base shadow-sm"
            >
              Explore Salaries
            </Link>
            <Link
              href="/compare"
              className="bg-surface-container-lowest border border-surface-container-highest hover:bg-surface-container-low text-on-surface font-semibold px-8 py-3 rounded-xl transition-colors text-base shadow-sm"
            >
              Compare Offers
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="bg-surface-container-lowest border-b border-surface-container-highest">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl font-extrabold text-on-surface">{salaryCount.toLocaleString()}+</p>
              <p className="text-sm text-on-surface-variant mt-1 font-semibold">Salary Records</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-on-surface">{companyCount.toLocaleString()}+</p>
              <p className="text-sm text-on-surface-variant mt-1 font-semibold">Companies</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-on-surface">100%</p>
              <p className="text-sm text-on-surface-variant mt-1 font-semibold">Free</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-on-surface">Verified</p>
              <p className="text-sm text-on-surface-variant mt-1 font-semibold">Real Data</p>
            </div>
          </div>
        </div>
      </section>

      {/* Top Companies */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="text-2xl font-extrabold text-on-surface mb-6 tracking-tight">Top Companies</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {topCompanies.map((company) => (
            <Link
              key={company.id}
              href={`/companies/${company.slug}`}
              className="bg-surface-container-lowest border border-surface-container-highest rounded-xl p-5 shadow-xs cursor-pointer hover-card-shadow transition-all group"
            >
              <h3 className="text-base font-bold text-on-surface group-hover:text-primary transition-colors">{company.name}</h3>
              {company.industry && (
                <p className="text-sm text-on-surface-variant mt-1 font-medium">{company.industry}</p>
              )}
              <p className="text-sm text-secondary font-bold mt-3 group-hover:underline">
                {company._count.salaries} salary records →
              </p>
            </Link>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link href="/salaries" className="text-primary font-bold hover:underline text-sm uppercase tracking-wider">
            View all salary data →
          </Link>
        </div>
      </section>

      {/* Quick Links */}
      <section className="bg-surface-container-lowest border-t border-surface-container-highest">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h2 className="text-xl font-bold text-on-surface mb-6 tracking-tight">Browse by Role</h2>
          <div className="flex flex-wrap gap-3">
            {['Software Engineer', 'Product Manager', 'Data Analyst', 'Data Scientist', 'DevOps Engineer', 'Frontend Engineer'].map((role) => (
              <Link
                key={role}
                href={`/salaries?role=${encodeURIComponent(role)}`}
                className="bg-surface-container-low border border-surface-container-highest hover:border-primary hover:text-primary text-on-surface text-sm font-semibold px-4 py-2 rounded-full transition-colors"
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
