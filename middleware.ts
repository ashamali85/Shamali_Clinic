import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const protectedPrefixes = ['/patients'];

/**
 * Cheap edge check to bounce anonymous traffic away from the registry.
 * Authoritative checks (is the user still active?) happen in the server
 * actions and pages via getSessionUser(); this only verifies the cookie is a
 * validly-signed token.
 */
function getSecret(): Uint8Array {
  const raw = process.env.JWT_SECRET;
  if (!raw || raw.trim().length < 32) {
    throw new Error('JWT_SECRET is missing or too short (min 32 characters).');
  }
  return new TextEncoder().encode(raw);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const needsAuth = protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + '/')
  );
  if (!needsAuth) return NextResponse.next();

  const token = request.cookies.get('shamali_clinic_session')?.value;
  if (!token) return NextResponse.redirect(new URL('/login', request.url));

  try {
    await jwtVerify(token, getSecret());
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/patients/:path*']
};
