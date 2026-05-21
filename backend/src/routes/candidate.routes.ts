import { Router } from "express";
import { CandidateController } from "../controllers/candidate.controller";
import { createCandidateSchema, updateCandidateSchema } from "../validations/candidate.validation";
import { validate } from "../middleware/validation.middleware";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.post("/", validate(createCandidateSchema), CandidateController.create);
router.get("/", CandidateController.list);
router.get("/:id", CandidateController.get);
router.put("/:id", validate(updateCandidateSchema), CandidateController.update);
router.delete("/:id", CandidateController.delete);

export default router;
