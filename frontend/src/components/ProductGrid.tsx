import { apiFetch } from "@/lib/apiClient";
import { useEffect, useState } from "react";
import { ProductCard } from "./ProductCard";

type ProductCardData = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  rating?: number;
  sold: number;
  location: string;
  discount?: number;
  description?: string;
};

export const ProductGrid = () => {
  const [products, setProducts] = useState<ProductCardData[]>([]);

  useEffect(() => {
    let mounted = true;
    apiFetch<{ products: ProductCardData[] }>("/api/products")
      .then((res) => {
        if (mounted) setProducts(res.products || []);
      })
      .catch((err) => {
        console.error(err);
        if (mounted) setProducts([]);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">Produk Pilihan</h2>
        <p className="text-muted-foreground">
          Produk terlaris dan terpopuler minggu ini
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </section>
  );
};
