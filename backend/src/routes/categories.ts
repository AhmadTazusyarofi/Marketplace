import { Router } from "express";
import { prisma } from "../lib/prisma.js";

export const categoriesRouter = Router();

categoriesRouter.get("/", async (_req, res) => {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return res.json({
    categories: categories.map((c) => ({
      id: String(c.id),
      name: c.name,
      slug: c.slug,
    })),
  });
});
