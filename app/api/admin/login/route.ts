import { NextResponse } from 'next/server';
import {
  ADMIN_COOKIE_NAME,
  createAdminSessionValue,
  getAdminSessionMaxAgeSeconds,
  isCorrectAdminPassword,
  isValidAdminSession,
} from '../../../lib/admin-auth';

export const runtime = 'nodejs';

type LoginPayload = {
  password?: string;
};

function getCookieValue(cookieHeader: string | null, name: string) {
  return cookieHeader
    ?.split(';')
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${name}=`))
    ?.split('=')[1];
}

export async function GET(request: Request) {
  const session = getCookieValue(request.headers.get('cookie'), ADMIN_COOKIE_NAME);

  return NextResponse.json({ authenticated: isValidAdminSession(session) }, { status: 200 });
}

export async function POST(request: Request) {
  let payload: LoginPayload | null = null;

  try {
    payload = (await request.json()) as LoginPayload;
  } catch {
    payload = null;
  }

  if (!payload?.password || !isCorrectAdminPassword(payload.password)) {
    return NextResponse.json({ success: false, message: 'Invalid admin password.' }, { status: 401 });
  }

  const response = NextResponse.json({ success: true, message: 'Admin session started.' }, { status: 200 });

  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: createAdminSessionValue(),
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: getAdminSessionMaxAgeSeconds(),
  });

  return response;
}
