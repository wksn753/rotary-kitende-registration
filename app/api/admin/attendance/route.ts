import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { AttendanceResponse } from '../../../lib/definitions';
import { ADMIN_COOKIE_NAME, isValidAdminSession } from '../../../lib/admin-auth';

export const runtime = 'nodejs';

const FALLBACK_ATTENDANCE_URL =
  'http://n1065v34z9435876yrwcc9mx.213.136.66.81.sslip.io/api/attendance';

function jsonResponse(payload: AttendanceResponse, status: number) {
  return NextResponse.json(payload, { status });
}

function getBackendAttendanceURL() {
  const registerUrl = process.env.REGISTRATION_API_URL?.trim();

  return (
    process.env.REGISTRATION_ATTENDANCE_API_URL?.trim() ||
    (registerUrl?.endsWith('/register') ? registerUrl.replace(/\/register$/, '/attendance') : '') ||
    FALLBACK_ATTENDANCE_URL
  );
}

export async function GET(request: Request) {
  const session = cookies().get(ADMIN_COOKIE_NAME)?.value;

  if (!isValidAdminSession(session)) {
    return jsonResponse({ success: false, code: 'UNAUTHORIZED', message: 'Admin login required.' }, 401);
  }

  const url = new URL(request.url);
  const date = url.searchParams.get('date')?.trim() || '';
  const backendUrl = getBackendAttendanceURL();
  const target = date ? `${backendUrl}?date=${encodeURIComponent(date)}` : backendUrl;
  const adminAPIKey = process.env.ADMIN_API_KEY?.trim();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const backendResponse = await fetch(target, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...(adminAPIKey ? { 'X-Admin-API-Key': adminAPIKey } : {}),
      },
      signal: controller.signal,
      cache: 'no-store',
    });

    clearTimeout(timeout);

    let data: AttendanceResponse | null = null;
    try {
      data = (await backendResponse.json()) as AttendanceResponse;
    } catch {
      data = null;
    }

    if (!backendResponse.ok || !data?.success) {
      return jsonResponse(
        {
          success: false,
          code: data?.code || 'UNAVAILABLE',
          message: data?.message || 'Attendance is temporarily unavailable.',
        },
        backendResponse.status === 401 || backendResponse.status === 403 ? backendResponse.status : 502,
      );
    }

    return jsonResponse(data, 200);
  } catch {
    clearTimeout(timeout);
    return jsonResponse({ success: false, code: 'UNAVAILABLE', message: 'Attendance is temporarily unavailable.' }, 503);
  }
}
