import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import type { DemoProduct } from "@/data/demoProducts";

type Props = {
  products: DemoProduct[];
  placeholder?: string;
};

const rupiah = (n: number) => "Rp " + n.toLocaleString("id-ID");

export default function SearchAutosuggest({ products, placeholder }: Props) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 8);
  }, [query, products]);

  const goToProduct = (p: DemoProduct) => {
    // kirim state supaya ProductDetail bisa pakai data dummy
    navigate(`/product/${p.id}`, { state: { product: p } });
    setOpen(false);
    setQuery("");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      return;
    }
    if (!results.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      goToProduct(results[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  // tutup saat blur (tapi izinkan klik item)
  const onBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    // delay sedikit agar onMouseDown item keburu jalan
    setTimeout(() => {
      if (!wrapRef.current?.contains(document.activeElement)) {
        setOpen(false);
      }
    }, 50);
  };

  return (
    <div className="relative w-full" ref={wrapRef} onBlur={onBlur}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActiveIndex(0);
          }}
          onFocus={() => query && setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder ?? "Cari produk, kategori, atau toko..."}
          className="pl-10 w-full"
        />
      </div>

      {open && query && (
        <Card className="absolute z-50 mt-2 w-full overflow-hidden p-0">
          {results.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">
              Tidak ada hasil untuk “{query}”.
            </div>
          ) : (
            <ul className="max-h-96 overflow-auto py-2">
              {results.map((p, idx) => {
                const active = idx === activeIndex;
                return (
                  <li
                    key={p.id}
                    className={[
                      "flex cursor-pointer items-center gap-3 px-3 py-2 transition-colors",
                      active ? "bg-secondary" : "hover:bg-secondary/70",
                    ].join(" ")}
                    // pakai onMouseDown agar tidak kehilangan fokus sebelum navigate
                    onMouseDown={(e) => {
                      e.preventDefault();
                      goToProduct(p);
                    }}
                  >
                    <img
                      src={p.image}
                      alt={p.name}
                      className="h-10 w-10 rounded object-cover"
                      loading="lazy"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{p.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {rupiah(p.price)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      )}
    </div>
  );
}
