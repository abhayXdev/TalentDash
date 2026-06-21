import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const s1 = searchParams.get('s1');
    const s2 = searchParams.get('s2');

    if (!s1 || !s2) {
      return NextResponse.json({ error: true, message: 'Missing s1 or s2 parameters' }, { status: 400 });
    }

    if (s1 === s2) {
      return NextResponse.json({ error: true, message: 'Identical records cannot be compared' }, { status: 400 });
    }

    const [record1, record2] = await Promise.all([
      prisma.salarySubmission.findUnique({
        where: { id: s1 },
        include: {
          company: { select: { name: true, slug: true, logo_url: true } },
          role: { select: { name: true, slug: true } }
        }
      }),
      prisma.salarySubmission.findUnique({
        where: { id: s2 },
        include: {
          company: { select: { name: true, slug: true, logo_url: true } },
          role: { select: { name: true, slug: true } }
        }
      })
    ]);

    if (!record1 || !record2) {
      return NextResponse.json({ error: true, message: 'One or both records not found' }, { status: 404 });
    }

    // Delta = record1 - record2
    const base_delta = Number(record1.base_salary) - Number(record2.base_salary);
    const bonus_delta = Number(record1.bonus) - Number(record2.bonus);
    const stock_delta = Number(record1.stock) - Number(record2.stock);
    const tc_delta = Number(record1.total_compensation) - Number(record2.total_compensation);
    const experience_delta = record1.experience_years - record2.experience_years;

    const serializeRecord = (r: any) => ({
      ...r,
      base_salary: r.base_salary.toString(),
      bonus: r.bonus.toString(),
      stock: r.stock.toString(),
      signing_bonus: r.signing_bonus.toString(),
      total_compensation: r.total_compensation.toString(),
      confidence_score: r.confidence_score.toNumber(),
    });

    return NextResponse.json({
      data: {
        record_1: serializeRecord(record1),
        record_2: serializeRecord(record2),
        delta: {
          base_delta,
          bonus_delta,
          stock_delta,
          tc_delta,
          experience_delta
        }
      }
    });

  } catch (error) {
    console.error('Error in compare API:', error);
    return NextResponse.json({ error: true, message: 'Failed to compute comparison' }, { status: 500 });
  }
}
