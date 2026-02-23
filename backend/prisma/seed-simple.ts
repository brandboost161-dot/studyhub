import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log(' Seeding schools...');

  const schools = [
    { name: 'Drexel University', domain: 'drexel.edu' },
    { name: 'SUNY Cortland', domain: 'cortland.edu' },
    { name: 'SUNY Oswego', domain: 'oswego.edu' },
  ];

  for (const school of schools) {
    await prisma.school.upsert({
      where: { domain: school.domain },
      update: {},
      create: school,
    });
    console.log(` Created ${school.name}`);
  }

  console.log(' Seed completed!');
}

main()
  .catch((e) => {
    console.error(' Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });