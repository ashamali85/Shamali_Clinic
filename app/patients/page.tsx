import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { TopBar } from '@/components/TopBar';
import { PatientTable, type PatientRow } from '@/components/PatientTable';

export const dynamic = 'force-dynamic';

export default async function PatientsPage() {
  const user = await requireUser();

  const patients = await prisma.patient.findMany({
    orderBy: { fileNumber: 'asc' },
    include: { nationality: true, area: { include: { governorate: true } } }
  });

  const rows: PatientRow[] = patients.map((p) => ({
    id: p.id,
    fileNumber: p.fileNumber,
    firstName: p.firstName,
    middleName: p.middleName,
    lastName: p.lastName,
    gender: p.gender,
    civilId: p.civilId,
    mobile1: p.mobile1,
    nationality: p.nationality.name,
    area: p.area.name,
    governorate: p.area.governorate.name,
    email: p.email
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

        <PatientTable patients={rows} />
      </main>
    </>
  );
}
