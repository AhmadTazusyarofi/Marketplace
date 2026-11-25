import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch } from "@/lib/apiClient";
import type { SellerProduct, ProductVariant } from "@/types/product";

// ─── Query Keys ───────────────────────────────────────────────────────────────

const KEYS = {
  sellerList: ["seller", "products"] as const,
  sellerDetail: (id: string) => ["seller", "products", id] as const,
};

// ─── Seller: List ─────────────────────────────────────────────────────────────

export function useSellerProducts() {
  return useQuery({
    queryKey: KEYS.sellerList,
    queryFn: () =>
      apiFetch<{ products: SellerProduct[] }>("/api/products/mine").then(
        (r) => r.products,
      ),
  });
}

// ─── Seller: Single ───────────────────────────────────────────────────────────

export function useSellerProduct(id: string | undefined) {
  return useQuery({
    queryKey: KEYS.sellerDetail(id ?? ""),
    queryFn: () =>
      apiFetch<{ product: SellerProduct }>(`/api/products/mine/${id}`).then(
        (r) => r.product,
      ),
    enabled: !!id,
  });
}

// ─── Seller: Create ───────────────────────────────────────────────────────────

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) =>
      apiFetch<{ product: SellerProduct }>("/api/products", {
        method: "POST",
        body: formData,
      }).then((r) => r.product),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.sellerList });
      toast.success("Produk berhasil ditambahkan");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

// ─── Seller: Update ───────────────────────────────────────────────────────────

export function useUpdateProduct(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) =>
      apiFetch<{ product: SellerProduct }>(`/api/products/${id}`, {
        method: "PATCH",
        body: formData,
      }).then((r) => r.product),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.sellerList });
      qc.invalidateQueries({ queryKey: KEYS.sellerDetail(id) });
      toast.success("Produk berhasil diperbarui");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

// ─── Seller: Delete ───────────────────────────────────────────────────────────

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/products/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.sellerList });
      toast.success("Produk berhasil dihapus");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

// ─── Seller: Toggle status aktif/nonaktif ────────────────────────────────────

export function useToggleProductStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => {
      const fd = new FormData();
      fd.append("isActive", String(isActive));
      return apiFetch<{ product: SellerProduct }>(`/api/products/${id}`, {
        method: "PATCH",
        body: fd,
      }).then((r) => r.product);
    },
    onSuccess: (_, { isActive }) => {
      qc.invalidateQueries({ queryKey: KEYS.sellerList });
      toast.success(isActive ? "Produk diaktifkan" : "Produk dinonaktifkan");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

// ─── Variants: Create ─────────────────────────────────────────────────────────

type VariantPayload = {
  variantType: string;
  variantValue: string;
  stock: number;
  priceModifier: number;
  sku?: string | null;
};

export function useCreateVariant(productId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: VariantPayload) =>
      apiFetch<{ variant: ProductVariant }>(
        `/api/products/${productId}/variants`,
        { method: "POST", body: JSON.stringify(payload) },
      ).then((r) => r.variant),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.sellerDetail(productId) });
      toast.success("Varian ditambahkan");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

// ─── Variants: Update ─────────────────────────────────────────────────────────

type VariantUpdatePayload = Partial<VariantPayload & { isActive: boolean }>;

export function useUpdateVariant(productId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      variantId,
      data,
    }: {
      variantId: string;
      data: VariantUpdatePayload;
    }) =>
      apiFetch<{ variant: ProductVariant }>(
        `/api/products/${productId}/variants/${variantId}`,
        { method: "PATCH", body: JSON.stringify(data) },
      ).then((r) => r.variant),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.sellerDetail(productId) });
      toast.success("Varian diperbarui");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

// ─── Variants: Delete ─────────────────────────────────────────────────────────

export function useDeleteVariant(productId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (variantId: string) =>
      apiFetch(`/api/products/${productId}/variants/${variantId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.sellerDetail(productId) });
      toast.success("Varian dihapus");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
