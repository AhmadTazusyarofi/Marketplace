import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Minus, Plus, Trash2, ShoppingCart, Ticket } from "lucide-react";
import { Input } from "@/components/ui/input";

// Demo items (UI-only)
const initialItems = [
  {
    id: "1",
    name: "Iphone 17 Pro Max I-box 128GB",
    image:
      "https://images.unsplash.com/photo-1757709608566-4b9fd41a7af5?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDF8fHxlbnwwfHx8fHw%3D&auto=format&fit=crop&q=60&w=600",
    variant: "Biru, 128GB",
    qty: 1,
    price: 20999000,
  },
  {
    id: "2",
    name: "Headphone Wireless Noise Cancelling",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
    variant: "Hitam",
    qty: 1,
    price: 549000,
  },
  {
    id: "2",
    name: "Headphone Wireless Noise Cancelling",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
    variant: "Hitam",
    qty: 1,
    price: 549000,
  },
];

type CartDrawerProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
};

export default function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const [items, setItems] = useState(initialItems);
  const [voucher, setVoucher] = useState("");

  const subtotal = useMemo(
    () => items.reduce((s, i) => s + i.price * i.qty, 0),
    [items]
  );
  const shipping = 15000;
  const serviceFee = 3000;
  const discount = 0; // UI-only
  const total = subtotal + shipping + serviceFee - discount;

  const updateQty = (id: string, delta: number) => {
    setItems(
      (prev) =>
        prev
          .map((it) =>
            it.id === id ? { ...it, qty: Math.max(1, it.qty + delta) } : it
          )
          .filter(Boolean) as typeof prev
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Keranjang
          </SheetTitle>
        </SheetHeader>

        {/* Items */}
        <div className="mt-4 space-y-3 max-h-[55vh] overflow-auto pr-1">
          {items.length === 0 ? (
            <Card className="p-6 text-center text-muted-foreground">
              Keranjangmu kosong
            </Card>
          ) : (
            items.map((item) => (
              <Card key={item.id} className="p-3">
                <div className="flex gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-16 w-16 rounded-md object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium line-clamp-1">{item.name}</p>
                    {item.variant && (
                      <p className="text-xs text-muted-foreground">
                        {item.variant}
                      </p>
                    )}
                    <div className="mt-1 flex items-center justify-between">
                      <p className="font-semibold">
                        Rp {(item.price * item.qty).toLocaleString("id-ID")}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQty(item.id, -1)}
                          disabled={item.qty <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center">{item.qty}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQty(item.id, +1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Voucher */}
        <div className="mt-4">
          <div className="flex gap-2">
            <Input
              placeholder="Kode Voucher"
              value={voucher}
              onChange={(e) => setVoucher(e.target.value)}
            />
            <Button variant="secondary" className="gap-2">
              <Ticket className="h-4 w-4" />
              Terapkan
            </Button>
          </div>
        </div>

        {/* Ringkasan */}
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>Rp {subtotal.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Ongkir</span>
            <span>Rp {shipping.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Biaya Layanan</span>
            <span>Rp {serviceFee.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Diskon</span>
            <span>- Rp {discount.toLocaleString("id-ID")}</span>
          </div>
          <Separator className="my-2" />
          <div className="flex items-center justify-between">
            <span className="font-medium">Total</span>
            <span className="text-lg font-bold text-primary">
              Rp {total.toLocaleString("id-ID")}
            </span>
          </div>
        </div>

        <SheetFooter className="mt-4 grid grid-cols-1 gap-2">
          <Link to="/cart" onClick={() => onOpenChange(false)}>
            <Button variant="outline" className="w-full">
              Lihat Keranjang
            </Button>
          </Link>
          <Link to="/checkout" onClick={() => onOpenChange(false)}>
            <Button className="w-full">Lanjut ke Checkout</Button>
          </Link>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
