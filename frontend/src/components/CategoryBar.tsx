import {
  Smartphone,
  Shirt,
  Home,
  Zap,
  BookOpen,
  Dumbbell,
  Gift,
  MoreHorizontal,
  Hammer,
  Lightbulb,
  Brush,
  Droplet,
  Sparkles,
  Gem,
  Watch,
  Camera,
  Gamepad2,
  PawPrint,
  Puzzle,
  MoonStar,
  Utensils,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// === Kategori utama ===
const primaryCategories = [
  { icon: Smartphone, label: "Elektronik" },
  { icon: Shirt, label: "Fashion" },
  { icon: Sparkles, label: "Perawatan Pribadi" },
  { icon: Zap, label: "Otomotif" },
  { icon: BookOpen, label: "Buku & Alat Tulis" },
  { icon: Dumbbell, label: "Sepatu & Sandal" },
  { icon: Watch, label: "Jam Tangan" },
  { icon: MoreHorizontal, label: "Lainnya" },
];

// === Semua kategori ===
const allCategories = [
  { icon: Home, label: "Alat Rumah Tangga" },
  { icon: Brush, label: "Kecantikan" },
  { icon: Camera, label: "Kamera & Fotografi" },
  { icon: Puzzle, label: "Mainan & Edukasi Anak" },
  { icon: MoonStar, label: "Fashion Muslim & Ibadah" },
];

const primaryLabels = new Set(primaryCategories.map((c) => c.label));
const otherCategories = allCategories.filter(
  (c) => !primaryLabels.has(c.label)
);

export const CategoryBar = () => {
  return (
    <div className="border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="py-3">
          {/* scroller kecil, wrap besar */}
          <div
            className="
              -mx-4 px-4
              flex gap-2
              overflow-x-auto scrollbar-hide
              flex-nowrap
              lg:mx-0 lg:px-0
              lg:overflow-visible lg:flex-wrap lg:justify-center
            "
          >
            {/* primary (kecuali Lainnya) */}
            {primaryCategories
              .filter((c) => c.label !== "Lainnya")
              .map((category) => (
                <Button
                  key={category.label}
                  variant="ghost"
                  className="shrink-0 gap-2 dark:hover:bg-orange-600 hover:bg-orange-600 hover:text-black dark:hover:text-white transition-colors"
                >
                  <category.icon className="h-4 w-4" />
                  <span className="text-sm">{category.label}</span>
                </Button>
              ))}

            {/* dropdown Lainnya */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="shrink-0 gap-2 dark:hover:bg-orange-600 hover:bg-orange-600 hover:text-black dark:hover:text-white transition-colors"
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="text-sm">Lainnya</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-64"
                sideOffset={6}
              >
                <DropdownMenuLabel>Kategori Lainnya</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="grid grid-cols-1 gap-1">
                  {otherCategories.map((c) => (
                    <DropdownMenuItem
                      key={c.label}
                      className="gap-2 cursor-pointer
                                 data-[highlighted]:bg-orange-600 data-[highlighted]:text-white
                                 focus:bg-orange-600 focus:text-white"
                    >
                      <c.icon className="h-4 w-4" />
                      <span>{c.label}</span>
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
};
