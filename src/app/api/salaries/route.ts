import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma, Level, Currency } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const roleString = searchParams.get('role');
    const companyString = searchParams.get('company');
    const locationString = searchParams.get('location');
    const currencyString = searchParams.get('currency');
    
    const sort = searchParams.get('sort') || 'total_comp_desc'; // date_desc, total_comp_desc, total_comp_asc
    
    let page = parseInt(searchParams.get('page') || '1', 10);
    if (isNaN(page) || page < 1) page = 1;
    let limit = parseInt(searchParams.get('limit') || '25', 10);
    if (isNaN(limit) || limit < 1) limit = 25;
    
    // Hard failure cap
    if (limit > 100) limit = 100;
    
    const skip = (page - 1) * limit;

    const where: Prisma.SalaryWhereInput = {};
    
    if (roleString) {
      where.role = { contains: roleString, mode: 'insensitive' };
    }
    if (companyString) {
      where.company = { normalized_name: { contains: companyString, mode: 'insensitive' } };
    }
    const levelStrings = searchParams.getAll('level');
    const validLevels = levelStrings.filter(l => Object.keys(Level).includes(l)) as Level[];
    if (validLevels.length === 1) {
      where.level = validLevels[0];
    } else if (validLevels.length > 1) {
      where.level = { in: validLevels };
    }
    if (locationString) {
      where.location = { contains: locationString, mode: 'insensitive' };
    }
    if (currencyString && Object.keys(Currency).includes(currencyString)) {
      where.currency = currencyString as Currency;
    }

    let orderBy: Prisma.SalaryOrderByWithRelationInput[] = [{ total_compensation: 'desc' }, { id: 'asc' }];
    if (sort === 'date_desc') orderBy = [{ submitted_at: 'desc' }, { id: 'asc' }];
    if (sort === 'total_comp_asc') orderBy = [{ total_compensation: 'asc' }, { id: 'asc' }];
    if (sort === 'total_comp_desc') orderBy = [{ total_compensation: 'desc' }, { id: 'asc' }];

    const [totalCount, rawSalaries] = await Promise.all([
      prisma.salary.count({ where }),
      prisma.salary.findMany({
        where,
        take: limit,
        skip,
        orderBy,
        include: {
          company: { select: { name: true, slug: true } }
        }
      })
    ]);

    // Serialize BigInt and Decimal for JSON response
    const data = rawSalaries.map(salary => ({
      ...salary,
      base_salary: salary.base_salary.toString(),
      bonus: salary.bonus.toString(),
      stock: salary.stock.toString(),
      total_compensation: salary.total_compensation.toString(),
      confidence_score: salary.confidence_score.toNumber(),
    }));

    return NextResponse.json(
      {
        data,
        meta: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit)
        }
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600'
        }
      }
    );
  } catch (error) {
    console.error('Error fetching salaries:', error);
    return NextResponse.json({ error: 'Failed to fetch salaries' }, { status: 500 });
  }
}
