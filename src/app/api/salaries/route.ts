import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma, Level, Currency, Source } from '@prisma/client';
import { z } from 'zod';

const salarySubmissionSchema = z.object({
  company_id: z.string().min(1, "Company ID is required"),
  role_id: z.string().min(1, "Role ID is required"),
  level: z.nativeEnum(Level, { errorMap: () => ({ message: "Invalid level" }) }),
  location: z.string().min(1, "Location is required"),
  currency: z.nativeEnum(Currency).optional().default(Currency.USD),
  experience_years: z.number().min(0, "Experience years cannot be negative"),
  company_tenure: z.number().min(0).optional().nullable(),
  base_salary: z.number().int().min(0, "Base salary must be a non-negative integer"),
  bonus: z.number().int().min(0).optional().default(0),
  stock: z.number().int().min(0).optional().default(0),
  signing_bonus: z.number().int().min(0).optional().default(0),
});

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
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    
    // Zod validation
    const parsed = salarySubmissionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Compute server-side
    const total_compensation = data.base_salary + data.bonus + data.stock + data.signing_bonus;

    // Flag anomalies
    const isExtreme = total_compensation > 2000000 || total_compensation < 10000;
    const confidence_score = isExtreme ? 10 : 80;

    const submission = await prisma.salarySubmission.create({
      data: {
        company_id: data.company_id,
        role_id: data.role_id,
        level: data.level,
        location: data.location,
        currency: data.currency,
        experience_years: data.experience_years,
        company_tenure: data.company_tenure,
        base_salary: data.base_salary,
        bonus: data.bonus,
        stock: data.stock,
        signing_bonus: data.signing_bonus,
        total_compensation,
        confidence_score,
        source: Source.UNVERIFIED,
        is_verified: false
      }
    });

    return NextResponse.json({ data: submission }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Invalid company_id or role_id' },
        { status: 400 }
      );
    }

    console.error('Error creating salary submission:', error);
    return NextResponse.json({ error: 'Failed to submit salary' }, { status: 500 });
  }
}
