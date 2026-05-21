import { Router, Request, Response } from "express";

const router = Router();

router.post("/aadhaar/verify", (req: Request, res: Response) => {
  const { aadhaarNumber } = req.body;

  if (!aadhaarNumber || aadhaarNumber.length !== 12 || !/^\d+$/.test(aadhaarNumber)) {
    return res.status(400).json({
      status: "failed",
      message: "Invalid Aadhaar number format. Must be a 12-digit number.",
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
  const { panNumber } = req.body;

  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  if (!panNumber || !panRegex.test(panNumber.toUpperCase())) {
    return res.status(400).json({
      status: "failed",
      message: "Invalid PAN number format. Must match standard format (e.g., ABCDE1234F).",
    });
  }

  const upperPan = panNumber.toUpperCase();
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
  });
});

export default router;
