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
  await prisma.interview.deleteMany();
  await prisma.review.deleteMany();
  await prisma.salarySubmission.deleteMany();
  await prisma.role.deleteMany();
  await prisma.company.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding Companies...');
  const companiesData = [
    { name: 'Google', rawNames: ['Google', 'GOOGLE', 'google', 'Google India'] },
    { name: 'Amazon', rawNames: ['Amazon', 'Amazon Web Services', 'amazon.com'] },
    { name: 'Meta', rawNames: ['Meta'] },
    { name: 'Microsoft', rawNames: ['Microsoft'] },
    { name: 'Flipkart', rawNames: ['Flipkart', 'Flipkart Internet Pvt Ltd'] },
    { name: 'Meesho', rawNames: ['Meesho'] },
    { name: 'NVIDIA', rawNames: ['NVIDIA'] },
    { name: 'TCS', rawNames: ['TCS', 'Tata Consultancy Services', 'TCS Ltd.'] },
    { name: 'Infosys', rawNames: ['Infosys', 'Infosys BPO'] },
    { name: 'Wipro', rawNames: ['Wipro', 'Wipro Technologies'] },
    { name: 'Razorpay', rawNames: ['Razorpay'] },
    { name: 'Zepto', rawNames: ['Zepto'] }
  ];

  const companiesMap = new Map();
  for (const cData of companiesData) {
    // Demonstrate normalization on the first raw name
    const { slug, normalized } = normalizeCompany(cData.rawNames[0]);
    const company = await prisma.company.create({
      data: {
        name: cData.name,
        slug,
        normalized_name: normalized,
        industry: 'Technology',
      }
    });
    // Add all raw name permutations to the map so we can use them to find the company ID
    for (const rawName of cData.rawNames) {
       companiesMap.set(normalizeCompany(rawName).slug, company);
    }
  }

  console.log('Seeding Roles...');
  const sweRole = await prisma.role.create({
    data: { name: 'Software Engineer', slug: 'software-engineer', category: 'Engineering' }
  });
  const dataRole = await prisma.role.create({
    data: { name: 'Data Analyst', slug: 'data-analyst', category: 'Data' }
  });
  const pmRole = await prisma.role.create({
    data: { name: 'Product Manager', slug: 'product-manager', category: 'Product' }
  });
  const roles = [sweRole, dataRole, pmRole];

  console.log('Seeding Salaries...');
  const locations = ['Bengaluru', 'Mumbai', 'Hyderabad', 'Pune', 'Delhi', 'San Francisco', 'London'];
  const levels = [Level.L3, Level.L4, Level.L5, Level.L6, Level.SDE_I, Level.SDE_II, Level.SDE_III, Level.STAFF, Level.PRINCIPAL, Level.IC4, Level.IC5];

  const submissions = [];

  // Generate 60 realistic records
  for (let i = 0; i < 60; i++) {
    const rawCompanyStr = companiesData[i % companiesData.length].rawNames[Math.floor(Math.random() * companiesData[i % companiesData.length].rawNames.length)];
    const compSlug = normalizeCompany(rawCompanyStr).slug;
    const company = companiesMap.get(compSlug);
    
    const role = roles[i % roles.length];
    const level = levels[i % levels.length];
    const loc = locations[i % locations.length];
    
    const isIndia = ['Bengaluru', 'Mumbai', 'Hyderabad', 'Pune', 'Delhi'].includes(loc);
    const currency = isIndia ? Currency.INR : (loc === 'London' ? Currency.GBP : Currency.USD);
    
    // Realistic comp generation (randomized)
    const multiplier = isIndia ? 100000 : 1000;
    const base_salary = BigInt(Math.floor(Math.random() * 50 + 10) * multiplier);
    const bonus = BigInt(Math.floor(Math.random() * 10 + 1) * multiplier);
    const stock = BigInt(Math.floor(Math.random() * 30 + 5) * multiplier);
    const total = base_salary + bonus + stock;

    submissions.push({
      company_id: company.id,
      role_id: role.id,
      level: level,
      location: loc,
      currency: currency,
      experience_years: parseFloat((Math.random() * 15 + 1).toFixed(1)),
      base_salary,
      bonus,
      stock,
      total_compensation: total,
      source: Source.CONTRIBUTOR,
      confidence_score: 0.95,
      is_verified: true,
    });
  }

  // Edge Cases
  const google = companiesMap.get('google');
  
  // 1. Zero bonus
  submissions.push({
    company_id: google.id, role_id: sweRole.id, level: Level.L4, location: 'Bengaluru', currency: Currency.INR,
    experience_years: 3, base_salary: 3000000n, bonus: 0n, stock: 1500000n, total_compensation: 4500000n,
    source: Source.CONTRIBUTOR, confidence_score: 0.9, is_verified: true
  });

  // 2. Zero stock
  submissions.push({
    company_id: google.id, role_id: sweRole.id, level: Level.L3, location: 'Bengaluru', currency: Currency.INR,
    experience_years: 1, base_salary: 2000000n, bonus: 200000n, stock: 0n, total_compensation: 2200000n,
    source: Source.CONTRIBUTOR, confidence_score: 0.9, is_verified: true
  });

  // 3. Very high equity
  submissions.push({
    company_id: companiesMap.get('amazon').id, role_id: sweRole.id, level: Level.L6, location: 'San Francisco', currency: Currency.USD,
    experience_years: 10, base_salary: 220000n, bonus: 50000n, stock: 800000n, total_compensation: 1070000n,
    source: Source.CONTRIBUTOR, confidence_score: 0.95, is_verified: true
  });

  // 4. Principal Level
  submissions.push({
    company_id: google.id, role_id: sweRole.id, level: Level.PRINCIPAL, location: 'San Francisco', currency: Currency.USD,
    experience_years: 15, base_salary: 350000n, bonus: 100000n, stock: 1200000n, total_compensation: 1650000n,
    source: Source.CONTRIBUTOR, confidence_score: 0.99, is_verified: true
  });

  // Insert all submissions
  for (const sub of submissions) {
    await prisma.salarySubmission.create({ data: sub });
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
