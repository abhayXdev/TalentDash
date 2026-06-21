import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Metadata } from 'next';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Top Companies in India — Salaries & Reviews | TalentDash',
  description: 'Browse salaries and compensation data for top tech companies in India including Google, Amazon, Flipkart, TCS, Infosys and more.',
  alternates: { canonical: 'https://talentdash.com/companies' },
};

export default async function CompaniesPage() {
  const companies = await prisma.company.findMany({
    include: {
      _count: { select: { salaries: true } },
    },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#222222] leading-[1.1]">
          Top Companies
        </h1>
        <p className="mt-2 text-base text-[#717171]">
          Browse compensation data across {companies.length} companies
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {companies.map((company) => (
          <Link
            key={company.id}
            href={`/companies/${company.slug}`}
            className="bg-white border border-[#EBEBEB] rounded-lg p-5 hover:shadow-md hover:border-[#FF5A5F] transition-all group"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-semibold text-[#222222] group-hover:text-[#FF5A5F] transition-colors">
                  {company.name}
                </h2>
                {company.industry && (
                  <p className="text-sm text-[#717171] mt-1">{company.industry}</p>
                )}
                {company.headquarters && (
                  <p className="text-xs text-[#717171] mt-1">📍 {company.headquarters}</p>
                )}
              </div>
              {company.founded_year && (
                <span className="text-xs text-[#717171] bg-[#F7F7F7] px-2 py-1 rounded">
                  Est. {company.founded_year}
                </span>
              )}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-[#0369A1] font-medium">
                {company._count.salaries} salary records
              </p>
              <span className="text-xs text-[#FF5A5F] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                View →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
