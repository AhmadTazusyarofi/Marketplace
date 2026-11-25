import type { Prisma } from "@prisma/client";
import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const ordersRouter = Router();

ordersRouter.use(requireAuth);

type OrderWithItems = Prisma.OrderGetPayload<{
  include: {
    items: {
      include: {
        product: { include: { images: true } };
        store: true;
      };
    };
  };
}>;

ordersRouter.get("/", async (req, res) => {
  const userId = BigInt(req.user!.id);

  const orders: OrderWithItems[] = await prisma.order.findMany({
    where: { buyerId: userId },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          product: { include: { images: true } },
          store: true,
        },
      },
    },
  });

  return res.json({
    orders: orders.map((o) => ({
      id: String(o.id),
      total_amount: Number(o.totalAmount),
      status: o.status ?? "pending",
      created_at: (o.createdAt ?? new Date()).toISOString(),
      stores: { name: o.items[0]?.store?.name ?? "Unknown Store" },
      order_items: o.items.map((it) => ({
        quantity: it.quantity,
        price: Number(it.price),
        products: {
          name: it.product.name,
          images: it.product.images.map((img) => img.imagePath),
        },
      })),
    })),
  });
});

ordersRouter.get("/seller", requireRole(["seller"]), async (req, res) => {
  const userId = BigInt(req.user!.id);
  const store = await prisma.store.findUnique({ where: { ownerId: userId } });
  if (!store) return res.json({ orders: [] });

  const items = await prisma.orderItem.findMany({
    where: { storeId: store.id },
    orderBy: { createdAt: "desc" },
    include: {
      order: true,
      product: { include: { images: true } },
    },
  });

  const grouped = new Map<bigint, typeof items>();
  for (const it of items) {
    const key = it.orderId;
    const arr = grouped.get(key);
    if (arr) arr.push(it);
    else grouped.set(key, [it]);
  }

  const orders = Array.from(grouped.values())
    .sort((a, b) => {
      const aDate = a[0]?.order.createdAt ?? new Date(0);
      const bDate = b[0]?.order.createdAt ?? new Date(0);
      return bDate.getTime() - aDate.getTime();
    })
    .map((group) => {
      const o = group[0]!.order;
      const total = group.reduce(
        (sum, it) => sum + Number(it.price) * it.quantity,
        0,
      );
      return {
        id: String(o.id),
        total_amount: total,
        status: o.status ?? "pending",
        created_at: (o.createdAt ?? new Date()).toISOString(),
        stores: { name: store.name },
        order_items: group.map((it) => ({
          quantity: it.quantity,
          price: Number(it.price),
          products: {
            name: it.product.name,
            images: it.product.images.map((img) => img.imagePath),
          },
        })),
      };
    });

  return res.json({ orders });
});
