/**
 * Bulk-generate random patients for load/UX testing.
 *
 *   npm run db:seed:patients            -> creates 10,000 patients
 *   npm run db:seed:patients 500        -> creates 500
 *   COUNT=25000 npm run db:seed:patients
 *
 * Every record is complete and valid:
 *   - realistic names chosen by gender
 *   - a real Area (and therefore a real Governorate link) from the lookup tables
 *   - a real Nationality from the lookup table
 *   - a unique, format-correct 12-digit Kuwait Civil ID (century + YYMMDD + serial)
 *   - a Kuwait mobile number (+965 5/6/9 prefix)
 *   - file numbers assigned through the same atomic Counter the app uses
 *
 * Requires the base seed to have run first (npm run db:seed) so the lookup
 * tables and the demo doctor exist.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// --- How many to create ------------------------------------------------------
const COUNT = Number(process.argv[2] ?? process.env.COUNT ?? 10000);
const BATCH_SIZE = 500;

// --- Name pools --------------------------------------------------------------
const MALE_FIRST = [
  'Abdullah', 'Ahmad', 'Mohammed', 'Ali', 'Yousef', 'Khaled', 'Fahad', 'Saad',
  'Bader', 'Nasser', 'Faisal', 'Salem', 'Hamad', 'Jassim', 'Turki', 'Mishari',
  'Rashed', 'Waleed', 'Talal', 'Mansour', 'Sultan', 'Majed', 'Omar', 'Hassan',
  'Hussain', 'Ibrahim', 'Ismail', 'Tariq', 'Adel', 'Sami', 'Raj', 'Anil',
  'Suresh', 'Imran', 'Bilal', 'Zaid', 'Karim', 'Hadi', 'Marwan', 'Ziad'
];
const FEMALE_FIRST = [
  'Fatima', 'Aisha', 'Maryam', 'Noura', 'Sara', 'Hessa', 'Latifa', 'Dana',
  'Shaikha', 'Munira', 'Bushra', 'Amal', 'Reem', 'Ghada', 'Huda', 'Layla',
  'Nada', 'Salma', 'Zainab', 'Rana', 'Dalal', 'Wadha', 'Asma', 'Hanan',
  'Iman', 'Jumana', 'Kholoud', 'Lulwa', 'Maha', 'Noor', 'Priya', 'Anjali',
  'Farah', 'Yasmin', 'Rania', 'Sondos', 'Wafa', 'Ghaliya', 'Bibi', 'Munirah'
];
const MIDDLE = [
  'A', 'M', 'S', 'H', 'K', 'Abdullah', 'Ahmad', 'Mohammed', 'Ali', 'Nasser',
  'Salem', 'Khaled', 'Fahad', 'Hamad', 'Jassim', '' // some have no middle name
];
const LAST = [
  'Al Shamali', 'Al Sabah', 'Al Ali', 'Al Ahmad', 'Al Mutairi', 'Al Ajmi',
  'Al Rashidi', 'Al Enezi', 'Al Azmi', 'Al Dosari', 'Al Hajri', 'Al Shammari',
  'Al Otaibi', 'Al Qahtani', 'Al Harbi', 'Al Fadhli', 'Al Kandari', 'Al Failakawi',
  'Al Sayegh', 'Al Roumi', 'Al Awadhi', 'Al Bahar', 'Al Ghanim', 'Al Sager',
  'Khan', 'Kumar', 'Sharma', 'Nair', 'Patel', 'Rahman', 'Hussain', 'Iqbal',
  'Das', 'Reddy', 'Menon', 'Fernandez', 'Silva', 'Santos'
];

// --- Helpers -----------------------------------------------------------------
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const pad = (n: number, width: number) => String(n).padStart(width, '0');

/** Random date of birth between 1940 and 2015. */
function randomDob(): Date {
  const year = randInt(1940, 2015);
  const month = randInt(0, 11);
  const day = randInt(1, 28); // 28 keeps every month valid
  return new Date(Date.UTC(year, month, day));
}

/**
 * Build a 12-digit Kuwait Civil ID from a date of birth plus a serial, in the
 * real format: [century digit][YY][MM][DD][4-digit serial][check digit].
 *   century digit: 2 for 1900s, 3 for 2000s
 * The check digit here is a plausible filler, not the official algorithm —
 * these are synthetic IDs for test data only.
 */
function makeCivilId(dob: Date, serial: number): string {
  const y = dob.getUTCFullYear();
  const centuryDigit = y < 2000 ? 2 : 3;
  const yy = pad(y % 100, 2);
  const mm = pad(dob.getUTCMonth() + 1, 2);
  const dd = pad(dob.getUTCDate(), 2);
  const ser = pad(serial % 10000, 4);
  const check = randInt(0, 9);
  return `${centuryDigit}${yy}${mm}${dd}${ser}${check}`;
}

/** Kuwait mobile: +965 followed by 5/6/9 and 7 more digits. */
function kuwaitMobile(): string {
  const prefix = pick(['5', '6', '9']);
  let rest = '';
  for (let i = 0; i < 7; i++) rest += randInt(0, 9);
  return `+965${prefix}${rest}`;
}

function makeEmail(first: string, last: string, i: number): string {
  const domains = ['gmail.com', 'hotmail.com', 'live.com', 'yahoo.com', 'outlook.com'];
  const handle = `${first}.${last}`.toLowerCase().replace(/[^a-z]/g, '');
  return `${handle}${i}@${pick(domains)}`;
}

async function main() {
  console.log(`Generating ${COUNT.toLocaleString()} random patients…`);

  // Pull the real lookup IDs so foreign keys are valid.
  const [areas, nationalities, doctor] = await Promise.all([
    prisma.area.findMany({ select: { id: true } }),
    prisma.nationality.findMany({ select: { id: true } }),
    prisma.user.findUnique({ where: { username: 'doctor' }, select: { id: true } })
  ]);

  if (areas.length === 0 || nationalities.length === 0) {
    console.error(
      'Lookup tables are empty. Run `npm run db:seed` first to seed governorates, areas, and nationalities.'
    );
    process.exit(1);
  }

  const areaIds = areas.map((a) => a.id);
  const nationalityIds = nationalities.map((n) => n.id);
  const createdById = doctor?.id ?? null;

  // Reserve a contiguous block of file numbers atomically, so this bulk insert
  // doesn't race with app usage and every number stays unique.
  const year = new Date().getFullYear();
  const counterKey = `patient-file:${year}`;
  const counter = await prisma.counter.upsert({
    where: { key: counterKey },
    create: { key: counterKey, value: COUNT },
    update: { value: { increment: COUNT } }
  });
  // The block we own is (start, start+COUNT]; before increment it was:
  const startSeq = counter.value - COUNT;

  // Track Civil IDs generated this run to guarantee uniqueness within the batch.
  const usedCivilIds = new Set<string>();
  let created = 0;
  let civilSerial = randInt(1000, 8000);

  for (let batchStart = 0; batchStart < COUNT; batchStart += BATCH_SIZE) {
    const batch: any[] = [];
    const end = Math.min(batchStart + BATCH_SIZE, COUNT);

    for (let i = batchStart; i < end; i++) {
      const gender = Math.random() < 0.5 ? 'MALE' : 'FEMALE';
      const first = gender === 'MALE' ? pick(MALE_FIRST) : pick(FEMALE_FIRST);
      const middle = pick(MIDDLE);
      const last = pick(LAST);
      const dob = randomDob();

      // Unique Civil ID.
      let civilId = makeCivilId(dob, civilSerial++);
      while (usedCivilIds.has(civilId)) civilId = makeCivilId(dob, civilSerial++);
      usedCivilIds.add(civilId);

      const seq = startSeq + i + 1;
      const hasMobile2 = Math.random() < 0.35;
      const hasEmail = Math.random() < 0.7;
      const hasPaci = Math.random() < 0.6;
      const hasAddr2 = Math.random() < 0.5;

      batch.push({
        fileNumber: `MGH-${year}-${pad(seq, 4)}`,
        firstName: first,
        middleName: middle || null,
        lastName: last,
        gender,
        dateOfBirth: dob,
        nationalityId: pick(nationalityIds),
        mobile1: kuwaitMobile(),
        mobile2: hasMobile2 ? kuwaitMobile() : null,
        email: hasEmail ? makeEmail(first, last, i) : null,
        addressLine1: `Block ${randInt(1, 12)}, Street ${randInt(1, 40)}, Building ${randInt(1, 90)}`,
        addressLine2: hasAddr2 ? `Floor ${randInt(1, 20)}, Apt ${randInt(1, 60)}` : null,
        areaId: pick(areaIds),
        civilId,
        paciNumber: hasPaci ? String(randInt(10000000, 99999999)) : null,
        createdById
      });
    }

    await prisma.patient.createMany({ data: batch });
    created += batch.length;
    process.stdout.write(`\r  Inserted ${created.toLocaleString()} / ${COUNT.toLocaleString()}`);
  }

  process.stdout.write('\n');
  const total = await prisma.patient.count();
  console.log(`Done. ${created.toLocaleString()} patients created. Total in database: ${total.toLocaleString()}.`);
}

main()
  .catch((e) => {
    console.error('\nSeed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
