import { prisma } from './src/lib/prisma';
async function test() {
  try {
    await prisma.$connect();
    console.log('Database connected successfully!');
    process.exit(0);
  } catch (e) {
    console.error('Connection failed:', e);
    process.exit(1);
  }
}
test();
