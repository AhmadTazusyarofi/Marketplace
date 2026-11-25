import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/apiClient";
import { Package, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type OrderItem = {
  quantity: number;
  price: number;
  products: {
    name: string;
    images: string[];
  } | null;
};

type Order = {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  stores?: {
    name: string;
  };
  order_items: OrderItem[];
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500",
  paid: "bg-blue-500",
  processing: "bg-purple-500",
  shipped: "bg-indigo-500",
  completed: "bg-green-500",
  cancelled: "bg-red-500",
};

export function MyOrdersContent() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await apiFetch<{ orders: Order[] }>("/api/orders");
        setOrders(res.orders || []);
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast.error("Gagal memuat pesanan");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="py-8">
        <p className="text-center text-muted-foreground">Memuat pesanan...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pesanan Saya</h1>
          <p className="text-muted-foreground">
            Lihat status pesanan dan detail pembelian Anda.
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <Card className="p-12 text-center">
          <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-xl text-muted-foreground mb-4">
            Belum ada Data Pesanan
          </p>
          <p className="text-sm text-muted-foreground">
            Mulai belanja untuk melihat pesanan Anda di sini
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const storeName = order.stores?.name || "Unknown Store";

            return (
              <Card key={order.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Package className="w-4 h-4 text-muted-foreground" />
                      <span className="font-semibold">{storeName}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Order ID: {order.id}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <Badge
                    className={`${statusColors[order.status] || "bg-gray-500"} text-white capitalize`}
                  >
                    {order.status}
                  </Badge>
                </div>

                <div className="space-y-3 mb-4">
                  {order.order_items.map((item, idx) => (
                    <div key={idx} className="flex gap-3">
                      <img
                        src={
                          item.products?.images?.[0] ||
                          "https://via.placeholder.com/64"
                        }
                        alt={item.products?.name || "Product"}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium">
                          {item.products?.name || "Unknown Product"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} x Rp{" "}
                          {item.price.toLocaleString("id-ID")}
                        </p>
                      </div>
                      <p className="font-semibold">
                        Rp{" "}
                        {(item.price * item.quantity).toLocaleString("id-ID")}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="font-semibold">Total</span>
                  <span className="text-lg font-bold text-primary">
                    Rp {order.total_amount.toLocaleString("id-ID")}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function MyOrders() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <MyOrdersContent />
      </main>
      <Footer />
    </div>
  );
}
