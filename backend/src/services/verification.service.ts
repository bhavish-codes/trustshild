// src/services/verification.service.ts
import { prisma } from "../prisma/client";
import { NotFoundError } from "../utils/errors";

export interface AadhaarVerifyResponse {
  status: "verified" | "failed";
  nameMatch: boolean;
  dobMatch: boolean;
  message: string;
}

export interface PANVerifyResponse {
  status: "verified" | "failed";
  panStatus: "active" | "inactive";
  message: string;
  name?: string;
}

// Simulated government records to mimic official UIDAI / NSDL databases
const GOVERNMENT_AADHAAR_RECORDS: Record<string, { name: string; dob: string }> = {
  "123412341234": { name: "ALICE JOHNSON", dob: "1995-08-15" },
  "000000009999": { name: "BOB SMITH", dob: "1990-11-23" },
  "123456789012": { name: "CAROL SHELBY", dob: "1998-04-02" },
  "888899991111": { name: "DAVID MILLER", dob: "1992-05-12" },
};

const GOVERNMENT_PAN_RECORDS: Record<string, { name: string; status: "active" | "inactive" }> = {
  "ABCDE1234F": { name: "ALICE JOHNSON", status: "active" },
  "XYZDE5678X": { name: "BOB SMITH", status: "inactive" },
  "XYZAB9012X": { name: "CAROL SHELBY", status: "active" },
  "FGHIJ5678K": { name: "DAVID MILLER", status: "active" },
};

// Standard case-insensitive and whitespace-ignoring name matching check
function compareNames(name1: string, name2: string): boolean {
  const clean = (s: string) => s.toLowerCase().trim().replace(/\s+/g, " ");
  return clean(name1) === clean(name2);
}

export class VerificationService {
  // Simulate Aadhaar API check
  static async mockVerifyAadhaar(aadhaarNumber: string, fullName?: string): Promise<AadhaarVerifyResponse> {
    // Artificial latency to simulate network call
    await new Promise((resolve) => setTimeout(resolve, 800));

    const record = GOVERNMENT_AADHAAR_RECORDS[aadhaarNumber];
    if (record) {
      const nameMatch = fullName ? compareNames(fullName, record.name) : true;
      return {
        status: nameMatch ? "verified" : "failed",
        nameMatch,
        dobMatch: true,
        message: nameMatch ? "Aadhaar verified successfully" : "Aadhaar name mismatch with UIDAI database",
      };
    }

    // Fallback business rules for mock failure/success
    if (aadhaarNumber.startsWith("0000") || aadhaarNumber.endsWith("9999")) {
      return {
        status: "failed",
        nameMatch: false,
        dobMatch: false,
        message: "Aadhaar number not found in UIDAI database",
      };
    }

    return {
      status: "verified",
      nameMatch: true,
      dobMatch: true,
      message: "Aadhaar verified successfully",
    };
  }

  // Simulate PAN API check
  static async mockVerifyPAN(panNumber: string, fullName?: string): Promise<PANVerifyResponse> {
    // Artificial latency to simulate network call
    await new Promise((resolve) => setTimeout(resolve, 600));

    const upperPan = panNumber.toUpperCase();
    const record = GOVERNMENT_PAN_RECORDS[upperPan];
    if (record) {
      const nameMatch = fullName ? compareNames(fullName, record.name) : true;
      const isVerified = nameMatch && record.status === "active";
      return {
        status: isVerified ? "verified" : "failed",
        panStatus: record.status,
        name: record.name,
        message: isVerified 
          ? "PAN verified successfully" 
          : !nameMatch 
            ? "PAN name mismatch with NSDL database" 
            : "PAN is invalid or deactivated by NSDL",
      };
    }

    if (upperPan.startsWith("XYZ") || upperPan.endsWith("X")) {
      return {
        status: "failed",
        panStatus: "inactive",
        message: "PAN is invalid or deactivated by NSDL",
      };
    }

    return {
      status: "verified",
      panStatus: "active",
      message: "PAN verified successfully",
      name: fullName ? fullName.toUpperCase() : undefined,
    };
  }

  // Primary workflow to perform complete background checks
  static async runVerification(candidateId: string) {
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
    });

    if (!candidate) {
      throw new NotFoundError("Candidate not found");
    }

    // Update status to PENDING/VERIFYING first (if already starting)
    await prisma.candidate.update({
      where: { id: candidateId },
      data: { status: "PENDING" },
    });

    // 1. Aadhaar verification
    let aadhaarResult: AadhaarVerifyResponse;
    try {
      aadhaarResult = await this.mockVerifyAadhaar(candidate.aadhaarNumber, candidate.fullName);
    } catch (error: any) {
      aadhaarResult = {
        status: "failed",
        nameMatch: false,
        dobMatch: false,
        message: error.message || "Aadhaar Verification System Offline",
      };
    }

    // Save Aadhaar log
    await prisma.verificationLog.create({
      data: {
        candidateId: candidate.id,
        verificationType: "AADHAAR",
        requestPayload: JSON.stringify({ aadhaarNumber: candidate.aadhaarNumber }),
        responsePayload: JSON.stringify(aadhaarResult),
        verificationStatus: aadhaarResult.status === "verified" ? "VERIFIED" : "FAILED",
      },
    });

    // 2. PAN verification
    let panResult: PANVerifyResponse;
    try {
      panResult = await this.mockVerifyPAN(candidate.panNumber, candidate.fullName);
    } catch (error: any) {
      panResult = {
        status: "failed",
        panStatus: "inactive",
        message: error.message || "PAN Verification System Offline",
      };
    }

    // Save PAN log
    await prisma.verificationLog.create({
      data: {
        candidateId: candidate.id,
        verificationType: "PAN",
        requestPayload: JSON.stringify({ panNumber: candidate.panNumber }),
        responsePayload: JSON.stringify(panResult),
        verificationStatus: panResult.status === "verified" ? "VERIFIED" : "FAILED",
      },
    });

    // 3. Overall candidate status evaluation
    let overallStatus: "VERIFIED" | "FAILED" | "PARTIAL" = "FAILED";
    const aadhaarSuccess = aadhaarResult.status === "verified";
    const panSuccess = panResult.status === "verified";

    if (aadhaarSuccess && panSuccess) {
      overallStatus = "VERIFIED";
    } else if (aadhaarSuccess || panSuccess) {
      overallStatus = "PARTIAL";
    } else {
      overallStatus = "FAILED";
    }

    // Update candidate final status
    const updatedCandidate = await prisma.candidate.update({
      where: { id: candidateId },
      data: { status: overallStatus },
      include: {
        verificationLogs: true,
      },
    });

    return updatedCandidate;
  }
}
