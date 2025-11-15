// src/pages/SellerDashboard.tsx
import { useEffect, useState } from "react";
// ❌ Matikan sementara integrasi backend saat fokus ke UI
// import { supabase } from "@/integrations/supabase/client";
// import { useAuth } from "@/contexts/AuthContext";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Package, ShoppingCart, Store, DollarSign } from "lucide-react";
// import { toast } from "sonner";

interface StoreData {
  id: string;
  name: string;
  description: string | null;
}

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
}

interface Order {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  profiles: {
    full_name: string;
  };
}

export default function SellerDashboard() {
  // const { user } = useAuth();
  // const navigate = useNavigate();

  const [store, setStore] = useState<StoreData | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ❌ Saat backend aktif:
    // if (!user) {
    //   navigate("/auth");
    //   return;
    // }
    // fetchDashboardData();

    // ✅ UI-only: simulasi loading dan isi data dummy
    const t = setTimeout(() => {
      // Jika ingin simulasi "tidak punya toko", setStore(null)
      setStore({
        id: "demo-store-1",
        name: "AhmadCorp Official Store",
        description: "Toko demo untuk Seller Dashboard",
      });

      setStats({
        totalProducts: 42,
        totalOrders: 8,
        totalRevenue: 12500000,
      });

      setRecentOrders([
        {
          id: "ORD-001",
          total_amount: 2990000,
          status: "pending",
          created_at: new Date().toISOString(),
          profiles: { full_name: "Budi Santoso" },
        },
        {
          id: "ORD-002",
          total_amount: 549000,
          status: "delivered",
          created_at: new Date(Date.now() - 86400000).toISOString(),
          profiles: { full_name: "Siti Aisyah" },
        },
        {
          id: "ORD-003",
          total_amount: 899000,
          status: "confirmed",
          created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
          profiles: { full_name: "Andi Saputra" },
        },
      ]);

      setLoading(false);
    }, 500);
    return () => clearTimeout(t);
  }, []);

  // ---------- Backend versi asli (dinonaktifkan) ----------
  // const fetchDashboardData = async () => {
  //   try {
  //     // cek role seller
  //     const { data: roles } = await supabase
  //       .from("user_roles")
  //       .select("role")
  //       .eq("user_id", user?.id)
  //       .eq("role", "seller")
  //       .single();
  //     if (!roles) {
  //       toast.error("You need to be a seller to access this page");
  //       navigate("/");
  //       return;
  //     }
  //
  //     // ambil store
  //     const { data: storeData, error: storeError } = await supabase
  //       .from("stores")
  //       .select("id, name, description")
  //       .eq("owner_id", user?.id)
  //       .single();
  //     if (storeError) {
  //       if (storeError.code === "PGRST116") {
  //         toast.error("Please create your store first");
  //         setLoading(false);
  //         return;
  //       }
  //       throw storeError;
  //     }
  //     setStore(storeData);
  //
  //     // hitung produk
  //     const { count: productsCount } = await supabase
  //       .from("products")
  //       .select("*", { count: "exact", head: true })
  //       .eq("store_id", storeData.id);
  //
  //     // orders
  //     const { data: ordersData, error: ordersError } = await supabase
  //       .from("orders")
  //       .select(`id, total_amount, status, created_at, buyer_id`)
  //       .eq("store_id", storeData.id)
  //       .order("created_at", { ascending: false })
  //       .limit(5);
  //     if (ordersError) throw ordersError;
  //
  //     const ordersWithProfiles = await Promise.all(
  //       (ordersData || []).map(async (order) => {
  //         const { data: profile } = await supabase
  //           .from("profiles")
  //           .select("full_name")
  //           .eq("id", order.buyer_id)
  //           .single();
  //         return { ...order, profiles: profile || { full_name: "Unknown" } };
  //       })
  //     );
  //
  //     const totalRevenue =
  //       ordersWithProfiles?.reduce(
  //         (sum, order) => sum + Number(order.total_amount),
  //         0
  //       ) || 0;
  //
  //     setStats({
  //       totalProducts: productsCount || 0,
  //       totalOrders: ordersWithProfiles?.length || 0,
  //       totalRevenue,
  //     });
  //
  //     setRecentOrders(ordersWithProfiles || []);
  //   } catch (error) {
  //     console.error("Error fetching dashboard data:", error);
  //     toast.error("Failed to load dashboard data");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!store) {
    // UI-only saat user belum punya toko
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Card className="p-12 text-center">
            <Store className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">No Store Found</h2>
            <p className="text-muted-foreground mb-6">
              You need to create a store before you can start selling
            </p>
            <Button
              type="button"
              // onClick={() => navigate("/create-store")} // nanti saat backend siap
            >
              Create Store
            </Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Seller Dashboard</h1>
          <p className="text-muted-foreground">{store.name}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Products
              </CardTitle>
              <Package className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Orders
              </CardTitle>
              <ShoppingCart className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                Rp {stats.totalRevenue.toLocaleString("id-ID")}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No orders yet
              </p>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex justify-between items-center p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-semibold">
                        {order.profiles.full_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <Badge
                        variant={
                          order.status === "delivered" ? "default" : "secondary"
                        }
                        className="capitalize"
                      >
                        {order.status}
                      </Badge>
                      <p className="font-bold text-primary">
                        Rp {Number(order.total_amount).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
