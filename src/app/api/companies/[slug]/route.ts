import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    const company = await prisma.company.findUnique({
      where: { slug }
    });

    if (!company) {
      return NextResponse.json({ error: true, message: 'Company not found' }, { status: 404 });
    }

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

    const minTC = rawSalaries.length > 0 ? Number(rawSalaries[rawSalaries.length - 1].total_compensation) : 0;
    const maxTC = rawSalaries.length > 0 ? Number(rawSalaries[0].total_compensation) : 0;

    const salaries = rawSalaries.map(salary => ({
      ...salary,
      base_salary: salary.base_salary.toString(),
      bonus: salary.bonus.toString(),
      stock: salary.stock.toString(),
      total_compensation: salary.total_compensation.toString(),
      confidence_score: salary.confidence_score.toNumber(),
    }));

    return NextResponse.json({
      data: {
        ...company,
        median_total_compensation,
        levelDistribution: levelDistributionPercentages,
        minTC,
        maxTC,
        salaries
      }
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
      }
    });
  } catch (error) {
    console.error('Error fetching company:', error);
    return NextResponse.json({ error: true, message: 'Failed to fetch company details' }, { status: 500 });
  }
}
