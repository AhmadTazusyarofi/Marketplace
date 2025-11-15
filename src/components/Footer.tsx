import { Link } from "react-router-dom";
import { ShoppingBag, Facebook, Instagram, Twitter } from "lucide-react";
import logo from "@/assets/logo.png";

export const Footer = () => {
  return (
    <footer className="border-t bg-card mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <Link
              to="/"
              className="flex items-center gap-2 font-bold text-xl mb-4"
            >
              {/* ganti ShoppingBag jadi img */}
              <img
                src={logo}
                alt="MarketHub"
                className="h-12 w-12 object-contain"
              />
              <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-orange-600 ">
                AhmadCorp
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Platform marketplace terpercaya untuk belanja dan berjualan online
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Tentang AhmadCorp</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Tentang Kami
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Karir
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Kebijakan Privasi
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Jual Beli</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Cara Belanja
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Cara Jual
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Paket Berlangganan
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Pusat Edukasi Seller
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Bantuan & Panduan</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Pusat Bantuan
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Chat dengan Kami
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Syarat & Ketentuan
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Hubungi Kami
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t pt-8 text-center text-sm text-muted-foreground">
          <p>© 2024 AhmadCorp - Marketplace. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
