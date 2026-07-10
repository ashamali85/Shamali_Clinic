/**
 * Centralised, fail-fast access to the JWT signing secret. A checked-in default
 * would let anyone who reads the source forge a session, so we require the value
 * to be provided explicitly and to be long enough to be meaningfully random.
 */
let cachedSecret: Uint8Array | null = null;

export function getJwtSecret(): Uint8Array {
  if (cachedSecret) return cachedSecret;
  const raw = process.env.JWT_SECRET;
  if (!raw || raw.trim().length < 32) {
    throw new Error(
      'JWT_SECRET is missing or too short. Set JWT_SECRET to a random value of at least 32 characters.'
    );
  }
  cachedSecret = new TextEncoder().encode(raw);
  return cachedSecret;
}
