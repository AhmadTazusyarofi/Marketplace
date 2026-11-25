import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { sendError } from "../lib/http.js";
import { requireAuth } from "../middleware/auth.js";

export const checkoutRouter = Router();

checkoutRouter.use(requireAuth);

const checkoutSchema = z.object({
  shippingAddress: z.string().min(5),
  shippingPhone: z.string().min(6),
  notes: z.string().optional(),
});

checkoutRouter.post("/", async (req, res) => {
  const userId = req.user!.id;
  const parsed = checkoutSchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, parsed.error.errors[0]?.message ?? "Invalid payload");

  const { shippingAddress, shippingPhone, notes } = parsed.data;

  const cartItems = await prisma.cart.findMany({
    where: { userId },
    include: { product: true },
  });

  if (cartItems.length === 0) return sendError(res, 400, "Cart is empty");

  const byStore = new Map<string, typeof cartItems>();
  for (const c of cartItems) {
    const key = c.product.storeId;
    const arr = byStore.get(key) ?? [];
    arr.push(c);
    byStore.set(key, arr);
  }

  const createdOrders: string[] = [];

  await prisma.$transaction(async (tx) => {
    for (const [storeId, items] of byStore.entries()) {
      const totalAmount = items.reduce((sum, it) => sum + Number(it.product.price) * it.quantity, 0);

      const order = await tx.order.create({
        data: {
          buyerId: userId,
          storeId,
          totalAmount,
          status: "pending",
          shippingAddress,
          shippingPhone,
          notes: notes ?? null,
          items: {
            create: items.map((it) => ({
              productId: it.productId,
              quantity: it.quantity,
              price: it.product.price,
            })),
          },
        },
      });

      createdOrders.push(order.id);
    }

    await tx.cart.deleteMany({ where: { userId } });
  });

  return res.json({ ok: true, orderIds: createdOrders });
});
