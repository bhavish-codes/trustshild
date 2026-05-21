import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { asyncHandler } from "../middleware/error-handler";

export class AuthController {
  static register = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password } = req.body;
    const result = await AuthService.register(name, email, password);
    res.status(201).json({
      status: "success",
      message: "User registered successfully",
      data: result,
    });
  });

  static login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);
    res.status(200).json({
      status: "success",
      message: "User logged in successfully",
      data: result,
    });
  });
}
