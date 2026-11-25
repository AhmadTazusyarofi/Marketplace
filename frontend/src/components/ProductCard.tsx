import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MapPin, Star } from "lucide-react";
import { Link } from "react-router-dom";

const API_BASE_RAW = import.meta.env.VITE_API_URL || "";
const API_BASE = API_BASE_RAW.replace(/^"|"$/g, "").replace(/\/$/, "");

function resolveImageSrc(url: string) {
  if (!url) return url;
  if (url.startsWith("/")) return `${API_BASE}${url}`;
  if (url.startsWith("uploads/")) return `${API_BASE}/${url}`;
  return url;
}

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string; // gambar utama
  images?: string[]; // thumbnails (opsional)
  rating?: number;
  sold: number;
  location: string;
  discount?: number;
  description?: string; // ⬅️ deskripsi (opsional)
}

export const ProductCard = ({
  id,
  name,
  price,
  originalPrice,
  image,
  images,
  rating,
  sold,
  location,
  discount,
  description,
}: ProductCardProps) => {
  return (
    <Link
      to={`/product/${id}`}
      state={{
        product: {
          id,
          name,
          price,
          originalPrice,
          image,
          images: images && images.length ? images : [image],
          ...(rating != null ? { rating } : {}),
          sold,
          location,
          description: description ?? "",
        },
      }}
    >
      <Card className="group overflow-hidden hover:shadow-elevated transition-all duration-300 cursor-pointer border">
        <div className="relative aspect-square overflow-hidden bg-secondary">
          <img
            src={resolveImageSrc(image)}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {discount && (
            <Badge className="absolute top-2 left-2 bg-destructive">
              {discount}% OFF
            </Badge>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-medium line-clamp-2 mb-2 text-sm min-h-[40px]">
            {name}
          </h3>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-lg font-bold text-primary">
              Rp {price.toLocaleString("id-ID")}
            </span>
            {originalPrice && (
              <span className="text-xs text-muted-foreground line-through">
                Rp {originalPrice.toLocaleString("id-ID")}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
            {rating != null && (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <span>{rating}</span>
              </div>
            )}
            <span>Terjual {sold}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>{location}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
};
