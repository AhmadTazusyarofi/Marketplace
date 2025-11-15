// src/components/FlashSaleSection.tsx
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Flame, Clock, ShoppingCart } from "lucide-react";

// ===== Dummy Data (bebas ganti) =====
type SaleItem = {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice: number;
  sold: number; // pcs terjual
  stock: number; // total stock
};

const saleItems: SaleItem[] = [
  {
    id: "1",
    name: "Iphone 17 Pro Max I-box 128GB",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
    price: 20999000,
    originalPrice: 24500000,
    sold: 1234,
    stock: 2000,
  },
  {
    id: "2",
    name: "Headphone Wireless Noise Cancelling",
    image: "https://images.unsplash.com/photo-1676315636995-a5d5df17b192?w=600",
    price: 549000,
    originalPrice: 799000,
    sold: 3421,
    stock: 5000,
  },
  {
    id: "3",
    name: "Keyboard Mechanical RGB Gaming",
    image:
      "https://plus.unsplash.com/premium_photo-1664194583917-b0ba07c4ce2a?w=600",
    price: 679000,
    originalPrice: 899000,
    sold: 521,
    stock: 3000,
  },
  {
    id: "4",
    name: "Sepatu Sneakers Unisex",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
    price: 249000,
    originalPrice: 399000,
    sold: 856,
    stock: 2500,
  },
];

// Utility format rupiah
const rupiah = (n: number) => "Rp " + n.toLocaleString("id-ID");

// Hitung diskon (%)
const discountPct = (orig: number, cur: number) =>
  Math.max(0, Math.round(((orig - cur) / orig) * 100));

export default function FlashSaleSection() {
  // atur waktu berakhir (misal 2 jam dari sekarang)
  const endAt = useMemo(() => Date.now() + 2 * 60 * 60 * 1000, []);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const remaining = Math.max(0, endAt - now);
  const isEnded = remaining === 0;

  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

  return (
    <section className="container mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/15">
            <Flame className="h-5 w-5 text-orange-500" />
          </span>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold leading-tight">
              Flash Sale
            </h2>
            <p className="text-sm text-muted-foreground -mt-1">
              Diskon spesial dalam waktu terbatas
            </p>
          </div>
        </div>

        {/* Countdown */}
        <div className="flex items-center gap-3 rounded-xl border bg-card px-3 py-2">
          <Clock className="h-4 w-4 text-primary" />
          {isEnded ? (
            <span className="text-sm font-semibold text-destructive">
              Berakhir
            </span>
          ) : (
            <div className="flex items-center gap-1 text-sm font-mono">
              <TimeBox v={hours} />
              <span>:</span>
              <TimeBox v={minutes} />
              <span>:</span>
              <TimeBox v={seconds} />
            </div>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {saleItems.map((p) => {
          const pct = discountPct(p.originalPrice, p.price);
          const progress = Math.min(100, Math.round((p.sold / p.stock) * 100));

          return (
            <Card
              key={p.id}
              className="group overflow-hidden border hover:shadow-elevated transition-all"
            >
              <div className="relative aspect-square overflow-hidden bg-secondary">
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                {pct > 0 && (
                  <Badge className="absolute top-2 left-2 bg-destructive">
                    {pct}% OFF
                  </Badge>
                )}
              </div>

              <div className="p-4">
                <h3 className="mb-2 line-clamp-2 text-sm font-medium min-h-[40px]">
                  {p.name}
                </h3>

                <div className="mb-1 flex items-baseline gap-2">
                  <span className="text-lg font-bold text-primary">
                    {rupiah(p.price)}
                  </span>
                  <span className="text-xs text-muted-foreground line-through">
                    {rupiah(p.originalPrice)}
                  </span>
                </div>

                {/* Progress terjual */}
                <div className="mt-2">
                  <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full bg-orange-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Terjual {p.sold.toLocaleString("id-ID")}</span>
                    <span>
                      Sisa {(p.stock - p.sold).toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                <Separator className="my-3" />

                <Button className="w-full gap-2" disabled={isEnded}>
                  <ShoppingCart className="h-4 w-4" />
                  {isEnded ? "Sale Berakhir" : "Tambah ke Keranjang"}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

// Kotak waktu kecil
function TimeBox({ v }: { v: number }) {
  const val = String(v).padStart(2, "0");
  return (
    <span className="inline-flex min-w-[36px] items-center justify-center rounded-md bg-primary/10 px-2 py-1 font-semibold">
      {val}
    </span>
  );
}
