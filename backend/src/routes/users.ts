import bcrypt from "bcrypt";
import { Router } from "express";
import fs from "fs";
import multer from "multer";
import path from "path";
import { z } from "zod";

import { sendError } from "../lib/http.js";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

export const usersRouter = Router();

usersRouter.use(requireAuth);

const uploadRoot = path.join(process.cwd(), "public", "uploads", "profile");

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    try {
      fs.mkdirSync(uploadRoot, { recursive: true });
      cb(null, uploadRoot);
    } catch (err) {
      cb(err as Error, uploadRoot);
    }
  },
  filename: (_req, file, cb) => {
    const safeExt = path.extname(file.originalname).toLowerCase();
    const base = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${base}${safeExt}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok =
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/png" ||
      file.mimetype === "image/webp";
    if (!ok) return cb(new Error("Only JPG/PNG/WEBP images are allowed"));
    cb(null, true);
  },
});

usersRouter.post("/me/avatar", upload.single("avatar"), async (req, res) => {
  const userId = BigInt(req.user!.id);
  const file = req.file;
  if (!file) return sendError(res, 400, "avatar file is required");

  const avatarPath = `/uploads/profile/${file.filename}`;

  const user = await prisma.user.update({
    where: { id: userId },
    data: { avatarUrl: avatarPath },
  });

  return res.json({
    avatarUrl: user.avatarUrl,
  });
});

const updateMeSchema = z.object({
  fullName: z.string().min(2).optional(),
  phone: z.string().min(6).nullable().optional(),
});

usersRouter.patch("/me", async (req, res) => {
  const parsed = updateMeSchema.safeParse(req.body);
  if (!parsed.success)
    return sendError(
      res,
      400,
      parsed.error.errors[0]?.message ?? "Invalid payload",
    );

  const userId = BigInt(req.user!.id);
  const { fullName, phone } = parsed.data;

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(fullName !== undefined ? { fullName } : {}),
      ...(phone !== undefined ? { phone } : {}),
    },
  });

  return res.json({
    user: {
      id: String(user.id),
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      roles: [user.role],
    },
  });
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

usersRouter.patch("/me/password", async (req, res) => {
  const parsed = changePasswordSchema.safeParse(req.body);
  if (!parsed.success)
    return sendError(
      res,
      400,
      parsed.error.errors[0]?.message ?? "Invalid payload",
    );

  const userId = BigInt(req.user!.id);
  const { currentPassword, newPassword } = parsed.data;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return sendError(res, 404, "User not found");

  const ok = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!ok) return sendError(res, 401, "Current password is incorrect");

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  return res.status(204).send();
});
