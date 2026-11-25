import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, Eye, EyeOff, Search, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { SellerLayout } from "@/components/seller/SellerLayout";
import { resolveImageUrl } from "@/lib/apiClient";
import {
  useSellerProducts,
  useDeleteProduct,
  useToggleProductStatus,
} from "@/hooks/useProducts";
import type { SellerProduct } from "@/types/product";

// ─── Format Rupiah ────────────────────────────────────────────────────────────

function formatRp(n: number) {
  return `Rp ${n.toLocaleString("id-ID")}`;
}

// ─── Baris loading skeleton ───────────────────────────────────────────────────

function LoadingRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <Skeleton className="w-12 h-12 rounded-md" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-40" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-6 w-10 rounded-full" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-8 w-24" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

// ─── Baris produk ─────────────────────────────────────────────────────────────

interface ProductRowProps {
  product: SellerProduct;
}

function ProductRow({ product }: ProductRowProps) {
  const navigate = useNavigate();
  const deleteMutation = useDeleteProduct();
  const toggleMutation = useToggleProductStatus();

  const hasDiscount = !!product.originalPrice;
  const variantCount = product.variants?.length ?? 0;

  return (
    <TableRow className="group">
      {/* Gambar */}
      <TableCell>
        <img
          src={resolveImageUrl(product.image)}
          alt={product.name}
          className="w-12 h-12 object-cover rounded-md border"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://placehold.co/48x48?text=?";
          }}
        />
      </TableCell>

      {/* Nama + varian */}
      <TableCell>
        <p className="font-medium line-clamp-2 max-w-[220px]">{product.name}</p>
        {variantCount > 0 && (
          <span className="text-xs text-muted-foreground">
            {variantCount} varian
          </span>
        )}
      </TableCell>

      {/* Harga */}
      <TableCell>
        <div>
          <p className="font-semibold text-sm">{formatRp(product.price)}</p>
          {hasDiscount && (
            <p className="text-xs text-muted-foreground line-through">
              {formatRp(product.originalPrice!)}
            </p>
          )}
        </div>
      </TableCell>

      {/* Stok */}
      <TableCell>
        <Badge
          variant={product.stock <= 5 ? "destructive" : "secondary"}
          className="text-xs"
        >
          {product.stock}
        </Badge>
      </TableCell>

      {/* Terjual */}
      <TableCell className="text-sm text-muted-foreground">
        {product.sold.toLocaleString("id-ID")}
      </TableCell>

      {/* Status aktif */}
      <TableCell>
        <Switch
          checked={product.isActive}
          onCheckedChange={(checked) =>
            toggleMutation.mutate({ id: product.id, isActive: checked })
          }
          disabled={toggleMutation.isPending}
          aria-label="Toggle aktif"
        />
      </TableCell>

      {/* Aksi */}
      <TableCell>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() =>
              navigate(`/dashboard/products/${product.id}/edit`)
            }
            title="Edit produk"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                title="Hapus produk"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Hapus produk?</AlertDialogTitle>
                <AlertDialogDescription>
                  Produk <strong>{product.name}</strong> akan dihapus. Tindakan
                  ini tidak dapat dibatalkan.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive hover:bg-destructive/90"
                  onClick={() => deleteMutation.mutate(product.id)}
                >
                  Hapus
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  );
}

// ─── Halaman utama ────────────────────────────────────────────────────────────

export default function ProductList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { data: products = [], isLoading, error } = useSellerProducts();

  // Filter produk berdasarkan nama / deskripsi
  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()),
  );

  const activeCount = products.filter((p) => p.isActive).length;

  return (
    <SellerLayout title="Kelola Produk">
      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        {/* Stats ringkas */}
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>
            Total:{" "}
            <strong className="text-foreground">{products.length}</strong>
          </span>
          <span>
            Aktif:{" "}
            <strong className="text-foreground">{activeCount}</strong>
          </span>
          <span>
            Non-aktif:{" "}
            <strong className="text-foreground">
              {products.length - activeCount}
            </strong>
          </span>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama produk..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button
            onClick={() => navigate("/dashboard/products/new")}
            className="gap-2 shrink-0"
          >
            <Plus className="h-4 w-4" />
            Tambah Produk
          </Button>
        </div>
      </div>

      {/* ── Error state ──────────────────────────────────────────────────── */}
      {error && (
        <div className="text-sm text-destructive text-center py-8">
          Gagal memuat produk: {(error as Error).message}
        </div>
      )}

      {/* ── Empty state ──────────────────────────────────────────────────── */}
      {!isLoading && !error && products.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <Package className="h-16 w-16 text-muted-foreground/40" />
          <div>
            <p className="text-lg font-semibold">Belum ada produk</p>
            <p className="text-sm text-muted-foreground mt-1">
              Mulai tambahkan produk pertama Anda
            </p>
          </div>
          <Button
            onClick={() => navigate("/dashboard/products/new")}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Tambah Produk Pertama
          </Button>
        </div>
      )}

      {/* ── No search result ─────────────────────────────────────────────── */}
      {!isLoading && !error && products.length > 0 && filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          Tidak ada produk yang cocok dengan pencarian "
          <strong>{search}</strong>"
        </div>
      )}

      {/* ── Tabel ────────────────────────────────────────────────────────── */}
      {(isLoading || filtered.length > 0) && (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Foto</TableHead>
                <TableHead>Nama Produk</TableHead>
                <TableHead>Harga</TableHead>
                <TableHead className="w-20">Stok</TableHead>
                <TableHead className="w-20">Terjual</TableHead>
                <TableHead className="w-20">Aktif</TableHead>
                <TableHead className="w-24">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <LoadingRows />
              ) : (
                filtered.map((product) => (
                  <ProductRow key={product.id} product={product} />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </SellerLayout>
  );
}
