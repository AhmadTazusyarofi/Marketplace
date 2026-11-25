import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/apiClient";
import type { Category } from "@/types/product";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () =>
      apiFetch<{ categories: Category[] }>("/api/categories").then(
        (r) => r.categories,
      ),
    staleTime: 5 * 60 * 1000, // cache 5 menit, jarang berubah
  });
}
