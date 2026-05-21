import { Router, Request, Response } from "express";

const router = Router();

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

function compareNames(name1: string, name2: string): boolean {
  const clean = (s: string) => s.toLowerCase().trim().replace(/\s+/g, " ");
  return clean(name1) === clean(name2);
}

router.post("/aadhaar/verify", (req: Request, res: Response) => {
  const { aadhaarNumber, fullName } = req.body;

  if (!aadhaarNumber || aadhaarNumber.length !== 12 || !/^\d+$/.test(aadhaarNumber)) {
    return res.status(400).json({
      status: "failed",
      message: "Invalid Aadhaar number format. Must be a 12-digit number.",
    });
  }

  const record = GOVERNMENT_AADHAAR_RECORDS[aadhaarNumber];
  if (record) {
    const nameMatch = fullName ? compareNames(fullName, record.name) : true;
    return res.status(200).json({
      status: nameMatch ? "verified" : "failed",
      nameMatch,
      dobMatch: true,
      message: nameMatch ? "Aadhaar verified successfully" : "Aadhaar name mismatch with UIDAI database",
    });
  }

  if (aadhaarNumber.startsWith("0000") || aadhaarNumber.endsWith("9999")) {
    return res.status(200).json({
      status: "failed",
      nameMatch: false,
      dobMatch: false,
      message: "Aadhaar number not found in UIDAI database.",
    });
  }

  res.status(200).json({
    status: "verified",
    nameMatch: true,
    dobMatch: true,
    message: "Aadhaar verified successfully",
  });
});

router.post("/pan/verify", (req: Request, res: Response) => {
  const { panNumber, fullName } = req.body;

  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  if (!panNumber || !panRegex.test(panNumber.toUpperCase())) {
    return res.status(400).json({
      status: "failed",
      message: "Invalid PAN number format. Must match standard format (e.g., ABCDE1234F).",
    });
  }

  const upperPan = panNumber.toUpperCase();
  const record = GOVERNMENT_PAN_RECORDS[upperPan];
  if (record) {
    const nameMatch = fullName ? compareNames(fullName, record.name) : true;
    const isVerified = nameMatch && record.status === "active";
    return res.status(200).json({
      status: isVerified ? "verified" : "failed",
      panStatus: record.status,
      name: record.name,
      message: isVerified 
        ? "PAN verified successfully" 
        : !nameMatch 
          ? "PAN name mismatch with NSDL database" 
          : "PAN is invalid or deactivated by NSDL",
    });
  }

  if (upperPan.startsWith("XYZ") || upperPan.endsWith("X")) {
    return res.status(200).json({
      status: "failed",
      panStatus: "inactive",
      message: "PAN is invalid or deactivated by NSDL.",
    });
  }

  res.status(200).json({
    status: "verified",
    panStatus: "active",
    message: "PAN verified successfully",
    name: fullName ? fullName.toUpperCase() : undefined,
  });
});

export default router;
