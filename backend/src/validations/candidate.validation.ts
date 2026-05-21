// src/validations/candidate.validation.ts
import { z } from "zod";

const aadhaarRegex = /^\d{12}$/;
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

export const createCandidateSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Invalid email format"),
    phone: z.string().min(10, "Phone number must be at least 10 digits").max(15, "Phone number too long"),
    aadhaarNumber: z.string().regex(aadhaarRegex, "Aadhaar must be exactly 12 numeric digits"),
    panNumber: z.string().toUpperCase().regex(panRegex, "PAN must be in standard format (e.g., ABCDE1234F)"),
    dob: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date format for Date of Birth"),
    address: z.string().min(5, "Address must be at least 5 characters"),
  }),
});

export const updateCandidateSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, "Full name must be at least 2 characters").optional(),
    email: z.string().email("Invalid email format").optional(),
    phone: z.string().min(10, "Phone number must be at least 10 digits").max(15, "Phone number too long").optional(),
    aadhaarNumber: z.string().regex(aadhaarRegex, "Aadhaar must be exactly 12 numeric digits").optional(),
    panNumber: z.string().toUpperCase().regex(panRegex, "PAN must be in standard format (e.g., ABCDE1234F)").optional(),
    dob: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date format for Date of Birth").optional(),
    address: z.string().min(5, "Address must be at least 5 characters").optional(),
  }),
});
