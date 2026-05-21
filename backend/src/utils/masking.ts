// src/utils/masking.ts

/**
 * Masks a 12-digit Aadhaar number to XXXX-XXXX-1234 format.
 */
export const maskAadhaar = (aadhaar: string): string => {
  if (!aadhaar || aadhaar.length !== 12) return aadhaar;
  return `XXXX-XXXX-${aadhaar.slice(8)}`;
};

/**
 * Masks a 10-char PAN number to XXXXX1234X format.
 */
export const maskPAN = (pan: string): string => {
  if (!pan || pan.length !== 10) return pan;
  return `XXXXX${pan.slice(5, 9)}${pan.slice(9)}`;
};

/**
 * Masks sensitive fields in a candidate object.
 */
export const maskCandidate = (candidate: any) => {
  if (!candidate) return candidate;
  return {
    ...candidate,
    aadhaarNumber: maskAadhaar(candidate.aadhaarNumber),
    panNumber: maskPAN(candidate.panNumber),
  };
};
