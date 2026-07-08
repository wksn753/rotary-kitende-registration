import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_COOKIE_NAME,
  createAdminSessionValue,
  getAdminSessionMaxAgeSeconds,
  isCorrectAdminPassword,
  isValidAdminSession,
} from '../../../lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

type LoginPayload = {
  password?: string;
};

function noStore(response: NextResponse) {
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  return response;
}

function shouldUseSecureCookie(request: NextRequest) {
  const forwardedProto = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim().toLowerCase();

  if (forwardedProto) return forwardedProto === 'https';

  try {
    return new URL(request.url).protocol === 'https:';
  } catch {
    return process.env.NODE_ENV === 'production';
  }
}

export async function GET(request: NextRequest) {
  const session = request.cookies.get(ADMIN_COOKIE_NAME)?.value;

  return noStore(NextResponse.json({ authenticated: isValidAdminSession(session) }, { status: 200 }));
}

export async function POST(request: NextRequest) {
  let payload: LoginPayload | null = null;

  try {
    payload = (await request.json()) as LoginPayload;
  } catch {
    payload = null;
  }

  if (!payload?.password || !isCorrectAdminPassword(payload.password)) {
    return noStore(NextResponse.json({ success: false, message: 'Invalid admin password.' }, { status: 401 }));
  }

  const response = noStore(NextResponse.json({ success: true, message: 'Admin session started.' }, { status: 200 }));

  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: createAdminSessionValue(),
    httpOnly: true,
    sameSite: 'lax',
    secure: shouldUseSecureCookie(request),
    path: '/',
    maxAge: getAdminSessionMaxAgeSeconds(),
  });

  return response;
}
