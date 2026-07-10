'use client';

import { useRouter } from 'next/navigation';
import { createPatientAction } from '@/lib/actions';
import {
  PatientForm,
  type GovernorateGroup,
  type NationalityOption
} from '@/components/PatientForm';

/** Client wrapper for the /patients/new page: returns to the list on success. */
export function NewPatientPageForm({
  governorates,
  nationalities,
  areaToGovernorate
}: {
  governorates: GovernorateGroup[];
  nationalities: NationalityOption[];
  areaToGovernorate: Record<string, string>;
}) {
  const router = useRouter();
  return (
    <PatientForm
      mode="create"
      variant="page"
      action={createPatientAction}
      governorates={governorates}
      nationalities={nationalities}
      areaToGovernorate={areaToGovernorate}
      onSuccess={() => {
        router.push('/patients');
        router.refresh();
      }}
    />
  );
}
