import type { Request, Response, NextFunction } from "express";

/**
 * Extracts Clerk userId from the Bearer JWT (the 'sub' claim).
 * Works independently — no clerkMiddleware() needed upstream.
 */
export function extractUserId(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "UNAUTHORIZED", message: "No token provided" });
    return;
  }
  const token = authHeader.split(" ")[1];
  try {
    const payloadB64 = token.split(".")[1];
    if (!payloadB64) throw new Error("Malformed token");
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString());
    const userId = payload.sub as string | undefined;
    if (!userId) {
      res.status(401).json({ error: "UNAUTHORIZED", message: "Invalid token payload" });
      return;
    }
    (req as any).clerkUserId = userId;
    next();
  } catch {
    res.status(401).json({ error: "UNAUTHORIZED", message: "Token decode failed" });
  }
}
