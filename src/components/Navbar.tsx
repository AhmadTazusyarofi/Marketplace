import { Link, useNavigate } from "react-router-dom";
import { User, Heart, Store, ShoppingCart, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
// import { useAuth } from "@/contexts/AuthContext"; // <-- backend nanti aja
// import CartDrawer from "@/components/CartDrawer"; // <-- tidak dipakai (drawer)
import SearchAutosuggest from "@/components/SearchAutosuggest";
import { demoProducts } from "@/data/demoProducts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import logo from "@/assets/logo.png";

export const Navbar = () => {
  // const { user, signOut } = useAuth(); // <-- TIDAK dipakai dulu
  const navigate = useNavigate();

  const cartCount = 2; // demo

  return (
    <nav className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <img
              src={logo}
              alt="AhmadCorp"
              className="h-12 w-12 object-contain"
            />
            <span className="hidden sm:inline bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-orange-600">
              AhmadCorp
            </span>
          </Link>

          {/* Search (desktop) */}
          <div className="hidden md:flex flex-1 max-w-2xl">
            <SearchAutosuggest products={demoProducts} />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:flex"
              type="button"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
            </Button>

            {/* Keranjang -> NAVIGATE ke /cart */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => navigate("/cart")}
              type="button"
              aria-label="Keranjang"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                {cartCount}
              </span>
            </Button>

            {/* DROPDOWN AKUN — SELALU TAMPIL (tanpa cek login) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="gap-2" type="button" aria-label="Akun">
                  <User className="h-4 w-4" />
                  {/* di mobile: ikon saja; di desktop: ada teks */}
                  <span className="hidden sm:inline">Akun</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="z-[70] w-56"
              >
                <DropdownMenuLabel>Akun</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/my-orders">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    <span>Pesanan Saya</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/dashboard">
                    <Store className="mr-2 h-4 w-4" />
                    <span>Dashboard Penjual</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                {/* Auth actions (UI only) */}
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/auth">
                    <User className="mr-2 h-4 w-4" />
                    <span>Masuk / Daftar</span>
                  </Link>
                </DropdownMenuItem>

                {/* Keluar: disable dulu (belum ada backend) */}
                <DropdownMenuItem disabled className="opacity-70">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Keluar (nanti)</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Search (mobile) */}
        <div className="md:hidden pb-3">
          <SearchAutosuggest
            products={demoProducts}
            placeholder="Cari produk..."
          />
        </div>
      </div>

      {/* Drawer Keranjang (tidak dipakai; nanti jika ingin kembali ke drawer tinggal aktifkan) */}
      {/* <CartDrawer open={cartOpen} onOpenChange={setCartOpen} /> */}
    </nav>
  );
};

export default Navbar;
