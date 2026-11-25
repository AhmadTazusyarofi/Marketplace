import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Package,
  ShoppingCart,
  Store,
  TrendingUp,
  Plus,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SellerLayout } from "@/components/seller/SellerLayout";
import { apiFetch } from "@/lib/apiClient";
import type { SellerProduct } from "@/types/product";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SellerOrder {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  buyer: {
    fullName: string;
  };
  items: Array<{
    quantity: number;
    price: number;
    product: { name: string };
  }>;
}

interface OrdersResponse {
  orders: SellerOrder[];
}

// ─── Status badge color map ───────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  pending: { label: "Menunggu", variant: "secondary" },
  confirmed: { label: "Dikonfirmasi", variant: "default" },
  shipped: { label: "Dikirim", variant: "default" },
  delivered: { label: "Selesai", variant: "default" },
  cancelled: { label: "Dibatalkan", variant: "destructive" },
};

function getStatus(status: string) {
  return STATUS_CONFIG[status] ?? { label: status, variant: "outline" };
}

// ─── Format helpers ───────────────────────────────────────────────────────────

function formatRp(n: number) {
  return `Rp ${n.toLocaleString("id-ID")}`;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  loading: boolean;
}

function StatCard({ title, value, icon: Icon, loading }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Halaman utama ────────────────────────────────────────────────────────────

export default function SellerDashboard() {
  const navigate = useNavigate();

  const {
    data: products = [],
    isLoading: loadingProducts,
  } = useQuery({
    queryKey: ["seller", "products"],
    queryFn: () =>
      apiFetch<{ products: SellerProduct[] }>("/api/products/mine").then(
        (r) => r.products,
      ),
  });

  const {
    data: ordersData,
    isLoading: loadingOrders,
  } = useQuery({
    queryKey: ["seller", "orders"],
    queryFn: () =>
      apiFetch<OrdersResponse>("/api/orders/seller"),
  });

  const orders = ordersData?.orders ?? [];

  // Hitung statistik
  const totalRevenue = orders.reduce(
    (sum, o) => sum + Number(o.totalAmount),
    0,
  );
  const activeProducts = products.filter((p) => p.isActive).length;

  const isLoading = loadingProducts || loadingOrders;
  const recentOrders = orders.slice(0, 5);

  return (
    <SellerLayout title="Dashboard">
      {/* ── Stat Cards ──────────────────────────────────────────────────── */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Produk"
          value={products.length}
          icon={Package}
          loading={loadingProducts}
        />
        <StatCard
          title="Produk Aktif"
          value={activeProducts}
          icon={Store}
          loading={loadingProducts}
        />
        <StatCard
          title="Total Pesanan"
          value={orders.length}
          icon={ShoppingCart}
          loading={loadingOrders}
        />
        <StatCard
          title="Total Pendapatan"
          value={formatRp(totalRevenue)}
          icon={TrendingUp}
          loading={loadingOrders}
        />
      </div>

      {/* ── Quick actions ────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Button
          onClick={() => navigate("/dashboard/products/new")}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Tambah Produk
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate("/dashboard/products")}
          className="gap-2"
        >
          <Package className="h-4 w-4" />
          Kelola Produk
          <ArrowRight className="h-3 w-3" />
        </Button>
      </div>

      {/* ── Pesanan terbaru ──────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Pesanan Terbaru</CardTitle>
          {orders.length > 5 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard/orders")}
              className="gap-1"
            >
              Lihat semua
              <ArrowRight className="h-3 w-3" />
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <ShoppingCart className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>Belum ada pesanan masuk</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => {
                const { label, variant } = getStatus(order.status);
                return (
                  <div
                    key={order.id}
                    className="flex justify-between items-center p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold truncate">
                        {order.buyer?.fullName ?? "Pembeli"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString(
                          "id-ID",
                          { day: "numeric", month: "short", year: "numeric" },
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge variant={variant}>{label}</Badge>
                      <p className="font-bold text-primary">
                        {formatRp(Number(order.totalAmount))}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </SellerLayout>
  );
}
