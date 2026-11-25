import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Heart, LogOut, ShoppingCart, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
// import CartDrawer from "@/components/CartDrawer"; // <-- tidak dipakai (drawer)
import SearchAutosuggest from "@/components/SearchAutosuggest";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { demoProducts } from "@/data/demoProducts";

import logo from "@/assets/logo.png";

export const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const apiBaseRaw = import.meta.env.VITE_API_URL || "";
  const apiBase = apiBaseRaw.replace(/^"|"$/g, "").replace(/\/$/, "");

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
              LapakIn
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

            {!user ? (
              <Button
                className="gap-2"
                type="button"
                aria-label="Masuk atau Daftar"
                onClick={() => navigate("/auth")}
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Masuk / Daftar</span>
              </Button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    type="button"
                    aria-label="Akun"
                  >
                    {user.avatarUrl ? (
                      <img
                        src={
                          user.avatarUrl.startsWith("/")
                            ? `${apiBase}${user.avatarUrl}`
                            : user.avatarUrl.startsWith("uploads/")
                              ? `${apiBase}/${user.avatarUrl}`
                              : user.avatarUrl
                        }
                        alt={user.fullName}
                        className="h-9 w-9 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={8}
                  className="z-[70] w-56"
                >
                  <DropdownMenuLabel>
                    {user.fullName}
                    <div className="text-xs font-normal text-muted-foreground">
                      {user.email}
                    </div>
                  </DropdownMenuLabel>
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

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    className="cursor-pointer"
                    onSelect={(e) => {
                      e.preventDefault();
                      void signOut().then(() => {
                        toast({
                          title: "Logout berhasil",
                          description: "Anda telah keluar dari akun.",
                        });
                      });
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
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
