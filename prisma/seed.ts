import { PrismaClient, Seniority } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing existing data...');
  await prisma.salary.deleteMany();
  await prisma.company.deleteMany();

  console.log('Seeding companies...');
  const companies = [
    { name: 'Google', slug: 'google', industry: 'Technology', website: 'https://google.com' },
    { name: 'Meta', slug: 'meta', industry: 'Technology', website: 'https://meta.com' },
    { name: 'Apple', slug: 'apple', industry: 'Technology', website: 'https://apple.com' },
    { name: 'Amazon', slug: 'amazon', industry: 'Technology', website: 'https://amazon.com' },
    { name: 'Netflix', slug: 'netflix', industry: 'Technology', website: 'https://netflix.com' }
  ];

  const createdCompanies = [];
  for (const c of companies) {
    createdCompanies.push(await prisma.company.create({ data: c }));
  }

  console.log('Seeding salaries (60+ records)...');
  const roles = ['Software Engineer', 'Data Scientist', 'Product Manager', 'Designer', 'Data Engineer'];
  const locations = ['San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Austin, TX', 'Remote'];
  const seniorities = [Seniority.ENTRY, Seniority.MID, Seniority.SENIOR, Seniority.STAFF, Seniority.PRINCIPAL];

  for (let i = 0; i < 70; i++) {
    const company = createdCompanies[i % createdCompanies.length];
    const role = roles[i % roles.length];
    const location = locations[i % locations.length];
    
    // Simulate realistic compensation bands based on seniority
    const seniorityIndex = i % seniorities.length;
    const seniority = seniorities[seniorityIndex];
    
    const baseSalary = 100000 + (seniorityIndex * 30000) + Math.floor(Math.random() * 20000);
    const equity = seniorityIndex > 0 ? 20000 + (seniorityIndex * 40000) + Math.floor(Math.random() * 20000) : 0;
    const bonus = 10000 + (seniorityIndex * 10000) + Math.floor(Math.random() * 10000);
    
    await prisma.salary.create({
      data: {
        title: role,
        level: `L${seniorityIndex + 3}`,
        seniority: seniority,
        location: location,
        baseSalary,
        equity,
        bonus,
        totalCompensation: baseSalary + equity + bonus,
        yoe: seniorityIndex * 2 + Math.floor(Math.random() * 3),
        companyId: company.id,
      }
    });
  }

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
