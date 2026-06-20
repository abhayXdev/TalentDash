import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    const company = await prisma.company.findUnique({
      where: { slug },
      include: {
        salaries: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        }
      }
    });

    if (!company) {
      return NextResponse.json({ error: 'Company not found', status: 404 }, { status: 404 });
    }

    // Calculate basic analytics
    const allSalaries = await prisma.salary.findMany({
      where: { companyId: company.id },
      select: { totalCompensation: true }
    });

    const totalReports = allSalaries.length;
    const avgCompensation = totalReports > 0 
      ? allSalaries.reduce((acc, curr) => acc + curr.totalCompensation, 0) / totalReports
      : 0;

    return NextResponse.json({
      data: {
        ...company,
        analytics: {
          totalReports,
          averageCompensation: Math.round(avgCompensation)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching company:', error);
    return NextResponse.json({ error: 'Failed to fetch company details', status: 500 }, { status: 500 });
  }
}
