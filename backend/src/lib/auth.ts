import jwt from "jsonwebtoken";
import type { Request } from "express";

export type JwtUser = {
  id: string;
  email: string;
  roles: ("buyer" | "seller" | "admin")[];
};

const JWT_SECRET = process.env.JWT_SECRET;

export function signAccessToken(payload: JwtUser) {
  if (!JWT_SECRET) throw new Error("JWT_SECRET is not set");
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function getBearerToken(req: Request) {
  const auth = req.headers.authorization;
  if (!auth) return null;
  const [type, token] = auth.split(" ");
  if (type !== "Bearer" || !token) return null;
  return token;
}

export function verifyAccessToken(token: string): JwtUser {
  if (!JWT_SECRET) throw new Error("JWT_SECRET is not set");
  return jwt.verify(token, JWT_SECRET) as JwtUser;
}
