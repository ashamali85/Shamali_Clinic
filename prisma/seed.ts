import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { KUWAIT_GOVERNORATES, NATIONALITIES, NATIONALITY_ISO } from '../lib/kuwait-data';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Dr. Shamali Gastroenterology Clinic database…');

  // --- Governorates + areas -------------------------------------------------
  let areaCount = 0;
  for (let gi = 0; gi < KUWAIT_GOVERNORATES.length; gi++) {
    const g = KUWAIT_GOVERNORATES[gi];
    const gov = await prisma.governorate.upsert({
      where: { name: g.name },
      create: { name: g.name, nameAr: g.nameAr, displayOrder: gi },
      update: { nameAr: g.nameAr, displayOrder: gi }
    });
    for (const areaName of g.areas) {
      await prisma.area.upsert({
        where: { name: areaName },
        create: { name: areaName, governorateId: gov.id },
        update: { governorateId: gov.id }
      });
      areaCount++;
    }
  }
  console.log(`  Governorates: ${KUWAIT_GOVERNORATES.length}, Areas: ${areaCount}`);

  // --- Nationalities --------------------------------------------------------
  for (let i = 0; i < NATIONALITIES.length; i++) {
    const name = NATIONALITIES[i];
    const isoCode = NATIONALITY_ISO[name] ?? null;
    await prisma.nationality.upsert({
      where: { name },
      create: { name, isoCode, displayOrder: i },
      update: { isoCode, displayOrder: i }
    });
  }
  console.log(`  Nationalities: ${NATIONALITIES.length}`);

  // --- Demo doctor account --------------------------------------------------
  const passwordHash = await bcrypt.hash('clinic123', 10);
  await prisma.user.upsert({
    where: { username: 'doctor' },
    create: {
      name: 'Dr. Shamali',
      username: 'doctor',
      email: 'doctor@shamali-clinic.com',
      passwordHash,
      role: 'DOCTOR'
    },
    update: { passwordHash }
  });
  console.log('  Doctor login: doctor / clinic123');

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
