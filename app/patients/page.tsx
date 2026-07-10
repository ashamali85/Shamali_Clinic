import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { loadPatientLookups } from '@/lib/lookups';
import { TopBar } from '@/components/TopBar';
import { PatientTable, type PatientRow } from '@/components/PatientTable';

export const dynamic = 'force-dynamic';

/** Format a Date as yyyy-mm-dd for the edit form's date input. */
function toDateInput(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default async function PatientsPage() {
  const user = await requireUser();

  const [patients, lookups] = await Promise.all([
    prisma.patient.findMany({
      orderBy: { fileNumber: 'asc' },
      include: { nationality: true, area: { include: { governorate: true } } }
    }),
    loadPatientLookups()
  ]);

  const rows: PatientRow[] = patients.map((p) => ({
    id: p.id,
    fileNumber: p.fileNumber,
    firstName: p.firstName,
    middleName: p.middleName,
    lastName: p.lastName,
    gender: p.gender,
    civilId: p.civilId,
    mobile1: p.mobile1,
    mobile2: p.mobile2,
    email: p.email,
    dateOfBirth: toDateInput(p.dateOfBirth),
    nationality: p.nationality.name,
    nationalityId: p.nationalityId,
    area: p.area.name,
    areaId: p.areaId,
    governorate: p.area.governorate.name,
    addressLine1: p.addressLine1,
    addressLine2: p.addressLine2,
    paciNumber: p.paciNumber
  }));

  const maleCount = rows.filter((r) => r.gender === 'MALE').length;
  const femaleCount = rows.filter((r) => r.gender === 'FEMALE').length;
  const govCount = new Set(rows.map((r) => r.governorate)).size;

  return (
    <>
      <TopBar user={user} />
      <main className="container page">
        <div className="stat-grid">
          <div className="stat">
            <div className="stat-num">{rows.length}</div>
            <div className="stat-label">Total patients</div>
          </div>
          <div className="stat">
            <div className="stat-num">{maleCount}</div>
            <div className="stat-label">Male</div>
          </div>
          <div className="stat">
            <div className="stat-num pink">{femaleCount}</div>
            <div className="stat-label">Female</div>
          </div>
          <div className="stat">
            <div className="stat-num">{govCount}</div>
            <div className="stat-label">Governorates</div>
          </div>
        </div>

        <div className="section-title">
          <h1>Patients</h1>
          <Link href="/patients/new" className="btn btn-primary">＋ Add new patient</Link>
        </div>

        <PatientTable
          patients={rows}
          governorates={lookups.governorates}
          nationalities={lookups.nationalities}
          areaToGovernorate={lookups.areaToGovernorate}
        />
      </main>
    </>
  );
}
