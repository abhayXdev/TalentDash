import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import CompanyLogo from '@/components/ui/CompanyLogo';
import Badge from '@/components/ui/Badge';


function formatMoney(amountStr: string, isShort = false) {
  const inrValue = Number(amountStr);
  if (inrValue === 0) return '—';
  
  if (isShort) {
    if (inrValue >= 10000000) {
      return `₹${(inrValue / 10000000).toFixed(1).replace(/\.0$/, '')}Cr`;
    }
    if (inrValue >= 100000) {
      return `₹${Math.round(inrValue / 100000)}L`;
    }
    return `₹${Math.round(inrValue / 1000)}k`;
  }
  return '₹' + Math.round(inrValue).toLocaleString('en-IN');
}

async function getCompanyData(slug: string) {
  const company = await prisma.company.findUnique({
    where: { slug }
  });

  if (!company) return null;

  const rawSalaries = await prisma.salary.findMany({
    where: { company_id: company.id },
    orderBy: { total_compensation: 'desc' }
  });

  let median_total_compensation = "0";
  if (rawSalaries.length > 0) {
    const mid = Math.floor(rawSalaries.length / 2);
    if (rawSalaries.length % 2 === 0) {
      const sum = rawSalaries[mid - 1].total_compensation + rawSalaries[mid].total_compensation;
      median_total_compensation = (sum / 2n).toString();
    } else {
      median_total_compensation = rawSalaries[mid].total_compensation.toString();
    }
  }

  const level_distribution = { l3: 0, l4: 0, l5: 0, l6Plus: 0 };
  let totalLevelRecords = 0;
  
  rawSalaries.forEach(s => {
    const lvl = s.level.toUpperCase();
    if (lvl.includes('L3') || lvl.includes('SDE_I')) level_distribution.l3++;
    else if (lvl.includes('L4') || lvl.includes('SDE_II')) level_distribution.l4++;
    else if (lvl.includes('L5') || lvl.includes('SDE_III')) level_distribution.l5++;
    else level_distribution.l6Plus++;
    totalLevelRecords++;
  });

  const levelDistributionPercentages = {
    l3: totalLevelRecords ? Math.round((level_distribution.l3 / totalLevelRecords) * 100) : 0,
    l4: totalLevelRecords ? Math.round((level_distribution.l4 / totalLevelRecords) * 100) : 0,
    l5: totalLevelRecords ? Math.round((level_distribution.l5 / totalLevelRecords) * 100) : 0,
    l6Plus: totalLevelRecords ? Math.round((level_distribution.l6Plus / totalLevelRecords) * 100) : 0,
  };

  const salaries = rawSalaries.map(salary => ({
    ...salary,
    base_salary: salary.base_salary.toString(),
    bonus: salary.bonus.toString(),
    stock: salary.stock.toString(),
    total_compensation: salary.total_compensation.toString(),
    confidence_score: salary.confidence_score.toNumber(),
  }));

  return {
    company,
    median_total_compensation,
    levelDistributionPercentages,
    salaries
  };
}

export async function generateStaticParams() {
  const companies = await prisma.company.findMany({ select: { slug: true } });
  return companies.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCompanyData(slug);

  if (!data) {
    notFound();
  }

  const { company } = data;
  return {
    title: `${company.name} Salaries & Level Distribution | TalentDash`,
    description: `Detailed compensation data and level distribution for ${company.name}. See median TC, level breakdown, and individual salary records.`,
    alternates: { canonical: `https://talentdash.com/companies/${slug}` },
    openGraph: {
      title: `${company.name} Salaries & Level Distribution | TalentDash`,
      description: `Detailed compensation data and level distribution for ${company.name}. See median TC, level breakdown, and individual salary records.`,
      url: `https://talentdash.com/companies/${slug}`,
    },
  };
}

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getCompanyData(slug);

  if (!data) {
    notFound();
  }

  const { company, median_total_compensation, levelDistributionPercentages, salaries } = data;

  const totalRecords = salaries.length;
  const minTC = totalRecords > 0 ? Number(salaries[salaries.length - 1].total_compensation) : 0;
  const maxTC = totalRecords > 0 ? Number(salaries[0].total_compensation) : 0;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": company.name,
            "url": `https://talentdash.com/companies/${company.slug}`,
            "description": `Salary data and compensation intelligence for ${company.name}`,
            "numberOfEmployees": company.headcount_range ? {
              "@type": "QuantitativeValue",
              "description": company.headcount_range
            } : undefined,
            "foundingDate": company.founded_year?.toString(),
            "location": company.headquarters,
          })
        }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <Link
        href="/companies"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline uppercase tracking-wide cursor-pointer"
      >
        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
        Back to all companies
      </Link>

      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-surface-container-highest pb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-surface-container-lowest border border-surface-container-high rounded-xl flex items-center justify-center p-2 overflow-hidden shadow-xs shrink-0">
            <div className="w-full h-full object-contain flex items-center justify-center">
              <CompanyLogo name={company.name} />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-on-surface tracking-tight">
              {company.name}
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-1 font-medium">
              {company.industry || 'Technology'} • Founded {company.founded_year || 'N/A'} • {company.headcount_range || '10,000+'} Employees • {company.headquarters || 'Global'}
            </p>
          </div>
        </div>

        <Link
          href={`/compare?c1=${slug}`}
          className="bg-primary-container hover:bg-primary text-white font-semibold text-xs py-2 px-4 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors self-start md:self-auto"
        >
          <span className="material-symbols-outlined text-[16px]">compare_arrows</span>
          Compare Company
        </Link>
      </header>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card 1: Median comp */}
        <div className="bg-surface-container-lowest border border-surface-container-highest rounded-xl p-5 flex flex-col justify-between shadow-xs">
          <div>
            <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
              Median Total Comp
            </h3>
            <div className="text-3xl font-black text-on-surface tracking-tight">
              {formatMoney(median_total_compensation)}
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-secondary font-semibold text-xs">
            <span className="material-symbols-outlined text-[16px]">trending_up</span>
            <span>Top 5% in tech workspace</span>
          </div>
        </div>

        {/* Card 2: Comp range */}
        <div className="bg-surface-container-lowest border border-surface-container-highest rounded-xl p-5 flex flex-col justify-between shadow-xs">
          <div>
            <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
              Compensation Range
            </h3>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-on-surface">
                {formatMoney(minTC.toString(), true)}
              </span>
              <span className="text-xs text-on-surface-variant px-0.5">-</span>
              <span className="text-lg font-bold text-on-surface">
                {formatMoney(maxTC.toString(), true)}+
              </span>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden flex">
              <div className="bg-[#94ccff] w-1/4 h-full"></div>
              <div className="bg-[#006399] w-2/4 h-full"></div>
              <div className="bg-[#001d32] w-1/4 h-full"></div>
            </div>
            <div className="flex justify-between mt-1.5 text-[10px] font-semibold text-on-surface-variant uppercase tracking-wide">
              <span>L3 (Entry)</span>
              <span>L7+ (Principal)</span>
            </div>
          </div>
        </div>

        {/* Card 3: Level distribution bar representation */}
        <div className="bg-surface-container-lowest border border-surface-container-highest rounded-xl p-5 flex flex-col justify-between shadow-xs">
          <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
            Level Distribution (SWE)
          </h3>
          <div className="flex-1 flex flex-col justify-center">
            {/* Segmented bar */}
            <div className="w-full h-4 rounded-full overflow-hidden flex mb-3">
              <div className="bg-[#cde5ff] h-full" style={{ width: `${levelDistributionPercentages.l3}%` }} title={`L3: ${levelDistributionPercentages.l3}%`} />
              <div className="bg-[#7bc2ff] h-full" style={{ width: `${levelDistributionPercentages.l4}%` }} title={`L4: ${levelDistributionPercentages.l4}%`} />
              <div className="bg-[#006399] h-full" style={{ width: `${levelDistributionPercentages.l5}%` }} title={`L5: ${levelDistributionPercentages.l5}%`} />
              <div className="bg-[#001d32] h-full" style={{ width: `${levelDistributionPercentages.l6Plus}%` }} title={`L6+: ${levelDistributionPercentages.l6Plus}%`} />
            </div>
            {/* Key list */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] font-semibold text-on-surface-variant">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#cde5ff]" /> L3 ({levelDistributionPercentages.l3}%)
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#7bc2ff]" /> L4 ({levelDistributionPercentages.l4}%)
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#006399]" /> L5 ({levelDistributionPercentages.l5}%)
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#001d32]" /> L6+ ({levelDistributionPercentages.l6Plus}%)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description Segment */}
      <section className="bg-surface-container-lowest border border-surface-container-highest p-5 rounded-xl">
        <h3 className="text-sm font-bold text-on-surface mb-2 uppercase tracking-wider">
          Company Description
        </h3>
        <p className="text-sm text-on-surface-variant leading-relaxed font-normal">
          {/* @ts-expect-error missing description from Prisma */}
          {company.description || `Browse compensation data, level distribution, and salary ranges for ${company.name} across various roles and locations. Filter by experience, compare total comp packages, and see accurate base, stock, and bonus breakdowns for software engineers and other technical staff.`}
        </p>
      </section>

      {/* Recent Salaries table list */}
      <section className="space-y-4">
        <div className="flex justify-between items-center border-b border-surface-container-highest pb-2 mt-8">
          <h2 className="text-xl font-bold text-on-surface">
            Recent {company.name} Salaries
          </h2>
          <span className="text-xs text-primary font-bold uppercase tracking-wider">
            All data verified
          </span>
        </div>

        <div className="bg-surface-container-lowest border border-surface-container-highest rounded-xl overflow-hidden shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-surface-container-highest bg-surface">
                <th className="p-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Role & Level</th>
                <th className="p-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider hidden sm:table-cell">Location</th>
                <th className="p-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider hidden sm:table-cell">YOE</th>
                <th className="p-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider text-right">Total Comp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high text-sm font-normal">
              {salaries.map((salary) => {
                const baseConverted = formatMoney(salary.base_salary, true);
                const stockConverted = formatMoney(salary.stock, true);
                const total = salary.total_compensation;

                return (
                  <tr key={salary.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-on-surface">{salary.role}</div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Badge level={salary.level} />
                      </div>
                    </td>
                    <td className="p-4 text-on-surface-variant hidden sm:table-cell">{salary.location}</td>
                    <td className="p-4 text-on-surface-variant hidden sm:table-cell">{salary.experience_years} yrs</td>
                    <td className="p-4 text-right">
                      <div className="font-bold text-on-surface">{formatMoney(total)}</div>
                      <div className="text-[11px] text-on-surface-variant font-medium mt-0.5">
                        {baseConverted} Base • {stockConverted} Stock
                      </div>
                    </td>
                  </tr>
                );
              })}
              {salaries.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-on-surface-variant">
                    No recent salaries recorded for {company.name}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="p-4 text-center border-t border-surface-container-highest bg-surface">
            <span className="text-xs font-semibold text-secondary">
              Currently viewing all {salaries.length} verified listings
            </span>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}
