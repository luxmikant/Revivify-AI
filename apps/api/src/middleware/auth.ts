import { clerkMiddleware, requireAuth } from "@clerk/express";
import type { Request, Response, NextFunction } from "express";

export { clerkMiddleware, requireAuth };

// Extracts clerk userId from the auth object and attaches it to req
export function extractUserId(req: Request, res: Response, next: NextFunction) {
  const auth = (req as any).auth;
  if (!auth?.userId) {
    res.status(401).json({ error: "UNAUTHORIZED", message: "Authentication required" });
    return;
  }
  (req as any).clerkUserId = auth.userId;
  next();
}
