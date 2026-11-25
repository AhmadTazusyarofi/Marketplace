import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/apiClient";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

/* ================= BACKEND (KOMENTAR) =================
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
======================================================= */

type CartItem = {
  id: string;
  quantity: number;
  products: {
    id: string;
    name: string;
    price: number;
    images: string[];
    stock: number;
    stores: { name: string };
  };
};

export default function Cart() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    let mounted = true;
    setLoading(true);
    apiFetch<{ items: CartItem[] }>("/api/cart")
      .then((res) => {
        if (mounted) setCartItems(res.items || []);
      })
      .catch((err) => {
        console.error("Error fetching cart:", err);
        toast.error("Failed to load cart");
        if (mounted) setCartItems([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [user, navigate]);

  const updateQuantity = (cartId: string, newQty: number, stock: number) => {
    if (newQty < 1 || newQty > stock) return;

    apiFetch(`/api/cart/${cartId}`, {
      method: "PATCH",
      body: JSON.stringify({ quantity: newQty }),
    })
      .then(() => {
        setCartItems((prev) =>
          prev.map((c) => (c.id === cartId ? { ...c, quantity: newQty } : c)),
        );
      })
      .catch((err) => {
        console.error("Error updating quantity:", err);
        toast.error("Failed to update quantity");
      });
  };

  const removeItem = (cartId: string) => {
    apiFetch(`/api/cart/${cartId}`, { method: "DELETE" })
      .then(() => {
        toast.success("Item removed from cart");
        setCartItems((prev) => prev.filter((c) => c.id !== cartId));
      })
      .catch((err) => {
        console.error("Error removing item:", err);
        toast.error("Failed to remove item");
      });
  };

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.products.price * item.quantity,
    0,
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">Loading cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <Card className="p-12 text-center">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-xl text-muted-foreground mb-4">
              Your cart is empty
            </p>
            <Button onClick={() => navigate("/")}>Continue Shopping</Button>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="flex gap-4">
                    <img
                      src={item.products.images[0]}
                      alt={item.products.name}
                      className="w-24 h-24 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.products.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {item.products.stores.name}
                      </p>
                      <p className="text-primary font-bold mt-2">
                        Rp {item.products.price.toLocaleString("id-ID")}
                      </p>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              item.quantity - 1,
                              item.products.stock,
                            )
                          }
                          aria-label="Kurangi"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-12 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              item.quantity + 1,
                              item.products.stock,
                            )
                          }
                          aria-label="Tambah"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div>
              <Card className="p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span>Subtotal ({cartItems.length} items)</span>
                    <span>Rp {totalPrice.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total</span>
                    <span className="text-primary">
                      Rp {totalPrice.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => navigate("/checkout")}
                >
                  Proceed to Checkout
                </Button>
              </Card>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
