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

    // Fetch all salaries for this company to compute median and level distribution
    const rawSalaries = await prisma.salary.findMany({
      where: { company_id: company.id },
      orderBy: { total_compensation: 'desc' }
    });

    // 1. Median Total Compensation
    let median_total_compensation = "0";
    if (rawSalaries.length > 0) {
      // Already sorted descending
      const mid = Math.floor(rawSalaries.length / 2);
      median_total_compensation = rawSalaries[mid].total_compensation.toString();
    }

    // 2. Level Distribution
    const level_distribution: Record<string, number> = {};
    rawSalaries.forEach(s => {
      level_distribution[s.level] = (level_distribution[s.level] || 0) + 1;
    });

    // 3. Serialize salaries list
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
        company,
        median_total_compensation,
        level_distribution,
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
