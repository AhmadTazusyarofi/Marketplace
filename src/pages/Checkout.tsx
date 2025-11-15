import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/* ================= BACKEND (KOMENTAR) =================
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
======================================================= */

type CheckoutItem = {
  id: string;
  quantity: number;
  name: string;
  price: number;
  image: string;
  store: string;
};

export default function Checkout() {
  const navigate = useNavigate();

  /* ================= BACKEND (KOMENTAR) =================
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchCartForCheckout();

    async function fetchCartForCheckout() {
      try {
        // ...ambil keranjang user dari supabase
        setCartItems(data || []);
      } catch (err) {
        toast.error("Failed to load cart");
      } finally {
        setLoading(false);
      }
    }
  }, [user, navigate]);
  ======================================================= */

  // ===== UI-ONLY (sinkron dengan Cart.tsx dummy) =====
  const items: CheckoutItem[] = [
    {
      id: "p-iphone",
      quantity: 1,
      name: "Iphone 17 Pro Max I-box 128GB",
      price: 20999000,
      image:
        "https://images.unsplash.com/photo-1757709608566-4b9fd41a7af5?auto=format&fit=crop&q=60&w=600",
      store: "AhmadCorp Official Store",
    },
    {
      id: "p-headphone",
      quantity: 2,
      name: "Headphone Wireless Noise Cancelling",
      price: 549000,
      image:
        "https://images.unsplash.com/photo-1676315636995-a5d5df17b192?auto=format&fit=crop&q=60&w=600",
      store: "AhmadCorp Tech",
    },
  ];

  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const totalPrice = useMemo(
    () => items.reduce((s, it) => s + it.price * it.quantity, 0),
    [items]
  );

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingAddress || !shippingPhone) return;

    /* ================= BACKEND (KOMENTAR) =================
    setSubmitting(true);
    try {
      // 1) kelompokkan item per toko
      // 2) create order per store
      // 3) create order_items
      // 4) hapus dari carts
      toast.success("Order placed successfully!");
      navigate("/my-orders");
    } catch (err) {
      console.error("Error creating order:", err);
      toast.error("Failed to place order");
    } finally {
      setSubmitting(false);
    }
    return;
    ======================================================= */

    // UI-only:
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      navigate("/my-orders");
    }, 800);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <form onSubmit={placeOrder}>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Shipping Information</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="address">Shipping Address</Label>
                    <Textarea
                      id="address"
                      placeholder="Enter your full address"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      required
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="e.g., 081234567890"
                      value={shippingPhone}
                      onChange={(e) => setShippingPhone(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">Order Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any special instructions?"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Order Items</h2>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 pb-3 border-b last:border-0"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.store}
                        </p>
                        <p className="text-sm">
                          {item.quantity} x Rp{" "}
                          {item.price.toLocaleString("id-ID")}
                        </p>
                      </div>
                      <p className="font-bold text-primary">
                        Rp{" "}
                        {(item.price * item.quantity).toLocaleString("id-ID")}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <div>
              <Card className="p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>Rp {totalPrice.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total</span>
                    <span className="text-primary">
                      Rp {totalPrice.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={submitting}
                >
                  {submitting ? "Placing Order..." : "Place Order"}
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-4">
                  By placing order, you agree to our terms and conditions
                </p>
              </Card>
            </div>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}
