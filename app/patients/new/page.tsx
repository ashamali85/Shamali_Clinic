import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { loadPatientLookups } from '@/lib/lookups';
import { TopBar } from '@/components/TopBar';
import { NewPatientPageForm } from '@/components/NewPatientPageForm';

export const dynamic = 'force-dynamic';

export default async function NewPatientPage() {
  const user = await requireUser();
  const { governorates, nationalities, areaToGovernorate } = await loadPatientLookups();

  return (
    <>
      <TopBar user={user} />
      <main className="container page" style={{ maxWidth: 860 }}>
        <div className="crumb">
          <Link href="/patients">Patients</Link> &nbsp;›&nbsp; New patient
        </div>
        <h1 style={{ marginBottom: 18 }}>Add new patient</h1>
        <NewPatientPageForm
          governorates={governorates}
          nationalities={nationalities}
          areaToGovernorate={areaToGovernorate}
        />
      </main>
    </>
  );
}
