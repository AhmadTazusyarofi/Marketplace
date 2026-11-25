import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { sendError } from "../lib/http.js";
import { requireAuth } from "../middleware/auth.js";

export const cartRouter = Router();

cartRouter.use(requireAuth);

cartRouter.get("/", async (req, res) => {
  const userId = req.user!.id;

  const items = await prisma.cart.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      product: {
        include: { store: true },
      },
    },
  });

  return res.json({
    items: items.map((c) => ({
      id: c.id,
      quantity: c.quantity,
      products: {
        id: c.product.id,
        name: c.product.name,
        price: Number(c.product.price),
        images: Array.isArray(c.product.images) ? c.product.images : (c.product.images ?? []),
        stock: c.product.stock,
        stores: { name: c.product.store.name },
      },
    })),
  });
});

const upsertSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).default(1),
});

cartRouter.post("/", async (req, res) => {
  const userId = req.user!.id;
  const parsed = upsertSchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, parsed.error.errors[0]?.message ?? "Invalid payload");

  const { productId, quantity } = parsed.data;
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || !product.isActive) return sendError(res, 404, "Product not found");

  const item = await prisma.cart.upsert({
    where: { userId_productId: { userId, productId } },
    create: { userId, productId, quantity },
    update: { quantity },
  });

  return res.json({ item });
});

const updateQtySchema = z.object({ quantity: z.number().int().min(1) });

cartRouter.patch("/:id", async (req, res) => {
  const userId = req.user!.id;
  const cartId = req.params.id;

  const parsed = updateQtySchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, parsed.error.errors[0]?.message ?? "Invalid payload");

  const existing = await prisma.cart.findUnique({ where: { id: cartId } });
  if (!existing || existing.userId !== userId) return sendError(res, 404, "Cart item not found");

  const updated = await prisma.cart.update({ where: { id: cartId }, data: { quantity: parsed.data.quantity } });
  return res.json({ item: updated });
});

cartRouter.delete("/:id", async (req, res) => {
  const userId = req.user!.id;
  const cartId = req.params.id;

  const existing = await prisma.cart.findUnique({ where: { id: cartId } });
  if (!existing || existing.userId !== userId) return sendError(res, 404, "Cart item not found");

  await prisma.cart.delete({ where: { id: cartId } });
  return res.json({ ok: true });
});
