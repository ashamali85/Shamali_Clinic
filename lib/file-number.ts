import type { Prisma } from '@prisma/client';

/**
 * Generate the next patient file number, e.g. "MGH-2026-0001".
 *
 * Runs inside the caller's transaction so two concurrent "Add patient" submits
 * can never be handed the same number: we upsert-and-increment a Counter row
 * keyed by year, and the database serialises the writes.
 */
export async function nextFileNumber(tx: Prisma.TransactionClient): Promise<string> {
  const year = new Date().getFullYear();
  const key = `patient-file:${year}`;

  const counter = await tx.counter.upsert({
    where: { key },
    create: { key, value: 1 },
    update: { value: { increment: 1 } }
  });

  const seq = String(counter.value).padStart(4, '0');
  return `MGH-${year}-${seq}`;
}
