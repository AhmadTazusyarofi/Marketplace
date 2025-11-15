import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, ShoppingBag } from "lucide-react";

/* ================= BACKEND (KOMENTAR) =================
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
======================================================= */

type OrderItem = {
  quantity: number;
  price: number;
  products: {
    name: string;
    images: string[];
  };
};

type Order = {
  id: string;
  total_amount: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  created_at: string;
  stores: { name: string };
  order_items: OrderItem[];
};

const statusColors: Record<Order["status"], string> = {
  pending: "bg-yellow-500",
  confirmed: "bg-blue-500",
  shipped: "bg-purple-500",
  delivered: "bg-green-500",
  cancelled: "bg-red-500",
};

export default function MyOrders() {
  /* ================= BACKEND (KOMENTAR) =================
  const { user } = useAuth();
  const navigate = useNavigate();
  ======================================================= */

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(
    () => {
      /* ================= BACKEND (KOMENTAR) =================
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchOrders();
    -------------------------------------------------------
    async function fetchOrders() {
      try {
        const { data, error } = await supabase
          .from("orders")
          .select(`
            id, total_amount, status, created_at,
            stores (name),
            order_items (
              quantity, price, products (name, images)
            )
          `)
          .eq("buyer_id", user?.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setOrders(data || []);
      } catch (err) {
        console.error("Error fetching orders:", err);
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    }
    ======================================================= */

      // ===== UI-ONLY (DUMMY) =====
      const t = setTimeout(() => {
        setOrders([
          {
            id: "ORD-2025-0001",
            total_amount: 26489000,
            status: "pending",
            created_at: new Date().toISOString(),
            stores: { name: "AhmadCorp Official Store" },
            order_items: [
              {
                quantity: 1,
                price: 20999000,
                products: {
                  name: "Iphone 17 Pro Max I-box 128GB",
                  images: [
                    "https://images.unsplash.com/photo-1757709608566-4b9fd41a7af5?auto=format&fit=crop&q=60&w=600",
                  ],
                },
              },
              {
                quantity: 1,
                price: 549000,
                products: {
                  name: "Headphone Wireless Noise Cancelling",
                  images: [
                    "https://images.unsplash.com/photo-1676315636995-a5d5df17b192?auto=format&fit=crop&q=60&w=600",
                  ],
                },
              },
              {
                quantity: 1,
                price: 4991000,
                products: {
                  name: "Monitor Gaming 27 inch 144Hz IPS HDR",
                  images: [
                    "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=60&w=600",
                  ],
                },
              },
            ],
          },
        ]);
        setLoading(false);
      }, 500);
      return () => clearTimeout(t);
    },
    /* BACKEND: [user, navigate] */ []
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <Card className="p-12 text-center">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-xl text-muted-foreground mb-4">No orders yet</p>
            <p className="text-sm text-muted-foreground">
              Start shopping to see your orders here
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Package className="w-4 h-4 text-muted-foreground" />
                      <span className="font-semibold">{order.stores.name}</span>
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
                    className={`${
                      statusColors[order.status]
                    } text-white capitalize`}
                  >
                    {order.status}
                  </Badge>
                </div>

                <div className="space-y-3 mb-4">
                  {order.order_items.map((item, idx) => (
                    <div key={idx} className="flex gap-3">
                      <img
                        src={item.products.images[0]}
                        alt={item.products.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{item.products.name}</p>
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
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
