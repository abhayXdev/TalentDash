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
    <div className="min-h-screen bg-transparent">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-surface-container-highest">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-60"></div>
        <div className="absolute top-20 -left-20 w-72 h-72 bg-secondary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 -right-20 w-72 h-72 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" style={{ animationDelay: '2s' }}></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center relative z-10">
          <div className="animate-fade-in-up">
            <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6 border border-primary/20 backdrop-blur-sm shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              India&apos;s Career Intelligence Platform
            </span>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-on-surface leading-[1.1] mb-6 tracking-tight">
              Explore. Compare. <br className="hidden md:block" /><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-rose-400">Grow.</span>
            </h1>
            <p className="text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto mb-10 font-medium leading-relaxed">
              Explore salaries, compare offers, and make smarter career decisions — all backed by real, structured data from Indian professionals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/salaries"
                className="w-full sm:w-auto bg-primary hover:bg-rose-600 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 text-base shadow-lg hover:shadow-primary/30 hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                Explore Salaries
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </Link>
              <Link
                href="/compare"
                className="w-full sm:w-auto bg-surface-container-lowest/80 backdrop-blur-md border border-outline-variant hover:border-primary/40 hover:bg-surface-container-lowest text-on-surface font-semibold px-8 py-4 rounded-xl transition-all duration-300 text-base shadow-sm hover:shadow-md hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                Compare Offers
                <span className="material-symbols-outlined text-[20px]">compare_arrows</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="bg-surface-container-lowest/50 backdrop-blur-sm border-b border-surface-container-highest relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="p-4 rounded-2xl hover:bg-surface-container-lowest transition-colors duration-300 group">
              <p className="text-4xl md:text-5xl font-extrabold text-primary mb-2 group-hover:scale-110 transition-transform">{salaryCount.toLocaleString()}+</p>
              <p className="text-xs md:text-sm text-on-surface-variant font-semibold uppercase tracking-wider">Salary Records</p>
            </div>
            <div className="p-4 rounded-2xl hover:bg-surface-container-lowest transition-colors duration-300 group">
              <p className="text-4xl md:text-5xl font-extrabold text-primary mb-2 group-hover:scale-110 transition-transform">{companyCount.toLocaleString()}+</p>
              <p className="text-xs md:text-sm text-on-surface-variant font-semibold uppercase tracking-wider">Companies</p>
            </div>
            <div className="p-4 rounded-2xl hover:bg-surface-container-lowest transition-colors duration-300 group">
              <p className="text-4xl md:text-5xl font-extrabold text-primary mb-2 group-hover:scale-110 transition-transform">100%</p>
              <p className="text-xs md:text-sm text-on-surface-variant font-semibold uppercase tracking-wider">Free</p>
            </div>
            <div className="p-4 rounded-2xl hover:bg-surface-container-lowest transition-colors duration-300 group">
              <div className="flex justify-center mb-2">
                <span className="material-symbols-outlined text-[40px] md:text-[48px] text-primary group-hover:scale-110 transition-transform">verified_user</span>
              </div>
              <p className="text-xs md:text-sm text-on-surface-variant font-semibold uppercase tracking-wider">Verified Data</p>
            </div>
          </div>
        </div>
      </section>

      {/* Top Companies */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-on-surface tracking-tight mb-2">Top Companies</h2>
            <p className="text-on-surface-variant font-medium text-lg">Explore salaries at the most sought-after workplaces.</p>
          </div>
          <Link href="/companies" className="hidden sm:flex text-primary font-bold hover:underline text-sm uppercase tracking-wider items-center gap-1 transition-all hover:gap-2">
            View all <span className="material-symbols-outlined text-[18px]">arrow_right_alt</span>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {topCompanies.map((company) => (
            <Link
              key={company.id}
              href={`/companies/${company.slug}`}
              className="group bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden flex flex-col h-full"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 via-primary/5 to-transparent rounded-bl-full -mr-4 -mt-4 transition-transform duration-500 group-hover:scale-125"></div>
              
              <div className="flex items-start justify-between relative z-10 mb-4">
                <div>
                  <h3 className="text-xl font-bold text-on-surface group-hover:text-primary transition-colors">{company.name}</h3>
                  {company.industry && (
                    <p className="text-xs text-on-surface-variant mt-1.5 font-semibold bg-surface-container-low inline-block px-2.5 py-1 rounded-md uppercase tracking-wider">
                      {company.industry}
                    </p>
                  )}
                </div>
                <div className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center group-hover:bg-primary/10 transition-colors shrink-0">
                  <span className="material-symbols-outlined text-[24px] text-on-surface-variant group-hover:text-primary transition-colors">corporate_fare</span>
                </div>
              </div>
              
              <div className="mt-auto flex items-center justify-between border-t border-outline-variant pt-5 relative z-10">
                <p className="text-sm text-secondary font-bold group-hover:text-primary transition-colors flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">bar_chart</span>
                  {company._count.salaries} salary records
                </p>
                <div className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center group-hover:bg-primary text-outline group-hover:text-white transition-all duration-300">
                  <span className="material-symbols-outlined text-[18px] transform group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-10 text-center sm:hidden">
          <Link href="/companies" className="bg-surface-container-lowest border border-outline-variant text-on-surface font-bold hover:bg-surface-container-low px-6 py-3 rounded-xl text-sm uppercase tracking-wider inline-flex items-center gap-2 transition-colors">
            View all companies <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
        </div>
      </section>

      {/* Quick Links */}
      <section className="bg-surface-container-lowest/80 backdrop-blur-sm border-t border-surface-container-highest relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-on-surface tracking-tight mb-3">Browse by Role</h2>
            <p className="text-on-surface-variant text-lg">Find specific compensation data for your expertise.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 md:gap-4 max-w-4xl mx-auto">
            {['Software Engineer', 'Product Manager', 'Data Analyst', 'Data Scientist', 'DevOps Engineer', 'Frontend Engineer', 'Backend Engineer', 'Engineering Manager'].map((role) => (
              <Link
                key={role}
                href={`/salaries?role=${encodeURIComponent(role)}`}
                className="bg-surface-container-lowest border border-outline-variant hover:border-primary hover:bg-primary/5 hover:text-primary hover:shadow-md text-on-surface text-sm md:text-base font-semibold px-6 py-3.5 rounded-full transition-all duration-300 transform hover:-translate-y-0.5"
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
