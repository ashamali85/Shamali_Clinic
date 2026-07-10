'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import {
  authenticate,
  clearSession,
  createSession,
  requireUser
} from '@/lib/auth';
import { prisma } from '@/lib/db';
import { nextFileNumber } from '@/lib/file-number';
import { getString, getOptionalString } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Audit helper
// ---------------------------------------------------------------------------

async function logAction(
  actorUserId: string,
  action: string,
  entityType: string,
  entityId: string,
  entityName?: string,
  details?: string
) {
  await prisma.auditLog.create({
    data: { actorUserId, action, entityType, entityId, entityName, details }
  });
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export async function loginAction(_prev: unknown, formData: FormData) {
  const username = getString(formData, 'username').toLowerCase();
  const password = getString(formData, 'password');
  if (!username || !password) return { error: 'Enter your username and password.' };

  const user = await authenticate(username, password);
  if (!user) return { error: 'Those credentials did not match. Try again.' };

  await createSession({ id: user.id });
  redirect('/patients');
}

export async function logoutAction() {
  await clearSession();
  redirect('/login');
}

// ---------------------------------------------------------------------------
// Patient validation
// ---------------------------------------------------------------------------

const patientSchema = z.object({
  firstName: z.string().min(1, 'First name is required.'),
  middleName: z.string().optional().nullable(),
  lastName: z.string().min(1, 'Last name is required.'),
  gender: z.enum(['MALE', 'FEMALE'], { message: 'Select a gender.' }),
  dateOfBirth: z
    .string()
    .min(1, 'Date of birth is required.')
    .refine((v) => !Number.isNaN(Date.parse(v)), 'Enter a valid date of birth.'),
  nationalityId: z.string().min(1, 'Select a nationality.'),
  mobile1: z.string().min(1, 'Primary mobile is required.'),
  mobile2: z.string().optional().nullable(),
  email: z
    .string()
    .optional()
    .nullable()
    .refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Enter a valid email.'),
  addressLine1: z.string().optional().nullable(),
  addressLine2: z.string().optional().nullable(),
  areaId: z.string().min(1, 'Select an area.'),
  civilId: z
    .string()
    .min(1, 'Civil ID is required.')
    .refine((v) => /^\d{12}$/.test(v), 'Civil ID must be exactly 12 digits.'),
  paciNumber: z.string().optional().nullable()
});

function readPatientForm(formData: FormData) {
  return {
    firstName: getString(formData, 'firstName'),
    middleName: getOptionalString(formData, 'middleName'),
    lastName: getString(formData, 'lastName'),
    gender: getString(formData, 'gender'),
    dateOfBirth: getString(formData, 'dateOfBirth'),
    nationalityId: getString(formData, 'nationalityId'),
    mobile1: getString(formData, 'mobile1'),
    mobile2: getOptionalString(formData, 'mobile2'),
    email: getOptionalString(formData, 'email'),
    addressLine1: getOptionalString(formData, 'addressLine1'),
    addressLine2: getOptionalString(formData, 'addressLine2'),
    areaId: getString(formData, 'areaId'),
    civilId: getString(formData, 'civilId'),
    paciNumber: getOptionalString(formData, 'paciNumber')
  };
}

// ---------------------------------------------------------------------------
// Create patient
// ---------------------------------------------------------------------------

export async function createPatientAction(_prev: unknown, formData: FormData) {
  const user = await requireUser();
  const parsed = patientSchema.safeParse(readPatientForm(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Check the form and try again.' };
  }
  const data = parsed.data;

  // Guard the Civil ID uniqueness with a friendly message before hitting the
  // database constraint.
  const existing = await prisma.patient.findUnique({ where: { civilId: data.civilId } });
  if (existing) {
    return { error: `A patient with Civil ID ${data.civilId} already exists (${existing.fileNumber}).` };
  }

  let fileNumber: string;
  try {
    fileNumber = await prisma.$transaction(async (tx) => {
      const fn = await nextFileNumber(tx);
      await tx.patient.create({
        data: {
          fileNumber: fn,
          firstName: data.firstName,
          middleName: data.middleName,
          lastName: data.lastName,
          gender: data.gender,
          dateOfBirth: new Date(data.dateOfBirth),
          nationalityId: data.nationalityId,
          mobile1: data.mobile1,
          mobile2: data.mobile2,
          email: data.email,
          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2,
          areaId: data.areaId,
          civilId: data.civilId,
          paciNumber: data.paciNumber,
          createdById: user.id
        }
      });
      return fn;
    });
  } catch {
    return { error: 'Could not save the patient. Please try again.' };
  }

  await logAction(
    user.id,
    'CREATE',
    'Patient',
    fileNumber,
    `${data.firstName} ${data.lastName}`,
    `File ${fileNumber}`
  );

  revalidatePath('/patients');
  // Return success so the caller (modal) can close and refresh in place. Pages
  // that want a redirect can act on `ok` themselves.
  return { ok: true as const, fileNumber };
}

// ---------------------------------------------------------------------------
// Update patient
// ---------------------------------------------------------------------------

export async function updatePatientAction(_prev: unknown, formData: FormData) {
  const user = await requireUser();
  const id = getString(formData, 'id');
  if (!id) return { error: 'Missing patient reference.' };

  const parsed = patientSchema.safeParse(readPatientForm(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Check the form and try again.' };
  }
  const data = parsed.data;

  const current = await prisma.patient.findUnique({ where: { id } });
  if (!current) return { error: 'That patient no longer exists.' };

  // If the Civil ID changed, make sure it doesn't collide with another record.
  if (data.civilId !== current.civilId) {
    const clash = await prisma.patient.findUnique({ where: { civilId: data.civilId } });
    if (clash && clash.id !== id) {
      return { error: `Civil ID ${data.civilId} is already used by ${clash.fileNumber}.` };
    }
  }

  try {
    await prisma.patient.update({
      where: { id },
      data: {
        firstName: data.firstName,
        middleName: data.middleName,
        lastName: data.lastName,
        gender: data.gender,
        dateOfBirth: new Date(data.dateOfBirth),
        nationalityId: data.nationalityId,
        mobile1: data.mobile1,
        mobile2: data.mobile2,
        email: data.email,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2,
        areaId: data.areaId,
        civilId: data.civilId,
        paciNumber: data.paciNumber
        // fileNumber is intentionally never updated.
      }
    });
  } catch {
    return { error: 'Could not update the patient. Please try again.' };
  }

  await logAction(
    user.id,
    'UPDATE',
    'Patient',
    current.fileNumber,
    `${data.firstName} ${data.lastName}`
  );

  revalidatePath('/patients');
  revalidatePath(`/patients/${id}`);
  return { ok: true as const };
}

// ---------------------------------------------------------------------------
// Delete patient
// ---------------------------------------------------------------------------

export async function deletePatientAction(formData: FormData) {
  const user = await requireUser();
  const id = getString(formData, 'id');
  if (!id) return;

  const patient = await prisma.patient.findUnique({ where: { id } });
  if (!patient) {
    revalidatePath('/patients');
    return;
  }

  await prisma.patient.delete({ where: { id } });
  await logAction(
    user.id,
    'DELETE',
    'Patient',
    patient.fileNumber,
    `${patient.firstName} ${patient.lastName}`
  );

  revalidatePath('/patients');
  redirect('/patients');
}
