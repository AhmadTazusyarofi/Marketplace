import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ArrowLeft,
  Package,
  TrendingUp,
  Shield,
} from "lucide-react";

// ganti ke 3 gambar baru
import hero1 from "@/assets/hero-banner1.jpg";
import hero2 from "@/assets/hero-banner2.jpg";
import hero3 from "@/assets/hero-banner3.jpg";
import hero4 from "@/assets/hero-banner4.jpg";

const slides = [
  {
    img: hero1,
    title: "Belanja & Jual Online Lebih Mudah",
    desc: "Platform marketplace terpercaya untuk jutaan produk dari ribuan penjual terbaik",
  },
  {
    img: hero2,
    title: "Diskon Spesial Tiap Hari",
    desc: "Nikmati promo menarik dan pengiriman cepat ke seluruh Indonesia",
  },
  {
    img: hero3,
    title: "Jualan Makin Gampang",
    desc: "Buka toko sekarang, kelola produk, dan raih lebih banyak pelanggan",
  },
  {
    img: hero4,
    title: "Cari barang apa saja di LapakIn",
    desc: "Temukan jutaan produk berkualitas dengan harga terbaik hanya di LapakIn",
  },
];

export const HeroSection = () => {
  const [active, setActive] = useState(0);
  const timerRef = useRef<number | null>(null);

  // auto-rotate
  useEffect(() => {
    start();
    return stop;
  }, [active]);

  const start = () => {
    stop();
    timerRef.current = window.setTimeout(() => {
      setActive((i) => (i + 1) % slides.length);
    }, 3000);
  };

  const stop = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const prev = () => setActive((i) => (i - 1 + slides.length) % slides.length);
  const next = () => setActive((i) => (i + 1) % slides.length);

  return (
    <section className="relative overflow-hidden">
      {/* Carousel */}
      <div
        className="relative h-[400px] md:h-[500px] group"
        onMouseEnter={stop}
        onMouseLeave={start}
      >
        {/* Slides */}
        {slides.map((s, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-700 ${
              active === idx ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            {/* Gambar */}
            <img
              src={s.img}
              alt={s.title}
              className="w-full h-full object-cover"
            />

            {/* Overlay hitam + gradasi brand */}
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/70 to-accent/70 mix-blend-multiply" />

            {/* Konten */}
            <div className="absolute inset-0 flex items-center">
              <div className="container mx-auto px-4">
                <div className="max-w-2xl text-white">
                  <h1 className="text-4xl md:text-6xl font-bold mb-4">
                    {s.title}
                  </h1>
                  <p className="text-lg md:text-xl mb-8 text-white/90">
                    {s.desc}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Button
                      size="lg"
                      variant="default"
                      className="gap-2 font-semibold"
                    >
                      Mulai Belanja
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      Jadi Penjual
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Controls */}
        <button
          aria-label="Sebelumnya"
          onClick={prev}
          className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/40 text-white opacity-0 group-hover:opacity-100 transition"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <button
          aria-label="Berikutnya"
          onClick={next}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/40 text-white opacity-0 group-hover:opacity-100 transition"
        >
          <ArrowRight className="h-5 w-5" />
        </button>

        {/* Indicators */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Slide ${i + 1}`}
              className={`h-2 w-2 rounded-full transition ${
                active === i ? "bg-white" : "bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Features (tetap seperti semula) */}
      <div className="container mx-auto px-4 -mt-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl p-6 shadow-card border">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Jutaan Produk</h3>
                <p className="text-sm text-muted-foreground">
                  Pilihan lengkap dari berbagai kategori
                </p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-6 shadow-card border">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-accent/10">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Harga Terbaik</h3>
                <p className="text-sm text-muted-foreground">
                  Promo dan diskon setiap hari
                </p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-6 shadow-card border">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-destructive/10">
                <Shield className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Aman & Terpercaya</h3>
                <p className="text-sm text-muted-foreground">
                  Garansi 100% uang kembali
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
