'use client';

import { useRouter } from 'next/navigation';
import { updatePatientAction } from '@/lib/actions';
import {
  PatientForm,
  type GovernorateGroup,
  type NationalityOption,
  type PatientFormValues
} from '@/components/PatientForm';

/**
 * Client wrapper for the standalone /patients/[id]/edit route. Editing normally
 * happens in a modal on the list, but this full-page form remains as a
 * bookmarkable fallback. On success it returns to the registry.
 */
export function EditPatientPageForm({
  governorates,
  nationalities,
  areaToGovernorate,
  initial
}: {
  governorates: GovernorateGroup[];
  nationalities: NationalityOption[];
  areaToGovernorate: Record<string, string>;
  initial: PatientFormValues;
}) {
  const router = useRouter();
  return (
    <PatientForm
      mode="edit"
      variant="page"
      action={updatePatientAction}
      governorates={governorates}
      nationalities={nationalities}
      areaToGovernorate={areaToGovernorate}
      initial={initial}
      onSuccess={() => {
        router.push('/patients');
        router.refresh();
      }}
    />
  );
}
