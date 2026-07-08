import { NextResponse } from 'next/server';
import type { AttendanceResponse } from '../../../lib/definitions';

export const runtime = 'nodejs';

const FALLBACK_ATTENDANCE_URL =
  'http://n1065v34z9435876yrwcc9mx.213.136.66.81.sslip.io/api/attendance';

function jsonResponse(payload: AttendanceResponse, status: number) {
  return NextResponse.json(payload, { status });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const date = url.searchParams.get('date')?.trim() || '';
  const registerUrl = process.env.REGISTRATION_API_URL?.trim();
  const backendUrl =
    process.env.REGISTRATION_ATTENDANCE_API_URL?.trim() ||
    (registerUrl?.endsWith('/register') ? registerUrl.replace(/\/register$/, '/attendance') : '') ||
    FALLBACK_ATTENDANCE_URL;
  const target = date ? `${backendUrl}?date=${encodeURIComponent(date)}` : backendUrl;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const backendResponse = await fetch(target, {
      method: 'GET',
      headers: { Accept: 'application/json' },
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
        502,
      );
    }

    return jsonResponse(data, 200);
  } catch {
    clearTimeout(timeout);
    return jsonResponse({ success: false, code: 'UNAVAILABLE', message: 'Attendance is temporarily unavailable.' }, 503);
  }
}
