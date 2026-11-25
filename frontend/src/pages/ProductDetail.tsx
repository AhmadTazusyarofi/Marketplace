import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/apiClient";
import {
  Heart,
  MapPin,
  Minus,
  Plus,
  Share2,
  Shield,
  ShoppingCart,
  Store,
  Truck,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

const API_BASE_RAW = import.meta.env.VITE_API_URL || "";
const API_BASE = API_BASE_RAW.replace(/^"|"$/g, "").replace(/\/$/, "");

function resolveAssetUrl(url: string | null) {
  if (!url) return "";
  if (url.startsWith("/")) return `${API_BASE}${url}`;
  if (url.startsWith("uploads/")) return `${API_BASE}/${url}`;
  return url;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price: number | null;
  stock: number;
  images: string[];
  sold_count: number;
  view_count: number;
  category_id: string;
  store_id: string;
  stores: {
    id: string;
    name: string;
    location: string;
    logo_url: string | null;
  };
  categories: {
    name: string;
  } | null;
}

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const fetchProduct = useCallback(async () => {
    try {
      const res = await apiFetch<{ product: Product }>(`/api/products/${id}`);
      setProduct(res.product);
    } catch (error) {
      console.error("Error fetching product:", error);
      toast({
        variant: "destructive",
        title: "Produk tidak ditemukan",
        description: "Produk yang Anda cari tidak tersedia",
      });
      navigate("/");
    } finally {
      setLoading(false);
    }
  }, [id, navigate, toast]);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id, location.state, fetchProduct]);

  const handleAddToCart = async () => {
    if (!user) {
      toast({
        title: "Login diperlukan",
        description: "Silakan login untuk menambahkan ke keranjang",
      });
      navigate("/auth");
      return;
    }

    try {
      await apiFetch("/api/cart", {
        method: "POST",
        body: JSON.stringify({ productId: id, quantity }),
      });

      toast({
        title: "Berhasil ditambahkan!",
        description: "Produk telah ditambahkan ke keranjang",
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast({
        variant: "destructive",
        title: "Gagal menambahkan",
        description: "Terjadi kesalahan saat menambahkan ke keranjang",
      });
    }
  };

  const discount = product?.original_price
    ? Math.round(
        ((product.original_price - product.price) / product.original_price) *
          100,
      )
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-96 bg-secondary rounded-lg" />
            <div className="space-y-4">
              <div className="h-8 bg-secondary rounded w-3/4" />
              <div className="h-4 bg-secondary rounded w-1/2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Beranda</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">{product.categories?.name || "Kategori"}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="line-clamp-1 max-w-[200px] md:max-w-none">
                {product.name}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-xl overflow-hidden bg-secondary">
              <img
                src={
                  resolveAssetUrl(product.images[selectedImage]) ||
                  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"
                }
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {discount > 0 && (
                <Badge className="absolute top-4 left-4 bg-destructive text-lg px-3 py-1">
                  {discount}% OFF
                </Badge>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? "border-primary"
                        : "border-transparent hover:border-secondary"
                    }`}
                  >
                    <img
                      src={resolveAssetUrl(image)}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <span>Terjual {product.sold_count}</span>
                <Separator orientation="vertical" className="h-4" />
                <span>{product.view_count} dilihat</span>
              </div>
              {product.categories && (
                <Badge variant="secondary">{product.categories.name}</Badge>
              )}
            </div>

            {/* Price */}
            <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-primary">
                  Rp {product.price.toLocaleString("id-ID")}
                </span>
                {product.original_price && (
                  <span className="text-xl text-muted-foreground line-through">
                    Rp {product.original_price.toLocaleString("id-ID")}
                  </span>
                )}
              </div>
            </Card>

            {/* Store Info */}
            <Link to={`/store/${product.stores.id}`}>
              <Card className="p-4 hover:shadow-card transition-shadow cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                    {product.stores.logo_url ? (
                      <img
                        src={resolveAssetUrl(product.stores.logo_url)}
                        alt={product.stores.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Store className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{product.stores.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{product.stores.location}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>

            {/* Quantity & Actions */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Jumlah</label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border rounded-lg">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-16 text-center font-medium">
                      {quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setQuantity(Math.min(product.stock, quantity + 1))
                      }
                      disabled={quantity >= product.stock}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Stok: {product.stock}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" size="icon" className="flex-shrink-0">
                  <Heart className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="icon" className="flex-shrink-0">
                  <Share2 className="h-5 w-5" />
                </Button>
                <Button
                  className="flex-1 gap-2"
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {product.stock > 0 ? "Tambah ke Keranjang" : "Stok Habis"}
                </Button>
              </div>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                <Shield className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Garansi 100%</p>
                  <p className="text-xs text-muted-foreground">Uang kembali</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                <Truck className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-sm font-medium">Gratis Ongkir</p>
                  <p className="text-xs text-muted-foreground">
                    Min. belanja 50rb
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <Card className="mt-8 p-6">
          <h2 className="text-xl font-bold mb-4">Deskripsi Produk</h2>
          <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
            {product.description || "Tidak ada deskripsi tersedia."}
          </p>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;
