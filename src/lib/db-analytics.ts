import { prisma } from '@/lib/prisma';

export interface PercentileResult {
  p25: number;
  p50: number; // Median
  p75: number;
  p90: number;
}

/**
 * Calculates total compensation percentiles for a specific role globally.
 */
export async function getGlobalRolePercentiles(roleId: string): Promise<PercentileResult | null> {
  const result = await prisma.$queryRaw<
    Array<{
      p25: number | null;
      p50: number | null;
      p75: number | null;
      p90: number | null;
    }>
  >`
    SELECT 
      PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY total_compensation) AS p25,
      PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY total_compensation) AS p50,
      PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY total_compensation) AS p75,
      PERCENTILE_CONT(0.90) WITHIN GROUP (ORDER BY total_compensation) AS p90
    FROM "SalarySubmission"
    WHERE role_id = ${roleId}
  `;

  if (!result || result.length === 0 || result[0].p50 === null) {
    return null;
  }

  return {
    p25: Math.round(result[0].p25 as number),
    p50: Math.round(result[0].p50 as number),
    p75: Math.round(result[0].p75 as number),
    p90: Math.round(result[0].p90 as number),
  };
}

/**
 * Calculates total compensation percentiles for a specific company and role.
 */
export async function getCompanyRolePercentiles(companyId: string, roleId: string): Promise<PercentileResult | null> {
  const result = await prisma.$queryRaw<
    Array<{
      p25: number | null;
      p50: number | null;
      p75: number | null;
      p90: number | null;
    }>
  >`
    SELECT 
      PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY total_compensation) AS p25,
      PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY total_compensation) AS p50,
      PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY total_compensation) AS p75,
      PERCENTILE_CONT(0.90) WITHIN GROUP (ORDER BY total_compensation) AS p90
    FROM "SalarySubmission"
    WHERE company_id = ${companyId} AND role_id = ${roleId}
  `;

  if (!result || result.length === 0 || result[0].p50 === null) {
    return null;
  }

  return {
    p25: Math.round(result[0].p25 as number),
    p50: Math.round(result[0].p50 as number),
    p75: Math.round(result[0].p75 as number),
    p90: Math.round(result[0].p90 as number),
  };
}

/**
 * Company-level aggregation: calculates overall median salary across all roles at a company.
 */
export async function getCompanyOverallMedian(companyId: string): Promise<number | null> {
  const result = await prisma.$queryRaw<Array<{ p50: number | null }>>`
    SELECT 
      PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY total_compensation) AS p50
    FROM "SalarySubmission"
    WHERE company_id = ${companyId}
  `;

  if (!result || result.length === 0 || result[0].p50 === null) return null;
  return Math.round(result[0].p50);
}

/**
 * Role-based compensation distribution: Groups salaries into buckets (e.g., for histograms)
 */
export async function getRoleCompensationDistribution(roleId: string, bucketSize: number = 20000) {
  // Using raw SQL to group into buckets
  const result = await prisma.$queryRaw<
    Array<{
      bucket_floor: number;
      count: number;
    }>
  >`
    SELECT 
      FLOOR(total_compensation / ${bucketSize}) * ${bucketSize} AS bucket_floor,
      COUNT(*)::int AS count
    FROM "SalarySubmission"
    WHERE role_id = ${roleId}
    GROUP BY bucket_floor
    ORDER BY bucket_floor ASC
  `;

  return result.map(r => ({
    bucket_floor: Number(r.bucket_floor),
    count: Number(r.count)
  }));
}
