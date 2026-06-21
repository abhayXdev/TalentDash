import { PrismaClient, Level, Currency, Source } from '@prisma/client';

const prisma = new PrismaClient();

function normalizeCompany(name: string): { slug: string, normalized: string } {
  const normalized = name
    .toLowerCase()
    .trim()
    .replace(/\b(pvt|ltd|inc|llc|\.com|india)\b/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+$/, '');
  
  // Basic alias lookup
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

async function main() {
  console.log('Clearing data...');
  await prisma.salary.deleteMany();
  await prisma.company.deleteMany();

  console.log('Seeding Companies...');
  const companiesData = [
    { name: 'Google', rawNames: ['Google', 'GOOGLE', 'google', 'Google India'], headquarters: 'Mountain View, CA', founded_year: 1998, headcount_range: '100,000+' },
    { name: 'Amazon', rawNames: ['Amazon', 'Amazon Web Services', 'amazon.com'], headquarters: 'Seattle, WA', founded_year: 1994, headcount_range: '1,000,000+' },
    { name: 'Meta', rawNames: ['Meta'], headquarters: 'Menlo Park, CA', founded_year: 2004, headcount_range: '50,000+' },
    { name: 'Microsoft', rawNames: ['Microsoft'], headquarters: 'Redmond, WA', founded_year: 1975, headcount_range: '200,000+' },
    { name: 'Flipkart', rawNames: ['Flipkart', 'Flipkart Internet Pvt Ltd'], headquarters: 'Bengaluru, India', founded_year: 2007, headcount_range: '30,000+' },
    { name: 'Meesho', rawNames: ['Meesho'], headquarters: 'Bengaluru, India', founded_year: 2015, headcount_range: '1,000+' },
    { name: 'NVIDIA', rawNames: ['NVIDIA'], headquarters: 'Santa Clara, CA', founded_year: 1993, headcount_range: '20,000+' },
    { name: 'TCS', rawNames: ['TCS', 'Tata Consultancy Services', 'TCS Ltd.'], headquarters: 'Mumbai, India', founded_year: 1968, headcount_range: '600,000+' },
    { name: 'Infosys', rawNames: ['Infosys', 'Infosys BPO'], headquarters: 'Bengaluru, India', founded_year: 1981, headcount_range: '300,000+' },
    { name: 'Wipro', rawNames: ['Wipro', 'Wipro Technologies'], headquarters: 'Bengaluru, India', founded_year: 1945, headcount_range: '200,000+' },
    { name: 'Razorpay', rawNames: ['Razorpay'], headquarters: 'Bengaluru, India', founded_year: 2014, headcount_range: '1,000+' },
    { name: 'Zepto', rawNames: ['Zepto'], headquarters: 'Mumbai, India', founded_year: 2021, headcount_range: '1,000+' }
  ];

  const companiesMap = new Map();
  for (const cData of companiesData) {
    const { slug, normalized } = normalizeCompany(cData.rawNames[0]);
    const company = await prisma.company.create({
      data: {
        name: cData.name,
        slug,
        normalized_name: normalized,
        industry: 'Technology',
        headquarters: cData.headquarters,
        founded_year: cData.founded_year,
        headcount_range: cData.headcount_range,
      }
    });
    for (const rawName of cData.rawNames) {
       companiesMap.set(normalizeCompany(rawName).slug, company);
    }
  }

  const roles = ['Software Engineer', 'Data Analyst', 'Product Manager'];
  const locations = ['Bengaluru', 'Mumbai', 'Hyderabad', 'Pune', 'Delhi', 'San Francisco', 'London'];
  const levels = [Level.L3, Level.L4, Level.L5, Level.L6, Level.SDE_I, Level.SDE_II, Level.SDE_III, Level.STAFF, Level.PRINCIPAL, Level.IC4, Level.IC5];

  const submissions = [];

  for (let i = 0; i < 60; i++) {
    const rawCompanyStr = companiesData[i % companiesData.length].rawNames[Math.floor(Math.random() * companiesData[i % companiesData.length].rawNames.length)];
    const compSlug = normalizeCompany(rawCompanyStr).slug;
    const company = companiesMap.get(compSlug);
    
    const role = roles[i % roles.length];
    const level = levels[i % levels.length];
    const loc = locations[i % locations.length];
    
    const isIndia = ['Bengaluru', 'Mumbai', 'Hyderabad', 'Pune', 'Delhi'].includes(loc);
    const currency = isIndia ? Currency.INR : (loc === 'London' ? Currency.GBP : Currency.USD);
    
    const multiplier = isIndia ? 100000 : 1000;
    const base_salary = BigInt(Math.floor(Math.random() * 50 + 10) * multiplier);
    const bonus = BigInt(Math.floor(Math.random() * 10 + 1) * multiplier);
    const stock = BigInt(Math.floor(Math.random() * 30 + 5) * multiplier);
    const total = base_salary + bonus + stock;

    submissions.push({
      company_id: company.id,
      role: role,
      level: level,
      location: loc,
      currency: currency,
      experience_years: Math.floor(Math.random() * 15 + 1),
      base_salary,
      bonus,
      stock,
      total_compensation: total,
      source: Source.CONTRIBUTOR,
      confidence_score: 0.95,
      is_verified: true,
    });
  }

  const google = companiesMap.get('google');
  
  submissions.push({
    company_id: google.id, role: 'Software Engineer', level: Level.L4, location: 'Bengaluru', currency: Currency.INR,
    experience_years: 3, base_salary: 3000000n, bonus: 0n, stock: 1500000n, total_compensation: 4500000n,
    source: Source.CONTRIBUTOR, confidence_score: 0.9, is_verified: true
  });

  submissions.push({
    company_id: google.id, role: 'Software Engineer', level: Level.L3, location: 'Bengaluru', currency: Currency.INR,
    experience_years: 1, base_salary: 2000000n, bonus: 200000n, stock: 0n, total_compensation: 2200000n,
    source: Source.CONTRIBUTOR, confidence_score: 0.9, is_verified: true
  });

  submissions.push({
    company_id: companiesMap.get('amazon').id, role: 'Software Engineer', level: Level.L6, location: 'San Francisco', currency: Currency.USD,
    experience_years: 10, base_salary: 220000n, bonus: 50000n, stock: 800000n, total_compensation: 1070000n,
    source: Source.CONTRIBUTOR, confidence_score: 0.95, is_verified: true
  });

  submissions.push({
    company_id: google.id, role: 'Software Engineer', level: Level.PRINCIPAL, location: 'San Francisco', currency: Currency.USD,
    experience_years: 15, base_salary: 350000n, bonus: 100000n, stock: 1200000n, total_compensation: 1650000n,
    source: Source.CONTRIBUTOR, confidence_score: 0.99, is_verified: true
  });

  for (const sub of submissions) {
    await prisma.salary.create({ data: sub });
  }

  console.log(`Seeding finished successfully. Created ${submissions.length} salary records.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
