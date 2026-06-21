export type Level =
  | 'L3' | 'L4' | 'L5' | 'L6'
  | 'SDE_I' | 'SDE_II' | 'SDE_III'
  | 'STAFF' | 'PRINCIPAL' | 'IC4' | 'IC5';

export type Currency = 'INR' | 'USD' | 'GBP' | 'EUR';
export type Source = 'CONTRIBUTOR' | 'SCRAPED' | 'AI_INFERRED';

export interface Company {
  id: string;
  name: string;
  slug: string;
  normalized_name: string;
  industry: string | null;
  headquarters: string | null;
  founded_year: number | null;
  headcount_range: string | null;
  created_at: string;
  updated_at: string;
}

export interface Salary {
  id: string;
  company_id: string;
  company: Pick<Company, 'name' | 'slug'>;
  role: string;
  level: Level;
  location: string;
  currency: Currency;
  experience_years: number;
  base_salary: string;
  bonus: string;
  stock: string;
  total_compensation: string;
  source: Source;
  confidence_score: number;
  is_verified: boolean;
  submitted_at: string;
}

export interface SalaryMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SalaryApiResponse {
  data: Salary[];
  meta: SalaryMeta;
}

export interface LevelDistribution {
  [level: string]: number;
}

export interface CompanyApiResponse {
  data: {
    company: Company;
    median_total_compensation: string;
    level_distribution: LevelDistribution;
    salaries: Salary[];
  };
}

export interface CompareDelta {
  base_delta: number;
  bonus_delta: number;
  stock_delta: number;
  tc_delta: number;
  experience_delta: number;
}

export interface CompareApiResponse {
  data: {
    record_1: Salary & { company: Company };
    record_2: Salary & { company: Company };
    delta: CompareDelta;
  };
}
