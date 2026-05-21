import { Request, Response } from "express";
import { VerificationService } from "../services/verification.service";
import { CandidateService } from "../services/candidate.service";
import { asyncHandler } from "../middleware/error-handler";
import { maskCandidate } from "../utils/masking";
import { UnauthorizedError } from "../utils/errors";

export class VerificationController {
  static start = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedError("Unauthorized access");

    const { id } = req.params;

    await CandidateService.getCandidateById(id, userId);

    const updatedCandidate = await VerificationService.runVerification(id);

    const logs = updatedCandidate.verificationLogs.map((log) => {
      let reqPay = {};
      let resPay = {};
      try {
        reqPay = JSON.parse(log.requestPayload);
        resPay = JSON.parse(log.responsePayload);
      } catch (e) {
        reqPay = log.requestPayload;
        resPay = log.responsePayload;
      }
      return {
        ...log,
        requestPayload: reqPay,
        responsePayload: resPay,
      };
    });

    res.status(200).json({
      status: "success",
      message: "Verification completed successfully",
      data: {
        candidate: maskCandidate(updatedCandidate),
        logs,
      },
    });
  });
}
