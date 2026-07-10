import { prisma } from '@/lib/db';
import type { GovernorateGroup, NationalityOption } from '@/components/PatientForm';

/**
 * Load the form lookups in the exact shape the PatientForm expects: areas
 * grouped by their governorate, a flat area->governorate map (so the form can
 * fill the governorate field the instant an area is chosen), and the
 * nationality options.
 */
export async function loadPatientLookups(): Promise<{
  governorates: GovernorateGroup[];
  nationalities: NationalityOption[];
  areaToGovernorate: Record<string, string>;
}> {
  const [govs, nationalities] = await Promise.all([
    prisma.governorate.findMany({
      orderBy: { displayOrder: 'asc' },
      include: { areas: { orderBy: { name: 'asc' } } }
    }),
    prisma.nationality.findMany({ orderBy: { displayOrder: 'asc' } })
  ]);

  const governorates: GovernorateGroup[] = govs.map((g) => ({
    governorate: g.name,
    areas: g.areas.map((a) => ({ id: a.id, name: a.name, governorate: g.name }))
  }));

  const areaToGovernorate: Record<string, string> = {};
  for (const g of govs) {
    for (const a of g.areas) areaToGovernorate[a.id] = g.name;
  }

  return {
    governorates,
    nationalities: nationalities.map((n) => ({ id: n.id, name: n.name })),
    areaToGovernorate
  };
}
