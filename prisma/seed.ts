import { PrismaClient, Level, Currency, Source, ReviewRating, InterviewResult } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing data...');
  // Delete in reverse order of dependencies
  await prisma.interview.deleteMany();
  await prisma.review.deleteMany();
  await prisma.salarySubmission.deleteMany();
  await prisma.role.deleteMany();
  await prisma.company.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding...');
  
  // 1. Users
  const user1 = await prisma.user.create({
    data: { email: 'user1@example.com' }
  });

  // 2. Roles
  const sweRole = await prisma.role.create({
    data: { name: 'Software Engineer', slug: 'software-engineer', category: 'Engineering' }
  });
  const pmRole = await prisma.role.create({
    data: { name: 'Product Manager', slug: 'product-manager', category: 'Product' }
  });

  // 3. Companies
  const google = await prisma.company.create({
    data: { name: 'Google', slug: 'google', normalized_name: 'google', industry: 'Technology', headquarters: 'Mountain View, CA' }
  });
  const meta = await prisma.company.create({
    data: { name: 'Meta', slug: 'meta', normalized_name: 'meta', industry: 'Technology', headquarters: 'Menlo Park, CA' }
  });

  // 4. Salaries
  const locations = ['San Francisco, CA', 'New York, NY', 'Remote'];
  const levels = [Level.ENTRY, Level.MID, Level.SENIOR, Level.STAFF, Level.PRINCIPAL];

  const companies = [google, meta];
  const roles = [sweRole, pmRole];

  for (let i = 0; i < 70; i++) {
    const company = companies[i % companies.length];
    const role = roles[i % roles.length];
    const levelIndex = i % levels.length;
    const level = levels[levelIndex];
    
    const base_salary = 100000 + (levelIndex * 40000) + Math.floor(Math.random() * 20000);
    const stock = levelIndex > 0 ? 30000 + (levelIndex * 50000) + Math.floor(Math.random() * 20000) : 0;
    const bonus = 10000 + (levelIndex * 15000) + Math.floor(Math.random() * 10000);
    const signing_bonus = Math.random() > 0.5 ? 20000 : 0;

    await prisma.salarySubmission.create({
      data: {
        company_id: company.id,
        role_id: role.id,
        user_id: Math.random() > 0.5 ? user1.id : null,
        level,
        location: locations[i % locations.length],
        currency: Currency.USD,
        experience_years: levelIndex * 2 + Math.floor(Math.random() * 3),
        company_tenure: Math.floor(Math.random() * 5),
        base_salary,
        bonus,
        stock,
        signing_bonus,
        total_compensation: base_salary + bonus + stock + signing_bonus,
        source: Source.VERIFIED,
        is_verified: true,
      }
    });
  }

  // Edge case: Massive outlier
  await prisma.salarySubmission.create({
    data: {
      company_id: meta.id,
      role_id: sweRole.id,
      level: Level.EXECUTIVE,
      location: 'Menlo Park, CA',
      currency: Currency.USD,
      experience_years: 20,
      base_salary: 1,
      bonus: 0,
      stock: 50000000,
      signing_bonus: 0,
      total_compensation: 50000001,
      source: Source.VERIFIED,
      is_verified: true,
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
