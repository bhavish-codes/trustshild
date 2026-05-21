import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../utils/errors";

export interface JWTPayload {
  id: string;
  email: string;
  name: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!token) {
      throw new UnauthorizedError("No authentication token provided");
    }

    const secret = process.env.JWT_SECRET || "super-secret-key-change-this-in-production";
    const decoded = jwt.verify(token, secret) as JWTPayload;

    req.user = decoded;
    next();
  } catch (error) {
    next(new UnauthorizedError("Authentication failed: invalid or expired token"));
  }
};
