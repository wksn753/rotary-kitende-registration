import { NextResponse } from 'next/server';
import type { RegistrationResponse, Submission } from '../../lib/definitions';

export const runtime = 'nodejs';

type RegisterPayload = Partial<Submission> & {
  honeypot?: string;
};

const FALLBACK_BACKEND_URL =
  'http://n1065v34z9435876yrwcc9mx.213.136.66.81.sslip.io/api/register';

function cleanText(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function jsonResponse(payload: RegistrationResponse, status: number) {
  return NextResponse.json(payload, { status });
}

export async function POST(request: Request) {
  let body: RegisterPayload;

  try {
    body = (await request.json()) as RegisterPayload;
  } catch {
    return jsonResponse(
      {
        success: false,
        code: 'VALIDATION',
        message: 'Please check the form and try again.',
      },
      400,
    );
  }

  /**
   * Honeypot: bots may fill this hidden field.
   * We return success without forwarding it to the backend.
   */
  if (cleanText(body.honeypot)) {
    return jsonResponse(
      {
        success: true,
        message: 'Registration successful',
      },
      200,
    );
  }

  const fullName = cleanText(body.fullName);
  const rotaryClub = cleanText(body.rotaryClub);
  const purpose = cleanText(body.purpose);
  const otherPurpose = cleanText(body.otherPurpose);

  if (!fullName || !rotaryClub || !purpose) {
    return jsonResponse(
      {
        success: false,
        code: 'VALIDATION',
        message: 'Please complete the required details and try again.',
      },
      400,
    );
  }

  if (purpose === 'Other' && !otherPurpose) {
    return jsonResponse(
      {
        success: false,
        code: 'VALIDATION',
        message: 'Please describe your purpose of visit.',
      },
      400,
    );
  }

  const backendUrl = process.env.REGISTRATION_API_URL?.trim() || FALLBACK_BACKEND_URL;

  const payload: Submission = {
    fullName,
    phone: cleanText(body.phone),
    email: cleanText(body.email),
    rotaryClub,
    classification: cleanText(body.classification),
    purpose,
    otherPurpose,
    event: cleanText(body.event) || 'Rotary Club of Kitende Breeze Presidential Installation',
    date: cleanText(body.date) || '4th July 2026',
    venue: cleanText(body.venue) || 'Nican Resort, Kampala Uganda',
    submittedAt: cleanText(body.submittedAt) || new Date().toISOString(),
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const backendResponse = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
      cache: 'no-store',
    });

    clearTimeout(timeout);

    if (backendResponse.status === 409) {
      return jsonResponse(
        {
          success: false,
          code: 'DUPLICATE',
          message:
            'It looks like this guest may already be registered. Please check with the registration desk if you need help.',
        },
        409,
      );
    }

    if (!backendResponse.ok) {
      return jsonResponse(
        {
          success: false,
          code: 'UNAVAILABLE',
          message:
            'Registration is temporarily unavailable. Please try again in a moment or speak to the registration desk.',
        },
        502,
      );
    }

    return jsonResponse(
      {
        success: true,
        message: 'Registration successful',
      },
      200,
    );
  } catch {
    clearTimeout(timeout);

    return jsonResponse(
      {
        success: false,
        code: 'UNAVAILABLE',
        message:
          'We could not confirm the registration right now. Please check your connection and try again.',
      },
      503,
    );
  }
}

export function GET() {
  return jsonResponse(
    {
      success: false,
      code: 'UNKNOWN',
      message: 'This endpoint only accepts registrations.',
    },
    405,
  );
}