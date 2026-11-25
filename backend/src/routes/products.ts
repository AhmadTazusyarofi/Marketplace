import { Router } from "express";
import fs from "fs";
import multer from "multer";
import path from "path";
import { z } from "zod";
import { sendError } from "../lib/http.js";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

// Extend Express Request untuk properti yang di-inject middleware
declare global {
  namespace Express {
    interface Request {
      resolvedProduct?: any;
    }
  }
}

export const productsRouter = Router();

// ─── Upload Config ──────────────────────────────────────────────────────────

const PRODUCT_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "produk");

const productStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    try {
      fs.mkdirSync(PRODUCT_UPLOAD_DIR, { recursive: true });
      cb(null, PRODUCT_UPLOAD_DIR);
    } catch (err) {
      cb(err as Error, PRODUCT_UPLOAD_DIR);
    }
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const productUpload = multer({
  storage: productStorage,
  limits: { fileSize: 2 * 1024 * 1024, files: 5 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Hanya file JPG/PNG/WEBP yang diizinkan"));
    }
    cb(null, true);
  },
});

/** Jalankan multer hanya jika request adalah multipart/form-data */
function maybeUploadImages(req: any, res: any, next: any) {
  const ct = String(req.headers["content-type"] ?? "");
  if (!ct.toLowerCase().startsWith("multipart/form-data")) return next();
  return productUpload.array("images", 5)(req, res, next);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseNumber(v: unknown): number | undefined {
  if (v === undefined || v === null || v === "") return undefined;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function parseBoolean(v: unknown): boolean | undefined {
  if (v === undefined || v === null || v === "") return undefined;
  if (typeof v === "boolean") return v;
  if (v === "true") return true;
  if (v === "false") return false;
  return undefined;
}

function mapVariant(v: any) {
  return {
    id: String(v.id),
    productId: String(v.productId),
    variantType: v.variantType,
    variantValue: v.variantValue,
    stock: v.stock ?? 0,
    priceModifier: Number(v.priceModifier ?? 0),
    sku: v.sku ?? null,
    isActive: Boolean(v.isActive),
  };
}

function mapProductCard(p: any) {
  const images = (p.images ?? [])
    .slice()
    .sort((a: any, b: any) => Number(b.isPrimary ?? 0) - Number(a.isPrimary ?? 0))
    .map((img: any) => img.imagePath);

  const price = Number(p.price);
  const originalPrice = p.originalPrice != null ? Number(p.originalPrice) : undefined;
  const discount = originalPrice
    ? Math.max(0, Math.round(((originalPrice - price) / originalPrice) * 100))
    : undefined;

  return {
    id: String(p.id),
    name: p.name,
    price,
    originalPrice,
    image: images[0] ?? "",
    images,
    sold: p.soldCount ?? 0,
    location: p.store?.location ?? "",
    discount,
    description: p.description ?? "",
  };
}

function mapProductSeller(p: any) {
  return {
    ...mapProductCard(p),
    stock: p.stock ?? 0,
    isActive: Boolean(p.isActive),
    categoryId: p.categoryId != null ? String(p.categoryId) : null,
    variants: (p.variants ?? []).map(mapVariant),
  };
}

// ─── Validation Schemas ───────────────────────────────────────────────────────

const upsertProductSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  description: z.string().optional(),
  price: z.number().positive("Harga harus lebih dari 0"),
  originalPrice: z.number().positive().nullable().optional(),
  stock: z.number().int().min(0, "Stok tidak boleh negatif").optional(),
  isActive: z.boolean().optional(),
  categoryId: z.number().int().positive().nullable().optional(),
  imageUrls: z.array(z.string().min(1)).min(1).optional(),
  primaryImageIndex: z.number().int().min(0).optional(),
});

const variantSchema = z.object({
  variantType: z.string().min(1).max(50),
  variantValue: z.string().min(1).max(100),
  stock: z.number().int().min(0),
  priceModifier: z.number().default(0),
  sku: z.string().max(100).nullable().optional(),
  isActive: z.boolean().optional(),
});

// ─── Helper: ambil store milik seller ─────────────────────────────────────────

async function getSellerStore(userId: bigint) {
  return prisma.store.findUnique({ where: { ownerId: userId } });
}

// ─── PUBLIC Routes ────────────────────────────────────────────────────────────

/** GET /api/products — semua produk aktif (publik) */
productsRouter.get("/", async (_req, res) => {
  const products = await prisma.product.findMany({
    where: { isActive: true, deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: { store: true, images: true },
  });
  return res.json({ products: products.map(mapProductCard) });
});

// ─── SELLER Routes ────────────────────────────────────────────────────────────

/** GET /api/products/mine — semua produk milik seller */
productsRouter.get("/mine", requireAuth, requireRole(["seller"]), async (req, res) => {
  const store = await getSellerStore(BigInt(req.user!.id));
  if (!store) return sendError(res, 404, "Toko tidak ditemukan");

  const products = await prisma.product.findMany({
    where: { storeId: store.id, deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: { store: true, images: true, variants: true },
  });

  return res.json({ products: products.map(mapProductSeller) });
});

/** GET /api/products/mine/:id — satu produk milik seller (termasuk inactive) */
productsRouter.get("/mine/:id", requireAuth, requireRole(["seller"]), async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return sendError(res, 400, "ID produk tidak valid");

  const store = await getSellerStore(BigInt(req.user!.id));
  if (!store) return sendError(res, 404, "Toko tidak ditemukan");

  const product = await prisma.product.findFirst({
    where: { id, storeId: store.id, deletedAt: null },
    include: { store: true, images: true, variants: true },
  });

  if (!product) return sendError(res, 404, "Produk tidak ditemukan");
  return res.json({ product: mapProductSeller(product) });
});

/** POST /api/products — buat produk baru */
productsRouter.post("/", requireAuth, requireRole(["seller"]), maybeUploadImages, async (req, res) => {
  const body = {
    name: req.body?.name,
    description: req.body?.description,
    price: parseNumber(req.body?.price),
    originalPrice: !req.body?.originalPrice ? null : parseNumber(req.body.originalPrice),
    stock: parseNumber(req.body?.stock),
    isActive: parseBoolean(req.body?.isActive),
    categoryId: !req.body?.categoryId ? null : parseNumber(req.body.categoryId),
    imageUrls: req.body?.imageUrls,
    primaryImageIndex: parseNumber(req.body?.primaryImageIndex),
  };

  const parsed = upsertProductSchema.safeParse(body);
  if (!parsed.success) {
    return sendError(res, 400, parsed.error.errors[0]?.message ?? "Data tidak valid");
  }

  const store = await getSellerStore(BigInt(req.user!.id));
  if (!store) return sendError(res, 404, "Toko tidak ditemukan");

  const { data: p } = parsed;
  const files = (req.files ?? []) as Express.Multer.File[];
  const uploadedPaths = files.map((f) => `/uploads/produk/${f.filename}`);
  const imagePaths = uploadedPaths.length ? uploadedPaths : (p.imageUrls ?? []);
  const primaryIndex = p.primaryImageIndex ?? 0;

  if (imagePaths.length < 1 || imagePaths.length > 5) {
    return sendError(res, 400, "Gambar produk minimal 1 dan maksimal 5");
  }
  if (primaryIndex >= imagePaths.length) {
    return sendError(res, 400, "primaryImageIndex tidak valid");
  }

  const product = await prisma.$transaction(async (tx) => {
    const created = await tx.product.create({
      data: {
        storeId: store.id,
        categoryId: p.categoryId ?? null,
        name: p.name,
        description: p.description ?? null,
        price: p.price,
        originalPrice: p.originalPrice ?? null,
        stock: (p.stock as any) ?? 0,
        isActive: p.isActive ?? true,
      },
    });

    await tx.productImage.createMany({
      data: imagePaths.map((url, idx) => ({
        productId: created.id,
        imagePath: url,
        isPrimary: idx === primaryIndex,
      })),
    });

    return tx.product.findUniqueOrThrow({
      where: { id: created.id },
      include: { store: true, images: true, variants: true },
    });
  });

  return res.status(201).json({ product: mapProductSeller(product) });
});

/** PATCH /api/products/:id — update produk */
productsRouter.patch("/:id", requireAuth, requireRole(["seller"]), maybeUploadImages, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return sendError(res, 400, "ID produk tidak valid");

  const parsed = upsertProductSchema.partial().safeParse({
    name: req.body?.name,
    description: req.body?.description,
    price: parseNumber(req.body?.price),
    originalPrice: req.body?.originalPrice === "" || req.body?.originalPrice == null
      ? undefined
      : parseNumber(req.body.originalPrice),
    stock: parseNumber(req.body?.stock),
    isActive: parseBoolean(req.body?.isActive),
    categoryId: req.body?.categoryId === "" || req.body?.categoryId == null
      ? undefined
      : parseNumber(req.body.categoryId),
    imageUrls: req.body?.imageUrls,
    primaryImageIndex: parseNumber(req.body?.primaryImageIndex),
  });

  if (!parsed.success) {
    return sendError(res, 400, parsed.error.errors[0]?.message ?? "Data tidak valid");
  }

  const store = await getSellerStore(BigInt(req.user!.id));
  if (!store) return sendError(res, 404, "Toko tidak ditemukan");

  const existing = await prisma.product.findFirst({
    where: { id, storeId: store.id, deletedAt: null },
  });
  if (!existing) return sendError(res, 404, "Produk tidak ditemukan");

  const { data: p } = parsed;
  const files = (req.files ?? []) as Express.Multer.File[];
  const uploadedPaths = files.map((f) => `/uploads/produk/${f.filename}`);
  const nextImagePaths = uploadedPaths.length ? uploadedPaths : p.imageUrls;
  const primaryIndex = p.primaryImageIndex ?? 0;

  if (nextImagePaths?.length) {
    if (nextImagePaths.length < 1 || nextImagePaths.length > 5) {
      return sendError(res, 400, "Gambar produk minimal 1 dan maksimal 5");
    }
    if (primaryIndex >= nextImagePaths.length) {
      return sendError(res, 400, "primaryImageIndex tidak valid");
    }
  }

  const product = await prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id: existing.id },
      data: {
        ...(p.name !== undefined && { name: p.name }),
        ...(p.description !== undefined && { description: p.description ?? null }),
        ...(p.price !== undefined && { price: p.price }),
        ...(p.originalPrice !== undefined && { originalPrice: p.originalPrice ?? null }),
        ...(p.stock !== undefined && { stock: p.stock }),
        ...(p.isActive !== undefined && { isActive: p.isActive }),
        ...(p.categoryId !== undefined && { categoryId: p.categoryId }),
      },
    });

    if (nextImagePaths?.length) {
      await tx.productImage.deleteMany({ where: { productId: existing.id } });
      await tx.productImage.createMany({
        data: nextImagePaths.map((url, idx) => ({
          productId: existing.id,
          imagePath: url,
          isPrimary: idx === primaryIndex,
        })),
      });
    }

    return tx.product.findUniqueOrThrow({
      where: { id: existing.id },
      include: { store: true, images: true, variants: true },
    });
  });

  return res.json({ product: mapProductSeller(product) });
});

/** DELETE /api/products/:id — soft delete produk */
productsRouter.delete("/:id", requireAuth, requireRole(["seller"]), async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return sendError(res, 400, "ID produk tidak valid");

  const store = await getSellerStore(BigInt(req.user!.id));
  if (!store) return sendError(res, 404, "Toko tidak ditemukan");

  const existing = await prisma.product.findFirst({
    where: { id, storeId: store.id, deletedAt: null },
  });
  if (!existing) return sendError(res, 404, "Produk tidak ditemukan");

  await prisma.product.update({
    where: { id: existing.id },
    data: { deletedAt: new Date(), isActive: false },
  });

  return res.status(204).send();
});

// ─── VARIANT Routes ───────────────────────────────────────────────────────────

/** Middleware: verifikasi produk milik seller & assign ke req */
async function resolveSellerProduct(req: any, res: any, next: any) {
  const productId = Number(req.params.id);
  if (!Number.isFinite(productId)) return sendError(res, 400, "ID produk tidak valid");

  const store = await getSellerStore(BigInt(req.user!.id));
  if (!store) return sendError(res, 404, "Toko tidak ditemukan");

  const product = await prisma.product.findFirst({
    where: { id: productId, storeId: store.id, deletedAt: null },
  });
  if (!product) return sendError(res, 404, "Produk tidak ditemukan");

  req.resolvedProduct = product;
  next();
}

/** POST /api/products/:id/variants — tambah varian */
productsRouter.post(
  "/:id/variants",
  requireAuth,
  requireRole(["seller"]),
  resolveSellerProduct,
  async (req, res) => {
    const parsed = variantSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, 400, parsed.error.errors[0]?.message ?? "Data tidak valid");
    }

    const { data: v } = parsed;
    const variant = await prisma.productVariant.create({
      data: {
        productId: req.resolvedProduct.id,
        variantType: v.variantType,
        variantValue: v.variantValue,
        stock: v.stock,
        priceModifier: v.priceModifier,
        sku: v.sku ?? null,
        isActive: v.isActive ?? true,
      },
    });

    return res.status(201).json({ variant: mapVariant(variant) });
  },
);

/** PATCH /api/products/:id/variants/:variantId — update varian */
productsRouter.patch(
  "/:id/variants/:variantId",
  requireAuth,
  requireRole(["seller"]),
  resolveSellerProduct,
  async (req, res) => {
    const variantId = Number(req.params.variantId);
    if (!Number.isFinite(variantId)) return sendError(res, 400, "ID varian tidak valid");

    const parsed = variantSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, 400, parsed.error.errors[0]?.message ?? "Data tidak valid");
    }

    const existing = await prisma.productVariant.findFirst({
      where: { id: variantId, productId: req.resolvedProduct.id },
    });
    if (!existing) return sendError(res, 404, "Varian tidak ditemukan");

    const { data: v } = parsed;
    const updated = await prisma.productVariant.update({
      where: { id: existing.id },
      data: {
        ...(v.variantType !== undefined && { variantType: v.variantType }),
        ...(v.variantValue !== undefined && { variantValue: v.variantValue }),
        ...(v.stock !== undefined && { stock: v.stock }),
        ...(v.priceModifier !== undefined && { priceModifier: v.priceModifier }),
        ...(v.sku !== undefined && { sku: v.sku ?? null }),
        ...(v.isActive !== undefined && { isActive: v.isActive }),
      },
    });

    return res.json({ variant: mapVariant(updated) });
  },
);

/** DELETE /api/products/:id/variants/:variantId — hapus varian */
productsRouter.delete(
  "/:id/variants/:variantId",
  requireAuth,
  requireRole(["seller"]),
  resolveSellerProduct,
  async (req, res) => {
    const variantId = Number(req.params.variantId);
    if (!Number.isFinite(variantId)) return sendError(res, 400, "ID varian tidak valid");

    const existing = await prisma.productVariant.findFirst({
      where: { id: variantId, productId: req.resolvedProduct.id },
    });
    if (!existing) return sendError(res, 404, "Varian tidak ditemukan");

    await prisma.productVariant.delete({ where: { id: existing.id } });
    return res.status(204).send();
  },
);

// ─── PUBLIC: GET produk by ID (harus paling bawah) ───────────────────────────

/** GET /api/products/:id — detail produk publik */
productsRouter.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return sendError(res, 400, "ID produk tidak valid");

  const product = await prisma.product.findFirst({
    where: { id, isActive: true, deletedAt: null },
    include: { store: true, category: true, images: true, variants: { where: { isActive: true } } },
  });

  if (!product) return sendError(res, 404, "Produk tidak ditemukan");

  const images = (product.images ?? [])
    .slice()
    .sort((a: any, b: any) => Number(b.isPrimary ?? 0) - Number(a.isPrimary ?? 0))
    .map((img: any) => img.imagePath);

  return res.json({
    product: {
      id: String(product.id),
      name: product.name,
      description: product.description ?? "",
      price: Number(product.price),
      original_price: product.originalPrice != null ? Number(product.originalPrice) : null,
      stock: product.stock,
      images,
      sold_count: product.soldCount,
      view_count: product.viewCount,
      category_id: product.categoryId ? String(product.categoryId) : null,
      store_id: String(product.storeId),
      stores: {
        id: String(product.store.id),
        name: product.store.name,
        location: product.store.location ?? "",
        logo_url: product.store.logoUrl,
      },
      categories: product.category ? { name: product.category.name } : null,
      variants: product.variants.map(mapVariant),
    },
  });
});
