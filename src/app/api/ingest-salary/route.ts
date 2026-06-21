import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma, Level, Currency, Source } from '@prisma/client';
import { z } from 'zod';

const ingestSchema = z.object({
  company: z.string().min(1, "Company name is required"),
  role: z.string().min(1, "Role is required"),
  level: z.nativeEnum(Level, { message: "Level must be one of: L3, L4, L5, L6, SDE_I, SDE_II, SDE_III, STAFF, PRINCIPAL, IC4, IC5" }),
  location: z.string().min(1, "Location is required"),
  currency: z.nativeEnum(Currency, { message: "Currency must be INR, USD, GBP, or EUR" }),
  experience_years: z.number().int().positive("Experience years must be > 0").lt(51, "Experience years must be < 51"),
  base_salary: z.number().int().positive("Base salary must be > 0"),
  bonus: z.number().int().min(0).optional().default(0),
  stock: z.number().int().min(0).optional().default(0),
  confidence_score: z.number().min(0.0).max(1.0, "Confidence score must be between 0.0 and 1.0"),
});

function normalizeCompany(name: string): { slug: string, normalized: string } {
  const normalized = name
    .toLowerCase()
    .trim()
    .replace(/\b(pvt|ltd|inc|llc|\.com|india)\b/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+$/, '');
  
  const aliases: Record<string, string> = {
    'tata-consultancy-services': 'tcs',
    'tata-consultancy': 'tcs',
    'amazon-web-services': 'amazon',
    'aws': 'amazon',
    'infosys-bpo': 'infosys',
    'wipro-technologies': 'wipro',
    'flipkart-internet': 'flipkart'
  };

  const finalSlug = aliases[normalized] || normalized;
  return { slug: finalSlug, normalized: finalSlug.replace(/-/g, ' ') };
}

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: true, message: 'Invalid JSON payload' }, { status: 400 });
    }

    const parsed = ingestSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return NextResponse.json(
        { error: true, field: firstError.path.join('.'), message: firstError.message },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Normalisation Pipeline
    const { slug, normalized } = normalizeCompany(data.company);
    
    // Find or Create Company
    const companyRecord = await prisma.company.upsert({
      where: { normalized_name: normalized },
      update: {},
      create: {
        name: data.company.trim(),
        slug: slug,
        normalized_name: normalized,
      }
    });

    // Recompute total compensation server-side
    const total_compensation = data.base_salary + data.bonus + data.stock;

    // Duplicate Check
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const tenPercent = data.base_salary * 0.1;
    
    const duplicate = await prisma.salary.findFirst({
      where: {
        company_id: companyRecord.id,
        role: data.role,
        level: data.level,
        location: { equals: data.location, mode: 'insensitive' },
        submitted_at: { gte: fortyEightHoursAgo },
        base_salary: {
          gte: BigInt(Math.floor(data.base_salary - tenPercent)),
          lte: BigInt(Math.ceil(data.base_salary + tenPercent)),
        }
      }
    });

    if (duplicate) {
      return NextResponse.json(
        { error: true, message: 'Duplicate record detected within 48 hours' },
        { status: 409 }
      );
    }

    let finalConfidenceScore = data.confidence_score;

    if (finalConfidenceScore < 0.4) {
      return NextResponse.json(
        { error: true, message: 'Confidence score < 0.4 requires manual human review. Record not auto-inserted.' }, 
        { status: 422 }
      );
    }

    if (finalConfidenceScore < 0.5) {
      finalConfidenceScore = 0.5;
    }

    // Insert record
    const submission = await prisma.salary.create({
      data: {
        company_id: companyRecord.id,
        role: data.role,
        level: data.level,
        location: data.location,
        currency: data.currency,
        experience_years: data.experience_years,
        base_salary: BigInt(data.base_salary),
        bonus: BigInt(data.bonus),
        stock: BigInt(data.stock),
        total_compensation: BigInt(total_compensation),
        confidence_score: new Prisma.Decimal(finalConfidenceScore),
        source: Source.SCRAPED, // Setting to SCRAPED for ingest API
        is_verified: false
      }
    });

    // Serialize BigInt for JSON response
    const serializedSubmission = {
      ...submission,
      base_salary: submission.base_salary.toString(),
      bonus: submission.bonus.toString(),
      stock: submission.stock.toString(),
      total_compensation: submission.total_compensation.toString(),
      confidence_score: submission.confidence_score.toNumber(),
    };

    return NextResponse.json({ data: serializedSubmission }, { status: 201 });
  } catch (error) {
    console.error('Error in /api/ingest-salary:', error);
    return NextResponse.json({ error: true, message: 'Internal server error' }, { status: 500 });
  }
}
