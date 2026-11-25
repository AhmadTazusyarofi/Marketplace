import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/apiClient";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

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
  const { user } = useAuth();

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

  const [items, setItems] = useState<CheckoutItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    let mounted = true;
    setLoading(true);
    apiFetch<{
      items: {
        id: string;
        quantity: number;
        products: {
          id: string;
          name: string;
          price: number;
          images: string[];
          stores: { name: string };
        };
      }[];
    }>("/api/cart")
      .then((res) => {
        if (!mounted) return;
        setItems(
          (res.items || []).map((c) => ({
            id: c.products.id,
            quantity: c.quantity,
            name: c.products.name,
            price: c.products.price,
            image: c.products.images?.[0] || "",
            store: c.products.stores.name,
          })),
        );
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load cart");
        if (mounted) setItems([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [user, navigate]);

  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const totalPrice = useMemo(
    () => items.reduce((s, it) => s + it.price * it.quantity, 0),
    [items],
  );

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingAddress || !shippingPhone) return;

    setSubmitting(true);
    try {
      await apiFetch("/api/checkout", {
        method: "POST",
        body: JSON.stringify({
          shippingAddress,
          shippingPhone,
          notes: notes || undefined,
        }),
      });
      toast.success("Order placed successfully!");
      navigate("/my-orders");
    } catch (err: unknown) {
      console.error("Error creating order:", err);
      const message =
        err instanceof Error ? err.message : "Failed to place order";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        {loading ? (
          <p className="text-center text-muted-foreground">Loading cart...</p>
        ) : (
          <form onSubmit={placeOrder}>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Card className="p-6">
                  <h2 className="text-xl font-bold mb-4">
                    Shipping Information
                  </h2>
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
        )}
      </main>
      <Footer />
    </div>
  );
}
