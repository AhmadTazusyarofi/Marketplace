import SplashScreen from "@/components/SplashScreen";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Index from "./pages/Index";
import MyOrders from "./pages/MyOrders";
import NotFound from "./pages/NotFound";
import ProductDetail from "./pages/ProductDetail";
import Profile from "./pages/Profile";
import SellerDashboard from "./pages/SellerDashboard";
import ProductList from "./pages/seller/ProductList";
import ProductForm from "./pages/seller/ProductForm";

const queryClient = new QueryClient();

const App = () => {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            {!splashDone && (
              <SplashScreen
                duration={1600}
                onDone={() => setSplashDone(true)}
              />
            )}

            <Routes>
              {/* ── Public ───────────────────────────────────────────── */}
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/my-orders" element={<MyOrders />} />

              {/* ── Seller ───────────────────────────────────────────── */}
              <Route path="/dashboard" element={<SellerDashboard />} />
              <Route path="/dashboard/products" element={<ProductList />} />
              <Route path="/dashboard/products/new" element={<ProductForm />} />
              <Route
                path="/dashboard/products/:id/edit"
                element={<ProductForm />}
              />

              {/* ── Fallback ─────────────────────────────────────────── */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
