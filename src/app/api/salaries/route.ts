import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma, Seniority } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Filters
    const companySlug = searchParams.get('company');
    const location = searchParams.get('location');
    const seniority = searchParams.get('seniority') as Seniority | null;

    // Sorting
    const sort = searchParams.get('sort') || 'recent'; // recent, compensation_desc

    const where: Prisma.SalaryWhereInput = {};
    if (companySlug) {
      where.company = { slug: companySlug };
    }
    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }
    if (seniority && Object.values(Seniority).includes(seniority)) {
      where.seniority = seniority;
    }

    const orderBy: Prisma.SalaryOrderByWithRelationInput = 
      sort === 'compensation_desc' ? { totalCompensation: 'desc' } : { createdAt: 'desc' };

    const [salaries, total] = await Promise.all([
      prisma.salary.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          company: {
            select: { name: true, slug: true, logoUrl: true }
          }
        }
      }),
      prisma.salary.count({ where })
    ]);

    return NextResponse.json({
      data: salaries,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching salaries:', error);
    return NextResponse.json({ error: 'Failed to fetch salaries', status: 500 }, { status: 500 });
  }
}
