export type Submission = {
  fullName: string;
  phone: string;
  email: string;
  rotaryClub: string;
  classification: string;
  purpose: string;
  otherPurpose: string;
  event: string;
  date: string;
  venue: string;
  submittedAt: string;
};

export type RegistrationResponse = {
  success: boolean;
  message: string;
  code?: 'VALIDATION' | 'DUPLICATE' | 'UNAVAILABLE' | 'UNKNOWN';
};

/**
 * Backward-compatible alias in case old files still import registrationResponse.
 */
export type registrationResponse = RegistrationResponse;