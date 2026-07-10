import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { updatePatientAction } from '@/lib/actions';
import { loadPatientLookups } from '@/lib/lookups';
import { TopBar } from '@/components/TopBar';
import { PatientForm, type PatientFormValues } from '@/components/PatientForm';
import { fullName } from '@/lib/utils';

export const dynamic = 'force-dynamic';

/** Format a Date as yyyy-mm-dd for a native date input. */
function toDateInput(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default async function EditPatientPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const patient = await prisma.patient.findUnique({ where: { id } });
  if (!patient) notFound();

  const { governorates, nationalities, areaToGovernorate } = await loadPatientLookups();

  const initial: PatientFormValues = {
    id: patient.id,
    fileNumber: patient.fileNumber,
    firstName: patient.firstName,
    middleName: patient.middleName ?? '',
    lastName: patient.lastName,
    gender: patient.gender,
    dateOfBirth: toDateInput(patient.dateOfBirth),
    nationalityId: patient.nationalityId,
    mobile1: patient.mobile1,
    mobile2: patient.mobile2 ?? '',
    email: patient.email ?? '',
    addressLine1: patient.addressLine1 ?? '',
    addressLine2: patient.addressLine2 ?? '',
    areaId: patient.areaId,
    civilId: patient.civilId,
    paciNumber: patient.paciNumber ?? ''
  };

  return (
    <>
      <TopBar user={user} />
      <main className="container page" style={{ maxWidth: 860 }}>
        <div className="crumb">
          <Link href="/patients">Patients</Link> &nbsp;›&nbsp;{' '}
          {fullName({ firstName: patient.firstName, middleName: patient.middleName, lastName: patient.lastName })}
        </div>
        <h1 style={{ marginBottom: 18 }}>Edit patient</h1>
        <PatientForm
          mode="edit"
          action={updatePatientAction}
          governorates={governorates}
          nationalities={nationalities}
          areaToGovernorate={areaToGovernorate}
          initial={initial}
        />
      </main>
    </>
  );
}
