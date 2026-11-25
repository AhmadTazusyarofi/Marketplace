import type { NextFunction, Request, Response } from "express";
import { getBearerToken, verifyAccessToken, type JwtUser } from "../lib/auth.js";
import { sendError } from "../lib/http.js";

declare global {
  namespace Express {
    interface Request {
      user?: JwtUser;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = getBearerToken(req);
  if (!token) return sendError(res, 401, "Unauthorized");

  try {
    req.user = verifyAccessToken(token);
    return next();
  } catch {
    return sendError(res, 401, "Invalid token");
  }
}

export function requireRole(roles: JwtUser["roles"]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return sendError(res, 401, "Unauthorized");
    const ok = req.user.roles.some((r) => roles.includes(r));
    if (!ok) return sendError(res, 403, "Forbidden");
    return next();
  };
}
