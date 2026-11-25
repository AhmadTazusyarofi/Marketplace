import bcrypt from "bcrypt";
import crypto from "crypto";
import { Router } from "express";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { signAccessToken } from "../lib/auth.js";
import { sendError } from "../lib/http.js";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

export const authRouter = Router();

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const googleCallbackUrl = process.env.GOOGLE_CALLBACK_URL;
const frontendUrl = process.env.FRONTEND_URL;
const jwtSecret = process.env.JWT_SECRET;

const googleClient =
  googleClientId && googleClientSecret && googleCallbackUrl
    ? new OAuth2Client({
        clientId: googleClientId,
        clientSecret: googleClientSecret,
        redirectUri: googleCallbackUrl,
      })
    : null;

const registerSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().min(6).optional(),
  avatarUrl: z.string().min(3).optional(),
  role: z.enum(["buyer", "seller"]).default("buyer"),
  storeName: z.string().min(2).optional(),
  storeLocation: z.string().min(2).optional(),
});

authRouter.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success)
    return sendError(
      res,
      400,
      parsed.error.errors[0]?.message ?? "Invalid payload",
    );

  const {
    fullName,
    email,
    password,
    phone,
    avatarUrl,
    role,
    storeName,
    storeLocation,
  } = parsed.data;
  if (role === "seller" && !storeName)
    return sendError(res, 400, "storeName is required for seller");

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return sendError(res, 409, "Email already registered");

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      fullName,
      phone: phone ?? null,
      avatarUrl: avatarUrl ?? null,
      role,
      ...(role === "seller"
        ? {
            stores: {
              create: [
                {
                  name: storeName!,
                  location: storeLocation?.trim() ? storeLocation.trim() : null,
                },
              ],
            },
          }
        : {}),
    },
  });

  const roles = [user.role];
  const token = signAccessToken({
    id: String(user.id),
    email: user.email,
    roles,
  });

  return res.json({
    token,
    user: {
      id: String(user.id),
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      roles,
    },
  });
});

authRouter.get("/google", (req, res) => {
  if (!googleClient)
    return sendError(res, 500, "Google OAuth is not configured");
  if (!jwtSecret) return sendError(res, 500, "JWT_SECRET is not set");

  const onboardingSchema = z.object({
    redirectTo: z.string().optional(),
    role: z.enum(["buyer", "seller"]).optional(),
    storeName: z.string().optional(),
    storeLocation: z.string().optional(),
  });

  const parsed = onboardingSchema.safeParse({
    redirectTo:
      typeof req.query.redirectTo === "string"
        ? req.query.redirectTo
        : undefined,
    role: typeof req.query.role === "string" ? req.query.role : undefined,
    storeName:
      typeof req.query.storeName === "string" ? req.query.storeName : undefined,
    storeLocation:
      typeof req.query.storeLocation === "string"
        ? req.query.storeLocation
        : undefined,
  });

  if (!parsed.success)
    return sendError(
      res,
      400,
      parsed.error.errors[0]?.message ?? "Invalid payload",
    );

  const redirectTo = parsed.data.redirectTo?.trim()
    ? parsed.data.redirectTo.trim()
    : "/";

  const role = parsed.data.role;
  const storeName = parsed.data.storeName?.trim() || undefined;
  const storeLocation = parsed.data.storeLocation?.trim() || undefined;

  if (role === "seller" && !storeName)
    return sendError(res, 400, "storeName is required for seller");

  const state = jwt.sign(
    {
      n: crypto.randomBytes(16).toString("hex"),
      r: redirectTo,
      role,
      storeName,
      storeLocation,
    },
    jwtSecret,
    { expiresIn: "10m" },
  );

  const url = googleClient.generateAuthUrl({
    access_type: "offline",
    scope: ["openid", "email", "profile"],
    state,
    prompt: "consent",
  });

  return res.redirect(url);
});

authRouter.get("/google/callback", async (req, res) => {
  if (!googleClient)
    return sendError(res, 500, "Google OAuth is not configured");
  if (!jwtSecret) return sendError(res, 500, "JWT_SECRET is not set");

  const code = typeof req.query.code === "string" ? req.query.code : null;
  const state = typeof req.query.state === "string" ? req.query.state : null;
  if (!code) return sendError(res, 400, "Missing code");
  if (!state) return sendError(res, 400, "Missing state");

  let redirectTo = "/";
  let signupRole: "buyer" | "seller" | undefined;
  let signupStoreName: string | undefined;
  let signupStoreLocation: string | undefined;
  try {
    const payload = jwt.verify(state, jwtSecret) as {
      r?: string;
      role?: "buyer" | "seller";
      storeName?: string;
      storeLocation?: string;
    };
    if (typeof payload.r === "string" && payload.r) redirectTo = payload.r;
    if (payload.role === "buyer" || payload.role === "seller") {
      signupRole = payload.role;
      signupStoreName = payload.storeName?.trim() || undefined;
      signupStoreLocation = payload.storeLocation?.trim() || undefined;
    }
  } catch {
    return sendError(res, 400, "Invalid state");
  }

  const tokenRes = await googleClient.getToken(code);
  googleClient.setCredentials(tokenRes.tokens);

  const userInfoRes = await googleClient.request({
    url: "https://www.googleapis.com/oauth2/v2/userinfo",
  });

  const data = userInfoRes.data as unknown as {
    email?: string;
    name?: string;
    picture?: string;
  };

  const email = data.email?.trim();
  if (!email) return sendError(res, 400, "Google account email not found");

  const fullName = (data.name || "Pengguna").trim() || "Pengguna";
  const avatarUrl = data.picture?.trim() ? data.picture.trim() : null;

  const existing = await prisma.user.findUnique({ where: { email } });
  let user = existing;

  if (!user) {
    const randomPassword = crypto.randomBytes(32).toString("hex");
    const passwordHash = await bcrypt.hash(randomPassword, 10);

    const roleToUse = signupRole || "buyer";
    if (roleToUse === "seller" && !signupStoreName)
      return sendError(res, 400, "storeName is required for seller");

    user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        avatarUrl,
        role: roleToUse,
        ...(roleToUse === "seller"
          ? {
              stores: {
                create: [
                  {
                    name: signupStoreName!,
                    location: signupStoreLocation ?? null,
                  },
                ],
              },
            }
          : {}),
      },
    });
  } else {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(avatarUrl ? { avatarUrl } : {}),
        ...(fullName ? { fullName } : {}),
      },
    });
  }

  const roles = [user.role];
  const token = signAccessToken({
    id: String(user.id),
    email: user.email,
    roles,
  });

  const base = frontendUrl || "http://localhost:5173";
  const url = new URL("/auth/callback", base);
  url.searchParams.set("token", token);
  url.searchParams.set("redirectTo", redirectTo);
  return res.redirect(url.toString());
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success)
    return sendError(
      res,
      400,
      parsed.error.errors[0]?.message ?? "Invalid payload",
    );

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return sendError(res, 401, "Invalid email or password");

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return sendError(res, 401, "Invalid email or password");

  const roles = [user.role];
  const token = signAccessToken({
    id: String(user.id),
    email: user.email,
    roles,
  });

  return res.json({
    token,
    user: {
      id: String(user.id),
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      roles,
    },
  });
});

authRouter.get("/me", requireAuth, async (req, res) => {
  const userId = BigInt(req.user!.id);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return sendError(res, 404, "User not found");

  const roles = [user.role];
  return res.json({
    user: {
      id: String(user.id),
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      roles,
    },
  });
});
