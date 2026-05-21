import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { registerSchema, loginSchema } from "../validations/auth.validation";
import { validate } from "../middleware/validation.middleware";

const router = Router();

router.post("/register", validate(registerSchema), AuthController.register);
router.post("/login", validate(loginSchema), AuthController.login);

export default router;
