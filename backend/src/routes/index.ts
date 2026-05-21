import { Router } from "express";
import authRoutes from "./auth.routes";
import candidateRoutes from "./candidate.routes";
import verificationRoutes from "./verification.routes";
import { apiLimiter, authLimiter } from "../middleware/rate-limiter";

const router = Router();

router.use("/auth", authLimiter, authRoutes);
router.use("/candidates", apiLimiter, candidateRoutes);
router.use("/verifications", apiLimiter, verificationRoutes);

router.get("/health", apiLimiter, (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Background Verification Platform API is healthy and operational.",
    timestamp: new Date().toISOString(),
  });
});

export default router;
