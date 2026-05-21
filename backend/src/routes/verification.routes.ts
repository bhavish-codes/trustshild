import { Router } from "express";
import { VerificationController } from "../controllers/verification.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/:id/start", authenticate, VerificationController.start);

export default router;
