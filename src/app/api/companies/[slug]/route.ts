import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCompanyOverallMedian } from '@/lib/db-analytics';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    const company = await prisma.company.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { salaries: true, reviews: true, interviews: true }
        }
      }
    });

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Aggregated salary stats (median overall)
    const overallMedian = await getCompanyOverallMedian(company.id);

    // Role breakdown
    const roleBreakdown = await prisma.salarySubmission.groupBy({
      by: ['role_id'],
      where: { company_id: company.id },
      _count: { _all: true },
      _avg: { total_compensation: true }
    });

    // We can fetch the actual role names
    const roleIds = roleBreakdown.map(r => r.role_id);
    const roles = await prisma.role.findMany({
      where: { id: { in: roleIds } },
      select: { id: true, name: true, slug: true }
    });

    const rolesMap = new Map(roles.map(r => [r.id, r]));

    const enrichedRoleBreakdown = roleBreakdown.map(r => ({
      role: rolesMap.get(r.role_id),
      count: r._count._all,
      avg_total_compensation: Math.round(r._avg.total_compensation || 0)
    }));

    return NextResponse.json({
      data: {
        ...company,
        stats: {
          overall_median: overallMedian,
          total_submissions: company._count.salaries
        },
        roles: enrichedRoleBreakdown
      }
    });
  } catch (error) {
    console.error('Error fetching company:', error);
    return NextResponse.json({ error: 'Failed to fetch company details' }, { status: 500 });
  }
}
