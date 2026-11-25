import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  ChevronLeft,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";

// ─── Navigasi sidebar — tambah item di sini tanpa ubah komponen ───────────────

const NAV_ITEMS = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    to: "/dashboard/products",
    label: "Produk",
    icon: Package,
    exact: false,
  },
  {
    to: "/dashboard/orders",
    label: "Pesanan",
    icon: ShoppingBag,
    exact: false,
  },
] as const;

interface SellerLayoutProps {
  children: React.ReactNode;
  /** Judul halaman yang tampil di area konten */
  title?: string;
}

export function SellerLayout({ children, title }: SellerLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Guard: hanya seller yang boleh akses
  useEffect(() => {
    if (!loading && (!user || !user.roles.includes("seller"))) {
      navigate("/auth", { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Memuat...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* ── Sidebar ─────────────────────────────────────────────────── */}
        <aside
          className={cn(
            "border-r bg-card flex flex-col transition-all duration-200 shrink-0",
            collapsed ? "w-14" : "w-56",
          )}
        >
          {/* Header sidebar */}
          <div className="flex items-center justify-between px-3 py-3 border-b h-12">
            {!collapsed && (
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Seller Panel
              </span>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 ml-auto"
              onClick={() => setCollapsed((c) => !c)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <Menu className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Nav links */}
          <nav className="flex-1 p-2 space-y-1">
            {NAV_ITEMS.map(({ to, label, icon: Icon, exact }) => (
              <NavLink
                key={to}
                to={to}
                end={exact}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )
                }
                title={collapsed ? label : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{label}</span>}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* ── Konten utama ─────────────────────────────────────────────── */}
        <main className="flex-1 min-w-0 overflow-auto p-6">
          {title && (
            <h1 className="text-2xl font-bold mb-6">{title}</h1>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
