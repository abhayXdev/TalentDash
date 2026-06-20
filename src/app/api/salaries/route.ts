import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma, Level, Source } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const roleSlug = searchParams.get('role');
    const companySlug = searchParams.get('company');
    const level = searchParams.get('level') as Level | null;
    const location = searchParams.get('location');
    
    const minYoe = searchParams.get('min_yoe');
    const maxYoe = searchParams.get('max_yoe');

    const sort = searchParams.get('sort') || 'recent'; // recent, highest_tc
    
    // Cursor-based pagination
    const cursor = searchParams.get('cursor');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: Prisma.SalarySubmissionWhereInput = {};
    
    if (roleSlug) where.role = { slug: roleSlug };
    if (companySlug) where.company = { slug: companySlug };
    if (level && Object.values(Level).includes(level)) where.level = level;
    if (location) where.location = { contains: location, mode: 'insensitive' };
    
    if (minYoe || maxYoe) {
      where.experience_years = {};
      if (minYoe) where.experience_years.gte = parseFloat(minYoe);
      if (maxYoe) where.experience_years.lte = parseFloat(maxYoe);
    }

    const orderBy: Prisma.SalarySubmissionOrderByWithRelationInput[] = 
      sort === 'highest_tc' 
        ? [{ total_compensation: 'desc' }, { id: 'asc' }] 
        : [{ submitted_at: 'desc' }, { id: 'asc' }];

    const salaries = await prisma.salarySubmission.findMany({
      where,
      take: limit + 1, // Fetch one extra to determine if there's a next page
      cursor: cursor ? { id: cursor } : undefined,
      orderBy,
      include: {
        company: { select: { name: true, slug: true, logo_url: true } },
        role: { select: { name: true, slug: true, category: true } }
      }
    });

    let nextCursor: string | null = null;
    if (salaries.length > limit) {
      const nextItem = salaries.pop();
      nextCursor = nextItem!.id;
    }

    return NextResponse.json({
      data: salaries,
      meta: {
        nextCursor,
        limit
      }
    });
  } catch (error) {
    console.error('Error fetching salaries:', error);
    return NextResponse.json({ error: 'Failed to fetch salaries' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      company_id,
      role_id,
      level,
      location,
      currency,
      experience_years,
      company_tenure,
      base_salary,
      bonus,
      stock,
      signing_bonus
    } = body;

    // Strict validation
    if (!company_id || !role_id || !level || !location || base_salary === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Compute server-side
    const total_compensation = base_salary + (bonus || 0) + (stock || 0) + (signing_bonus || 0);

    // Flag anomalies
    const isExtreme = total_compensation > 2000000 || total_compensation < 10000;
    const confidence_score = isExtreme ? 10 : 80;

    const submission = await prisma.salarySubmission.create({
      data: {
        company_id,
        role_id,
        level,
        location,
        currency: currency || 'USD',
        experience_years: parseFloat(experience_years) || 0,
        company_tenure: company_tenure ? parseFloat(company_tenure) : null,
        base_salary: parseInt(base_salary),
        bonus: parseInt(bonus || 0),
        stock: parseInt(stock || 0),
        signing_bonus: parseInt(signing_bonus || 0),
        total_compensation,
        confidence_score,
        source: Source.UNVERIFIED,
        is_verified: false
      }
    });

    return NextResponse.json({ data: submission }, { status: 201 });
  } catch (error) {
    console.error('Error creating salary submission:', error);
    return NextResponse.json({ error: 'Failed to submit salary' }, { status: 500 });
  }
}
