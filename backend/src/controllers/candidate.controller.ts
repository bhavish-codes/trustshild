import { Request, Response } from "express";
import { CandidateService } from "../services/candidate.service";
import { asyncHandler } from "../middleware/error-handler";
import { maskCandidate } from "../utils/masking";
import { UnauthorizedError } from "../utils/errors";

export class CandidateController {
  static create = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedError("Unauthorized access");

    const candidate = await CandidateService.createCandidate(req.body, userId);
    res.status(201).json({
      status: "success",
      message: "Candidate created successfully",
      data: maskCandidate(candidate),
    });
  });

  static list = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedError("Unauthorized access");

    const search = req.query.search as string | undefined;
    const status = req.query.status as string | undefined;
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    const result = await CandidateService.listCandidates(userId, {
      search,
      status,
      page,
      limit,
    });

    res.status(200).json({
      status: "success",
      data: {
        candidates: result.candidates.map(maskCandidate),
        pagination: result.pagination,
      },
    });
  });

  static get = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedError("Unauthorized access");

    const { id } = req.params;
    const candidate = await CandidateService.getCandidateById(id, userId);

    res.status(200).json({
      status: "success",
      data: maskCandidate(candidate),
    });
  });

  static update = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedError("Unauthorized access");

    const { id } = req.params;
    const candidate = await CandidateService.updateCandidate(id, req.body, userId);

    res.status(200).json({
      status: "success",
      message: "Candidate updated successfully",
      data: maskCandidate(candidate),
    });
  });

  static delete = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedError("Unauthorized access");

    const { id } = req.params;
    await CandidateService.deleteCandidate(id, userId);

    res.status(200).json({
      status: "success",
      message: "Candidate deleted successfully",
    });
  });
}
