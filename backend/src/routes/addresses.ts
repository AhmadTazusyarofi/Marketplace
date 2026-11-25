import { Router } from "express";
import { z } from "zod";

import { sendError } from "../lib/http.js";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

export const addressesRouter = Router();

const db = prisma as any;

addressesRouter.use(requireAuth);

const addressSchema = z.object({
  label: z.string().min(1).max(50).default("Rumah"),
  recipientName: z.string().min(2),
  phone: z.string().min(6).max(50),
  addressLine: z.string().min(5),
  postalCode: z.string().min(3).max(20).optional().nullable(),
  note: z.string().max(500).optional().nullable(),
});

type AddressPayload = z.infer<typeof addressSchema>;

function serializeAddress(a: {
  id: bigint;
  userId: bigint;
  label: string;
  recipientName: string;
  phone: string;
  addressLine: string;
  postalCode: string | null;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: String(a.id),
    label: a.label,
    recipientName: a.recipientName,
    phone: a.phone,
    addressLine: a.addressLine,
    postalCode: a.postalCode,
    note: a.note,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  };
}

addressesRouter.get("/", async (req, res) => {
  const userId = BigInt(req.user!.id);

  const [user, addresses] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { defaultAddressId: true },
    }),
    db.userAddress.findMany({
      where: { userId, deletedAt: null },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  // If user's default address points to a soft-deleted address, clear it.
  let defaultAddressId: string | null = user?.defaultAddressId
    ? String(user.defaultAddressId)
    : null;

  if (user?.defaultAddressId) {
    const defaultAddressExists = await db.userAddress.findFirst({
      where: { id: user.defaultAddressId, userId, deletedAt: null },
      select: { id: true },
    });

    if (!defaultAddressExists) {
      await db.user.update({
        where: { id: userId },
        data: { defaultAddressId: null },
      });
      defaultAddressId = null;
    }
  }

  return res.json({
    defaultAddressId,
    addresses: addresses.map(serializeAddress),
  });
});

addressesRouter.post("/", async (req, res) => {
  const parsed = addressSchema.safeParse(req.body);
  if (!parsed.success)
    return sendError(
      res,
      400,
      parsed.error.errors[0]?.message ?? "Invalid payload",
    );

  const userId = BigInt(req.user!.id);
  const payload: AddressPayload = parsed.data;

  const created = await db.userAddress.create({
    data: {
      userId,
      label: payload.label,
      recipientName: payload.recipientName,
      phone: payload.phone,
      addressLine: payload.addressLine,
      postalCode: payload.postalCode ?? null,
      note: payload.note ?? null,
    },
  });

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { defaultAddressId: true },
  });

  // If user doesn't have a default address yet, set this as default
  if (!user?.defaultAddressId) {
    await db.user.update({
      where: { id: userId },
      data: { defaultAddressId: created.id },
    });
  }

  return res.status(201).json({ address: serializeAddress(created) });
});

addressesRouter.patch("/:id", async (req, res) => {
  const parsed = addressSchema.partial().safeParse(req.body);
  if (!parsed.success)
    return sendError(
      res,
      400,
      parsed.error.errors[0]?.message ?? "Invalid payload",
    );

  const userId = BigInt(req.user!.id);
  const addressId = BigInt(req.params.id);

  const existing = await db.userAddress.findFirst({
    where: { id: addressId, userId, deletedAt: null },
  });
  if (!existing) return sendError(res, 404, "Address not found");

  const updated = await db.userAddress.update({
    where: { id: addressId },
    data: {
      ...(parsed.data.label !== undefined ? { label: parsed.data.label } : {}),
      ...(parsed.data.recipientName !== undefined
        ? { recipientName: parsed.data.recipientName }
        : {}),
      ...(parsed.data.phone !== undefined ? { phone: parsed.data.phone } : {}),
      ...(parsed.data.addressLine !== undefined
        ? { addressLine: parsed.data.addressLine }
        : {}),
      ...(parsed.data.postalCode !== undefined
        ? { postalCode: parsed.data.postalCode ?? null }
        : {}),
      ...(parsed.data.note !== undefined
        ? { note: parsed.data.note ?? null }
        : {}),
    },
  });

  return res.json({ address: serializeAddress(updated) });
});

addressesRouter.delete("/:id", async (req, res) => {
  const userId = BigInt(req.user!.id);
  const addressId = BigInt(req.params.id);

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { defaultAddressId: true },
  });

  const existing = await db.userAddress.findFirst({
    where: { id: addressId, userId },
  });
  if (!existing) return sendError(res, 404, "Address not found");

  await db.$transaction(async (tx: any) => {
    // Clear default_address_id first to satisfy FK constraint
    if (user?.defaultAddressId && user.defaultAddressId === addressId) {
      await tx.user.update({
        where: { id: userId },
        data: { defaultAddressId: null },
      });
    }

    await tx.userAddress.delete({ where: { id: addressId } });
  });

  return res.status(204).send();
});

addressesRouter.post("/:id/set-default", async (req, res) => {
  const userId = BigInt(req.user!.id);
  const addressId = BigInt(req.params.id);

  const existing = await db.userAddress.findFirst({
    where: { id: addressId, userId, deletedAt: null },
  });
  if (!existing) return sendError(res, 404, "Address not found");

  await db.user.update({
    where: { id: userId },
    data: { defaultAddressId: addressId },
  });

  return res.json({ defaultAddressId: String(addressId) });
});
