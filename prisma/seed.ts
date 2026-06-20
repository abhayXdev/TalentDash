import { PrismaClient, Level, Currency, Source } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing data...');
  await prisma.salary.deleteMany();
  await prisma.company.deleteMany();

  console.log('Seeding companies...');
  const companies = [
    { name: 'Google', slug: 'google', normalized_name: 'google', industry: 'Technology', headquarters: 'Mountain View, CA', founded_year: 1998, headcount_range: '100000+' },
    { name: 'Meta', slug: 'meta', normalized_name: 'meta', industry: 'Technology', headquarters: 'Menlo Park, CA', founded_year: 2004, headcount_range: '50000-100000' },
    { name: 'Apple', slug: 'apple', normalized_name: 'apple', industry: 'Technology', headquarters: 'Cupertino, CA', founded_year: 1976, headcount_range: '100000+' },
    { name: 'Amazon', slug: 'amazon', normalized_name: 'amazon', industry: 'Technology', headquarters: 'Seattle, WA', founded_year: 1994, headcount_range: '100000+' },
    { name: 'Netflix', slug: 'netflix', normalized_name: 'netflix', industry: 'Technology', headquarters: 'Los Gatos, CA', founded_year: 1997, headcount_range: '10000-50000' },
  ];

  const createdCompanies = [];
  for (const c of companies) {
    createdCompanies.push(await prisma.company.create({ data: c }));
  }

  console.log('Seeding salaries...');
  const roles = ['Software Engineer', 'Data Scientist', 'Product Manager', 'Designer', 'Data Engineer'];
  const locations = ['San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Austin, TX', 'Remote', 'London, UK'];
  const levels = [Level.ENTRY, Level.MID, Level.SENIOR, Level.STAFF, Level.PRINCIPAL];
  const currencies = [Currency.USD, Currency.GBP, Currency.EUR];
  const sources = [Source.VERIFIED, Source.UNVERIFIED, Source.EXTERNAL];

  for (let i = 0; i < 70; i++) {
    const company = createdCompanies[i % createdCompanies.length];
    const role = roles[i % roles.length];
    const location = locations[i % locations.length];
    const levelIndex = i % levels.length;
    const level = levels[levelIndex];
    const currency = location === 'London, UK' ? Currency.GBP : Currency.USD;
    
    // Simulate compensation
    const base_salary = 100000 + (levelIndex * 30000) + Math.floor(Math.random() * 20000);
    const stock = levelIndex > 0 ? 20000 + (levelIndex * 40000) + Math.floor(Math.random() * 20000) : 0;
    const bonus = 10000 + (levelIndex * 10000) + Math.floor(Math.random() * 10000);
    
    await prisma.salary.create({
      data: {
        role,
        level,
        location,
        currency,
        experience_years: levelIndex * 2 + Math.floor(Math.random() * 3),
        base_salary,
        stock,
        bonus,
        total_compensation: base_salary + stock + bonus,
        source: sources[i % sources.length],
        confidence_score: Math.random() * 100,
        is_verified: Math.random() > 0.5,
        company_id: company.id,
      }
    });
  }

  // Add edge cases
  await prisma.salary.create({
    data: {
      role: 'CEO',
      level: Level.PRINCIPAL,
      location: 'Remote',
      currency: Currency.USD,
      experience_years: 25,
      base_salary: 1, // $1 CEO salary edge case
      stock: 50000000,
      bonus: 0,
      total_compensation: 50000001,
      source: Source.VERIFIED,
      confidence_score: 99.9,
      is_verified: true,
      company_id: createdCompanies[1].id,
    }
  });

  console.log('Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
