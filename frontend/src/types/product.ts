// ─── Category ────────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  slug: string;
}

// ─── Product (public / buyer view) ───────────────────────────────────────────

export interface ProductCard {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  sold: number;
  location: string;
  discount?: number;
  description: string;
}

// ─── Product Variant ─────────────────────────────────────────────────────────

export interface ProductVariant {
  id: string;
  productId: string;
  variantType: string;
  variantValue: string;
  stock: number;
  priceModifier: number;
  sku: string | null;
  isActive: boolean;
}

// ─── Seller Product ───────────────────────────────────────────────────────────

export interface SellerProduct extends ProductCard {
  stock: number;
  isActive: boolean;
  categoryId: string | null;
  variants: ProductVariant[];
}

// ─── Image state (UI-only, dipakai di ProductForm & ImageUploader) ────────────

export type ImageState =
  | { mode: "existing"; urls: string[]; primaryIndex: number }
  | { mode: "new"; files: File[]; previews: string[]; primaryIndex: number };

// ─── Form values ──────────────────────────────────────────────────────────────

export interface ProductFormValues {
  name: string;
  description: string;
  price: number;
  originalPrice: number | null;
  stock: number;
  isActive: boolean;
  categoryId: string | null;
}
