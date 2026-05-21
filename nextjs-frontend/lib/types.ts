// lib/types.ts — Shared TypeScript interfaces
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Candidate {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  aadhaarNumber: string;
  panNumber: string;
  dob: string;
  address: string;
  status: "PENDING" | "VERIFIED" | "PARTIAL" | "FAILED";
  createdAt: string;
  createdById: string;
  createdBy?: { id: string; name: string; email: string };
  verificationLogs?: VerificationLog[];
}

export interface VerificationLog {
  id: string;
  candidateId: string;
  verificationType: "AADHAAR" | "PAN";
  requestPayload: Record<string, any>;
  responsePayload: Record<string, any>;
  verificationStatus: "VERIFIED" | "FAILED";
  verifiedAt: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CandidateListResponse {
  candidates: Candidate[];
  pagination: PaginationMeta;
}

export type CandidateFormData = {
  fullName: string;
  email: string;
  phone: string;
  aadhaarNumber: string;
  panNumber: string;
  dob: string;
  address: string;
};
