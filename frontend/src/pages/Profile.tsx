// src/pages/Profile.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
// ❌ Nonaktifkan dulu integrasi backend saat pengerjaan UI
// import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/apiClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Camera,
  ChevronDown,
  CreditCard,
  DollarSign,
  LogOut,
  Mail,
  MapPin,
  Package,
  Phone,
  Plus,
  Shield,
  Store,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { MyOrdersContent } from "./MyOrders";

type IconType = React.ComponentType<{ className?: string }>;

interface Profile {
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  address?: string;
}

type Address = {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  addressLine: string;
  postalCode: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

type AddressListResponse = {
  defaultAddressId: string | null;
  addresses: Address[];
};

type AddressUpsertPayload = {
  label: string;
  recipientName: string;
  phone: string;
  addressLine: string;
  postalCode: string | null;
  note: string | null;
};

type SellerProductCard = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  sold: number;
  location: string;
  discount?: number;
  description?: string;
  stock: number;
  isActive: boolean;
  categoryId: string | null;
};

type SellerProductUpsertPayload = {
  name: string;
  description?: string;
  price: number;
  originalPrice?: number | null;
  stock?: number;
  isActive?: boolean;
  categoryId?: number | null;
};

type Category = {
  id: string;
  name: string;
  slug: string;
};

type SellerOrdersResponse = {
  orders: {
    id: string;
    total_amount: number;
    status: string;
    created_at: string;
    stores: { name: string };
    order_items: {
      quantity: number;
      price: number;
      products: { name: string; images: string[] };
    }[];
  }[];
};

export default function Profile() {
  const navigate = useNavigate();
  const { user, signOut, loading: authLoading, refreshUser } = useAuth();
  const queryClient = useQueryClient();
  const apiBaseRaw = import.meta.env.VITE_API_URL || "";
  const apiBase = apiBaseRaw.replace(/^"|"$/g, "").replace(/\/$/, "");

  const isSeller = Boolean(user?.roles?.includes("seller"));

  const [profile, setProfile] = useState<Profile>({
    full_name: "",
    phone: null,
    avatar_url: null,
    address: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const changePasswordMutation = useMutation({
    mutationFn: (payload: { currentPassword: string; newPassword: string }) =>
      apiFetch<void>("/api/users/me/password", {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      toast.success("Password berhasil diperbarui");
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof Error ? error.message : "Gagal memperbarui password",
      );
    },
  });

  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState<AddressUpsertPayload>({
    label: "Rumah",
    recipientName: "",
    phone: "",
    addressLine: "",
    postalCode: null,
    note: null,
  });

  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] =
    useState<SellerProductCard | null>(null);
  const [productForm, setProductForm] = useState<SellerProductUpsertPayload>({
    name: "",
    description: "",
    price: 0,
    originalPrice: null,
    stock: 0,
    isActive: true,
    categoryId: null,
  });

  const [flashSaleEnabled, setFlashSaleEnabled] = useState(false);

  const [productImages, setProductImages] = useState<File[]>([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);
  const productImagesInputRef = useRef<HTMLInputElement | null>(null);

  const addProductImages = (files: File[]) => {
    if (!files.length) return;
    setProductImages((prev) => {
      const next = [...prev];
      for (const f of files) {
        if (next.length >= 5) break;
        const exists = next.some(
          (x) =>
            x.name === f.name &&
            x.size === f.size &&
            x.lastModified === f.lastModified,
        );
        if (!exists) next.push(f);
      }
      return next;
    });
  };

  const productImagePreviewUrls = useMemo(() => {
    return productImages.map((f) => URL.createObjectURL(f));
  }, [productImages]);

  useEffect(() => {
    return () => {
      productImagePreviewUrls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [productImagePreviewUrls]);

  const createProductMutation = useMutation({
    mutationFn: (body: FormData) =>
      apiFetch<{ product: SellerProductCard }>("/api/products", {
        method: "POST",
        body,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["seller-products"] });
      toast.success("Produk berhasil ditambahkan");
      setProductDialogOpen(false);
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof Error ? error.message : "Gagal menambah produk",
      );
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: FormData }) =>
      apiFetch<{ product: SellerProductCard }>(`/api/products/${id}`, {
        method: "PATCH",
        body,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["seller-products"] });
      toast.success("Produk berhasil diperbarui");
      setProductDialogOpen(false);
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof Error ? error.message : "Gagal memperbarui produk",
      );
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch<void>(`/api/products/${id}`, {
        method: "DELETE",
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["seller-products"] });
      toast.success("Produk berhasil dihapus");
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof Error ? error.message : "Gagal menghapus produk",
      );
    },
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/auth");
      return;
    }

    setProfile({
      full_name: user.fullName || "Pengguna",
      phone: user.phone ?? null,
      avatar_url: user.avatarUrl ?? null,
      address: "Jl. Contoh No. 123, Jakarta Selatan", // Mock address
    });
    setLoading(false);
  }, [authLoading, user, navigate]);

  const addressesQuery = useQuery({
    queryKey: ["addresses"],
    enabled: Boolean(user),
    queryFn: () => apiFetch<AddressListResponse>("/api/addresses"),
  });

  const sellerProductsQuery = useQuery({
    queryKey: ["seller-products"],
    enabled: Boolean(user) && isSeller,
    queryFn: () =>
      apiFetch<{ products: SellerProductCard[] }>("/api/products/mine"),
  });

  const sellerOrdersQuery = useQuery({
    queryKey: ["seller-orders"],
    enabled: Boolean(user) && isSeller,
    queryFn: () => apiFetch<SellerOrdersResponse>("/api/orders/seller"),
  });

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: () => apiFetch<{ categories: Category[] }>("/api/categories"),
  });

  const createAddressMutation = useMutation({
    mutationFn: (payload: AddressUpsertPayload) =>
      apiFetch<{ address: Address }>("/api/addresses", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Alamat berhasil ditambahkan");
      setAddressDialogOpen(false);
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof Error ? error.message : "Gagal menambah alamat",
      );
    },
  });

  const updateAddressMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<AddressUpsertPayload>;
    }) =>
      apiFetch<{ address: Address }>(`/api/addresses/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Alamat berhasil diperbarui");
      setAddressDialogOpen(false);
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof Error ? error.message : "Gagal memperbarui alamat",
      );
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch<void>(`/api/addresses/${id}`, {
        method: "DELETE",
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Alamat berhasil dihapus");
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof Error ? error.message : "Gagal menghapus alamat",
      );
    },
  });

  const setDefaultAddressMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ defaultAddressId: string }>(
        `/api/addresses/${id}/set-default`,
        {
          method: "POST",
        },
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Alamat utama berhasil diubah");
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof Error ? error.message : "Gagal mengubah alamat utama",
      );
    },
  });

  const openCreateAddress = () => {
    setEditingAddress(null);
    setAddressForm({
      label: "Rumah",
      recipientName: "",
      phone: "",
      addressLine: "",
      postalCode: null,
      note: null,
    });
    setAddressDialogOpen(true);
  };

  const openCreateProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: "",
      description: "",
      price: 0,
      originalPrice: null,
      stock: 0,
      isActive: true,
      categoryId: null,
    });
    setFlashSaleEnabled(false);
    setProductImages([]);
    setPrimaryImageIndex(0);
    setProductDialogOpen(true);
  };

  const openEditProduct = (p: SellerProductCard) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name,
      description: p.description ?? "",
      price: p.price,
      originalPrice: p.originalPrice ?? null,
      stock: p.stock ?? 0,
      isActive: p.isActive ?? true,
      categoryId: p.categoryId ? Number(p.categoryId) : null,
    });
    setFlashSaleEnabled(p.originalPrice != null);
    setProductImages([]);
    setPrimaryImageIndex(0);
    setProductDialogOpen(true);
  };

  const submitProductForm = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: SellerProductUpsertPayload = {
      name: productForm.name.trim(),
      description: productForm.description?.trim() || undefined,
      price: Number(productForm.price),
      originalPrice:
        productForm.originalPrice === null ||
        productForm.originalPrice === undefined
          ? null
          : Number(productForm.originalPrice),
      stock:
        productForm.stock === undefined || productForm.stock === null
          ? undefined
          : Number(productForm.stock),
      isActive: productForm.isActive,
      categoryId:
        productForm.categoryId === undefined
          ? undefined
          : productForm.categoryId,
    };

    if (!payload.name) {
      toast.error("Nama produk wajib diisi");
      return;
    }
    if (!Number.isFinite(payload.price) || payload.price <= 0) {
      toast.error("Harga produk tidak valid");
      return;
    }

    if (
      !editingProduct &&
      (productImages.length < 3 || productImages.length > 5)
    ) {
      toast.error("Gambar produk minimal 3 dan maksimal 5");
      return;
    }
    if (
      productImages.length > 0 &&
      (productImages.length < 3 || productImages.length > 5)
    ) {
      toast.error("Jika mengganti gambar, minimal 3 dan maksimal 5");
      return;
    }
    if (productImages.length > 0 && primaryImageIndex >= productImages.length) {
      toast.error("Pilih gambar utama yang valid");
      return;
    }

    const fd = new FormData();
    fd.set("name", payload.name);
    if (payload.description !== undefined)
      fd.set("description", payload.description);
    fd.set("price", String(payload.price));
    if (payload.originalPrice !== undefined)
      fd.set(
        "originalPrice",
        payload.originalPrice === null ? "" : String(payload.originalPrice),
      );
    if (payload.stock !== undefined) fd.set("stock", String(payload.stock));
    if (payload.isActive !== undefined)
      fd.set("isActive", String(payload.isActive));
    if (payload.categoryId !== undefined)
      fd.set(
        "categoryId",
        payload.categoryId === null ? "" : String(payload.categoryId),
      );
    if (productImages.length > 0) {
      fd.set("primaryImageIndex", String(primaryImageIndex));
      productImages.forEach((f) => fd.append("images", f));
    }

    if (editingProduct) {
      await updateProductMutation.mutateAsync({
        id: editingProduct.id,
        body: fd,
      });
      return;
    }
    await createProductMutation.mutateAsync(fd);
  };

  const openEditAddress = (addr: Address) => {
    setEditingAddress(addr);
    setAddressForm({
      label: addr.label,
      recipientName: addr.recipientName,
      phone: addr.phone,
      addressLine: addr.addressLine,
      postalCode: addr.postalCode,
      note: addr.note,
    });
    setAddressDialogOpen(true);
  };

  const submitAddressForm = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: AddressUpsertPayload = {
      label: addressForm.label.trim() || "Rumah",
      recipientName: addressForm.recipientName.trim(),
      phone: addressForm.phone.trim(),
      addressLine: addressForm.addressLine.trim(),
      postalCode: addressForm.postalCode?.trim()
        ? addressForm.postalCode.trim()
        : null,
      note: addressForm.note?.trim() ? addressForm.note.trim() : null,
    };

    if (!payload.recipientName || !payload.phone || !payload.addressLine) {
      toast.error("Nama penerima, nomor telepon, dan alamat wajib diisi");
      return;
    }

    if (editingAddress) {
      await updateAddressMutation.mutateAsync({
        id: editingAddress.id,
        payload,
      });
      return;
    }

    await createAddressMutation.mutateAsync(payload);
  };

  const resolveAvatarSrc = (url: string | null) => {
    if (!url) return "";
    if (url.startsWith("/")) return `${apiBase}${url}`;
    if (url.startsWith("uploads/")) return `${apiBase}/${url}`;
    return url;
  };

  const uploadAvatar = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran gambar maksimal 2MB");
      return;
    }

    setAvatarUploading(true);
    try {
      const form = new FormData();
      form.append("avatar", file);

      const res = await apiFetch<{ avatarUrl: string }>(
        "/api/users/me/avatar",
        {
          method: "POST",
          body: form,
        },
      );

      setProfile((p) => ({ ...p, avatar_url: res.avatarUrl }));
      await refreshUser();
      toast.success("Foto profil berhasil diperbarui");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Gagal upload foto");
    } finally {
      setAvatarUploading(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        fullName: profile.full_name.trim(),
        phone: profile.phone?.trim() ? profile.phone.trim() : null,
      };

      await apiFetch("/api/users/me", {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      await refreshUser();
      toast.success("Profil berhasil diperbarui");
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Gagal menyimpan profil",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/auth");
      toast.success("Berhasil keluar");
    } catch (error) {
      toast.error("Gagal keluar");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12 flex justify-center">
          <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="h-12 w-12 bg-muted rounded-full"></div>
            <div className="h-4 w-48 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const SidebarItem = ({
    icon: Icon,
    label,
    value,
    onClick,
    variant = "default",
  }: {
    icon: IconType;
    label: string;
    value?: string;
    onClick?: () => void;
    variant?: "default" | "destructive";
  }) => (
    <button
      onClick={onClick || (() => value && setActiveTab(value))}
      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
        activeTab === value
          ? "bg-primary text-primary-foreground shadow-sm"
          : variant === "destructive"
            ? "text-destructive hover:bg-destructive/10"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );

  const getActiveTabLabel = () => {
    switch (activeTab) {
      case "profile":
        return "Profil Saya";
      case "orders":
        return "Pesanan Saya";
      case "address":
        return "Alamat";
      case "productManagement":
        return "Manajemen Produk";
      case "sales":
        return "Penjualan";
      case "payment":
        return "Metode Pembayaran";
      case "resetPassword":
        return "Reset Password";
      default:
        return "Menu";
    }
  };

  const selectTab = (tab: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">
          {/* Sidebar */}
          <aside className="w-full md:w-64 space-y-6">
            <div className="flex items-center gap-4 px-2">
              <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                <AvatarImage src={resolveAvatarSrc(profile.avatar_url)} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {profile.full_name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="overflow-hidden">
                <h2 className="font-semibold truncate">{profile.full_name}</h2>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            </div>

            {/* Mobile-only dropdown menu */}
            <div className="md:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen((v) => !v)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors bg-background hover:bg-muted"
              >
                <span className="truncate">{getActiveTabLabel()}</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    mobileMenuOpen ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>

              {mobileMenuOpen && (
                <nav className="mt-2 space-y-1">
                  <SidebarItem
                    icon={User}
                    label="Profil Saya"
                    value="profile"
                    onClick={() => selectTab("profile")}
                  />
                  <SidebarItem
                    icon={Package}
                    label="Pesanan Saya"
                    value="orders"
                    onClick={() => selectTab("orders")}
                  />
                  <SidebarItem
                    icon={MapPin}
                    label="Alamat"
                    value="address"
                    onClick={() => selectTab("address")}
                  />
                  {isSeller && (
                    <>
                      <SidebarItem
                        icon={Package}
                        label="Manajemen Produk"
                        value="productManagement"
                        onClick={() => selectTab("productManagement")}
                      />
                      <SidebarItem
                        icon={DollarSign}
                        label="Penjualan"
                        value="sales"
                        onClick={() => selectTab("sales")}
                      />
                    </>
                  )}
                  <SidebarItem
                    icon={CreditCard}
                    label="Metode Pembayaran"
                    value="payment"
                    onClick={() => selectTab("payment")}
                  />
                  <SidebarItem
                    icon={Shield}
                    label="Reset Password"
                    value="resetPassword"
                    onClick={() => selectTab("resetPassword")}
                  />
                  <Separator className="my-2" />
                  <SidebarItem
                    icon={LogOut}
                    label="Keluar"
                    variant="destructive"
                    onClick={handleLogout}
                  />
                </nav>
              )}
            </div>

            {/* Desktop sidebar menu (unchanged behavior) */}
            <nav className="hidden md:block space-y-1">
              <SidebarItem icon={User} label="Profil Saya" value="profile" />
              <SidebarItem icon={Package} label="Pesanan Saya" value="orders" />
              <SidebarItem icon={MapPin} label="Alamat" value="address" />
              {isSeller && (
                <>
                  <SidebarItem
                    icon={Package}
                    label="Manajemen Produk"
                    value="productManagement"
                  />
                  <SidebarItem
                    icon={DollarSign}
                    label="Penjualan"
                    value="sales"
                  />
                </>
              )}
              <SidebarItem
                icon={CreditCard}
                label="Metode Pembayaran"
                value="payment"
              />
              <SidebarItem
                icon={Shield}
                label="Reset Password"
                value="resetPassword"
              />
              <Separator className="my-2" />
              <SidebarItem
                icon={LogOut}
                label="Keluar"
                variant="destructive"
                onClick={handleLogout}
              />
            </nav>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">
                    Profil Saya
                  </h1>
                  <p className="text-muted-foreground">
                    Kelola informasi profil Anda untuk mengontrol, melindungi
                    dan mengamankan akun
                  </p>
                </div>

                <Card className="border-none shadow-md">
                  <CardHeader>
                    <CardTitle>Informasi Pribadi</CardTitle>
                    <CardDescription>
                      Perbarui foto dan detail pribadi Anda di sini.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-8">
                      {/* Avatar Upload Section */}
                      <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-muted/30 rounded-lg border border-dashed">
                        <div className="relative group cursor-pointer">
                          <Avatar className="h-24 w-24 border-4 border-background shadow-sm">
                            <AvatarImage
                              src={resolveAvatarSrc(profile.avatar_url)}
                            />
                            <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                              {profile.full_name?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        <div className="text-center sm:text-left space-y-1">
                          <h3 className="font-medium">Foto Profil</h3>
                          <p className="text-xs text-muted-foreground">
                            Format gambar: .jpg, .png, .jpeg. Maksimal ukuran
                            2MB.
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            disabled={avatarUploading}
                            onClick={() => avatarInputRef.current?.click()}
                          >
                            {avatarUploading ? "Mengunggah..." : "Ubah Foto"}
                          </Button>
                          <input
                            ref={avatarInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              void uploadAvatar(file);
                            }}
                          />
                        </div>
                      </div>

                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Nama Lengkap</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="fullName"
                              placeholder="Masukkan nama lengkap"
                              value={profile.full_name}
                              onChange={(e) =>
                                setProfile({
                                  ...profile,
                                  full_name: e.target.value,
                                })
                              }
                              className="pl-9"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="email"
                              value={user?.email || ""}
                              disabled
                              className="pl-9 bg-muted/50"
                            />
                          </div>
                          <p className="text-[10px] text-muted-foreground">
                            Email tidak dapat diubah setelah pendaftaran.
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone">Nomor Telepon</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="phone"
                              type="tel"
                              placeholder="08123456789"
                              value={profile.phone || ""}
                              onChange={(e) =>
                                setProfile({
                                  ...profile,
                                  phone: e.target.value,
                                })
                              }
                              className="pl-9"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="location">Lokasi Utama</Label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="location"
                              placeholder="Kota tempat tinggal"
                              value={profile.address || ""}
                              onChange={(e) =>
                                setProfile({
                                  ...profile,
                                  address: e.target.value,
                                })
                              }
                              className="pl-9"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end pt-4">
                        <Button
                          type="submit"
                          disabled={saving}
                          className="min-w-[120px]"
                        >
                          {saving ? "Menyimpan..." : "Simpan Perubahan"}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "orders" && <MyOrdersContent />}

            {activeTab === "productManagement" && isSeller && (
              <div className="space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                      Manajemen Produk
                    </h1>
                    <p className="text-muted-foreground">
                      Tambah, ubah, dan kelola produk toko Anda.
                    </p>
                  </div>
                  <Button onClick={openCreateProduct}>Tambah Produk</Button>
                </div>

                <Dialog
                  open={productDialogOpen}
                  onOpenChange={setProductDialogOpen}
                >
                  <DialogTrigger asChild>
                    <span />
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingProduct ? "Ubah Produk" : "Tambah Produk"}
                      </DialogTitle>
                      <DialogDescription>
                        Lengkapi informasi produk untuk ditampilkan di toko.
                      </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submitProductForm} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="productName">Nama Produk</Label>
                        <Input
                          id="productName"
                          value={productForm.name}
                          onChange={(e) =>
                            setProductForm((p) => ({
                              ...p,
                              name: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="productPrice">Harga</Label>
                        <Input
                          id="productPrice"
                          type="number"
                          min={0}
                          value={
                            productForm.price === undefined ||
                            productForm.price === null
                              ? ""
                              : String(productForm.price)
                          }
                          onChange={(e) =>
                            setProductForm((p) => ({
                              ...p,
                              price: e.target.value
                                ? Number(e.target.value)
                                : 0,
                            }))
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="productDescription">Deskripsi</Label>
                        <Textarea
                          id="productDescription"
                          value={productForm.description || ""}
                          onChange={(e) =>
                            setProductForm((p) => ({
                              ...p,
                              description: e.target.value,
                            }))
                          }
                          rows={4}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Kategori</Label>
                        <Select
                          value={
                            productForm.categoryId == null
                              ? ""
                              : String(productForm.categoryId)
                          }
                          onValueChange={(v) =>
                            setProductForm((p) => ({
                              ...p,
                              categoryId: v ? Number(v) : null,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih kategori" />
                          </SelectTrigger>
                          <SelectContent>
                            {(categoriesQuery.data?.categories ?? []).map(
                              (c) => (
                                <SelectItem key={c.id} value={c.id}>
                                  {c.name}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Gambar Produk</Label>
                        <input
                          ref={productImagesInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            const files = Array.from(e.target.files ?? []);
                            addProductImages(files);
                            e.currentTarget.value = "";
                          }}
                        />

                        <div className="text-xs text-muted-foreground">
                          {editingProduct
                            ? "Jika ingin mengganti gambar, pilih 3-5 gambar. Jika tidak, biarkan kosong."
                            : "Wajib 3-5 gambar."}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {productImages.map((f, idx) => (
                            <div
                              key={`${f.name}-${f.size}-${idx}`}
                              className="rounded-md border p-2 space-y-2"
                            >
                              <img
                                src={productImagePreviewUrls[idx]}
                                alt={f.name}
                                className="w-full aspect-square object-cover rounded"
                              />
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  id={`product-primary-${idx}`}
                                  checked={primaryImageIndex === idx}
                                  onCheckedChange={() =>
                                    setPrimaryImageIndex(idx)
                                  }
                                />
                                <Label htmlFor={`product-primary-${idx}`}>
                                  Utama
                                </Label>
                              </div>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="w-full"
                                onClick={() => {
                                  setProductImages((prev) =>
                                    prev.filter((_x, i) => i !== idx),
                                  );
                                  setPrimaryImageIndex((p) => {
                                    if (idx === p) return 0;
                                    if (p > idx) return p - 1;
                                    return p;
                                  });
                                }}
                              >
                                Hapus
                              </Button>
                            </div>
                          ))}

                          {productImages.length < 5 && (
                            <button
                              type="button"
                              className="rounded-md border border-dashed p-2 flex items-center justify-center aspect-square hover:bg-muted/40 transition"
                              onClick={() =>
                                productImagesInputRef.current?.click()
                              }
                            >
                              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                <Plus className="h-6 w-6" />
                                <div className="text-xs">Tambah</div>
                              </div>
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="productFlashSale"
                            checked={flashSaleEnabled}
                            onCheckedChange={(checked) => {
                              const next = Boolean(checked);
                              setFlashSaleEnabled(next);
                              if (!next) {
                                setProductForm((p) => ({
                                  ...p,
                                  originalPrice: null,
                                }));
                              }
                            }}
                          />
                          <Label htmlFor="productFlashSale">
                            Flash Sale (pakai harga coret)
                          </Label>
                        </div>

                        {flashSaleEnabled && (
                          <div className="space-y-2">
                            <Label htmlFor="productOriginalPrice">
                              Harga Coret
                            </Label>
                            <Input
                              id="productOriginalPrice"
                              type="number"
                              min={0}
                              value={
                                productForm.originalPrice === null ||
                                productForm.originalPrice === undefined
                                  ? ""
                                  : String(productForm.originalPrice)
                              }
                              onChange={(e) =>
                                setProductForm((p) => ({
                                  ...p,
                                  originalPrice: e.target.value
                                    ? Number(e.target.value)
                                    : null,
                                }))
                              }
                            />
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="productStock">Stok</Label>
                        <Input
                          id="productStock"
                          type="number"
                          min={0}
                          value={
                            productForm.stock === undefined ||
                            productForm.stock === null
                              ? ""
                              : String(productForm.stock)
                          }
                          onChange={(e) =>
                            setProductForm((p) => ({
                              ...p,
                              stock: e.target.value
                                ? Number(e.target.value)
                                : 0,
                            }))
                          }
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="productIsActive"
                          checked={Boolean(productForm.isActive)}
                          onCheckedChange={(checked) =>
                            setProductForm((p) => ({
                              ...p,
                              isActive: Boolean(checked),
                            }))
                          }
                        />
                        <Label htmlFor="productIsActive">Aktifkan produk</Label>
                      </div>

                      <DialogFooter>
                        <Button
                          type="submit"
                          disabled={
                            createProductMutation.isPending ||
                            updateProductMutation.isPending
                          }
                        >
                          {editingProduct
                            ? updateProductMutation.isPending
                              ? "Menyimpan..."
                              : "Simpan"
                            : createProductMutation.isPending
                              ? "Menambahkan..."
                              : "Tambah"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>

                {sellerProductsQuery.isLoading && (
                  <Card className="p-6">
                    <CardContent className="p-0 text-sm text-muted-foreground">
                      Memuat produk...
                    </CardContent>
                  </Card>
                )}

                {sellerProductsQuery.isError && (
                  <Card className="p-6">
                    <CardContent className="p-0 text-sm text-destructive">
                      {(sellerProductsQuery.error as Error).message}
                    </CardContent>
                  </Card>
                )}

                {!sellerProductsQuery.isLoading &&
                  !sellerProductsQuery.isError &&
                  (sellerProductsQuery.data?.products.length ? (
                    <div className="space-y-4">
                      {sellerProductsQuery.data.products.map((p) => (
                        <Card key={p.id} className="border-none shadow-sm">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-4">
                              <div className="space-y-1">
                                <CardTitle className="text-base">
                                  {p.name}
                                </CardTitle>
                                <CardDescription>
                                  Rp {Number(p.price).toLocaleString("id-ID")}
                                </CardDescription>
                              </div>
                              <div className="flex flex-wrap justify-end gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openEditProduct(p)}
                                >
                                  Ubah
                                </Button>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  disabled={deleteProductMutation.isPending}
                                  onClick={() =>
                                    deleteProductMutation.mutate(p.id)
                                  }
                                >
                                  Hapus
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          {p.description ? (
                            <CardContent>
                              <div className="text-sm text-muted-foreground whitespace-pre-line">
                                {p.description}
                              </div>
                            </CardContent>
                          ) : null}
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
                      <div className="bg-muted/50 p-4 rounded-full mb-4">
                        <Store className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="font-semibold text-lg">
                        Belum ada produk
                      </h3>
                      <p className="text-muted-foreground mb-4 max-w-sm">
                        Tambahkan produk pertama Anda untuk mulai berjualan.
                      </p>
                      <Button onClick={openCreateProduct}>Tambah Produk</Button>
                    </Card>
                  ))}
              </div>
            )}

            {activeTab === "sales" && isSeller && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">
                    Penjualan
                  </h1>
                  <p className="text-muted-foreground">
                    Daftar pesanan yang masuk untuk toko Anda.
                  </p>
                </div>

                {sellerOrdersQuery.isLoading && (
                  <Card className="p-6">
                    <CardContent className="p-0 text-sm text-muted-foreground">
                      Memuat penjualan...
                    </CardContent>
                  </Card>
                )}

                {sellerOrdersQuery.isError && (
                  <Card className="p-6">
                    <CardContent className="p-0 text-sm text-destructive">
                      {(sellerOrdersQuery.error as Error).message}
                    </CardContent>
                  </Card>
                )}

                {!sellerOrdersQuery.isLoading &&
                  !sellerOrdersQuery.isError &&
                  (sellerOrdersQuery.data?.orders.length ? (
                    <div className="space-y-4">
                      {sellerOrdersQuery.data.orders.map((o) => (
                        <Card key={o.id} className="border-none shadow-sm">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-4">
                              <div className="space-y-1">
                                <CardTitle className="text-base">
                                  Order #{o.id}
                                </CardTitle>
                                <CardDescription>
                                  {new Date(o.created_at).toLocaleString(
                                    "id-ID",
                                  )}
                                </CardDescription>
                              </div>
                              <div className="text-right">
                                <Badge
                                  variant="secondary"
                                  className="capitalize"
                                >
                                  {o.status}
                                </Badge>
                                <div className="font-semibold mt-2">
                                  Rp{" "}
                                  {Number(o.total_amount).toLocaleString(
                                    "id-ID",
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            {o.order_items.map((it, idx) => (
                              <div
                                key={`${o.id}-${idx}`}
                                className="flex items-center justify-between text-sm"
                              >
                                <div className="text-muted-foreground">
                                  {it.products.name}
                                </div>
                                <div>
                                  {it.quantity} x Rp{" "}
                                  {Number(it.price).toLocaleString("id-ID")}
                                </div>
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
                      <div className="bg-muted/50 p-4 rounded-full mb-4">
                        <DollarSign className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="font-semibold text-lg">
                        Belum ada penjualan
                      </h3>
                      <p className="text-muted-foreground mb-4 max-w-sm">
                        Pesanan akan muncul di sini setelah ada pembeli.
                      </p>
                    </Card>
                  ))}
              </div>
            )}

            {activeTab === "address" && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">
                    Daftar Alamat
                  </h1>
                  <p className="text-muted-foreground">
                    Atur alamat pengiriman belanjaan Anda
                  </p>
                </div>

                <div className="flex justify-end">
                  <Button onClick={openCreateAddress}>
                    Tambah Alamat Baru
                  </Button>
                </div>

                <Dialog
                  open={addressDialogOpen}
                  onOpenChange={setAddressDialogOpen}
                >
                  <DialogTrigger asChild>
                    <span />
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                      <DialogTitle>
                        {editingAddress ? "Ubah Alamat" : "Tambah Alamat"}
                      </DialogTitle>
                      <DialogDescription>
                        Lengkapi informasi alamat untuk pengiriman.
                      </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submitAddressForm} className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="addressLabel">Label</Label>
                          <Input
                            id="addressLabel"
                            placeholder="Rumah / Kantor"
                            value={addressForm.label}
                            onChange={(e) =>
                              setAddressForm((p) => ({
                                ...p,
                                label: e.target.value,
                              }))
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="recipientName">Nama Penerima</Label>
                          <Input
                            id="recipientName"
                            placeholder="Nama penerima"
                            value={addressForm.recipientName}
                            onChange={(e) =>
                              setAddressForm((p) => ({
                                ...p,
                                recipientName: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="addressPhone">Nomor Telepon</Label>
                          <Input
                            id="addressPhone"
                            placeholder="08123456789"
                            value={addressForm.phone}
                            onChange={(e) =>
                              setAddressForm((p) => ({
                                ...p,
                                phone: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="postalCode">
                            Kode Pos (opsional)
                          </Label>
                          <Input
                            id="postalCode"
                            placeholder="12345"
                            value={addressForm.postalCode ?? ""}
                            onChange={(e) =>
                              setAddressForm((p) => ({
                                ...p,
                                postalCode: e.target.value || null,
                              }))
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="addressLine">Alamat Lengkap</Label>
                        <Textarea
                          id="addressLine"
                          placeholder="Jalan, nomor rumah, kecamatan, kota, provinsi"
                          value={addressForm.addressLine}
                          onChange={(e) =>
                            setAddressForm((p) => ({
                              ...p,
                              addressLine: e.target.value,
                            }))
                          }
                          rows={4}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="note">Catatan (opsional)</Label>
                        <Textarea
                          id="note"
                          placeholder="Patokan rumah, jam penerimaan, dll"
                          value={addressForm.note ?? ""}
                          onChange={(e) =>
                            setAddressForm((p) => ({
                              ...p,
                              note: e.target.value || null,
                            }))
                          }
                          rows={3}
                        />
                      </div>

                      <DialogFooter>
                        <Button
                          type="submit"
                          disabled={
                            createAddressMutation.isPending ||
                            updateAddressMutation.isPending
                          }
                        >
                          {editingAddress
                            ? updateAddressMutation.isPending
                              ? "Menyimpan..."
                              : "Simpan"
                            : createAddressMutation.isPending
                              ? "Menambahkan..."
                              : "Tambah"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>

                {addressesQuery.isLoading && (
                  <Card className="p-6">
                    <CardContent className="p-0 text-sm text-muted-foreground">
                      Memuat alamat...
                    </CardContent>
                  </Card>
                )}

                {addressesQuery.isError && (
                  <Card className="p-6">
                    <CardContent className="p-0 text-sm text-destructive">
                      {(addressesQuery.error as Error).message}
                    </CardContent>
                  </Card>
                )}

                {!addressesQuery.isLoading &&
                  !addressesQuery.isError &&
                  (addressesQuery.data?.addresses.length ? (
                    <div className="space-y-4">
                      {addressesQuery.data.addresses.map((addr) => {
                        const isDefault =
                          addressesQuery.data?.defaultAddressId === addr.id;
                        return (
                          <Card key={addr.id} className="border-none shadow-sm">
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <CardTitle className="text-base">
                                      {addr.label}
                                    </CardTitle>
                                    {isDefault && (
                                      <Badge variant="default">Utama</Badge>
                                    )}
                                  </div>
                                  <CardDescription>
                                    {addr.recipientName} • {addr.phone}
                                  </CardDescription>
                                </div>

                                <div className="flex flex-wrap justify-end gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openEditAddress(addr)}
                                  >
                                    Ubah
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    disabled={deleteAddressMutation.isPending}
                                    onClick={() =>
                                      deleteAddressMutation.mutate(addr.id)
                                    }
                                  >
                                    Hapus
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="text-sm text-foreground whitespace-pre-line">
                                {addr.addressLine}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {addr.postalCode
                                  ? `Kode Pos: ${addr.postalCode}`
                                  : ""}
                              </div>
                              {addr.note && (
                                <div className="text-xs text-muted-foreground">
                                  Catatan: {addr.note}
                                </div>
                              )}

                              <div className="flex justify-end">
                                <Button
                                  type="button"
                                  variant={isDefault ? "secondary" : "outline"}
                                  size="sm"
                                  disabled={
                                    isDefault ||
                                    setDefaultAddressMutation.isPending
                                  }
                                  onClick={() =>
                                    setDefaultAddressMutation.mutate(addr.id)
                                  }
                                >
                                  {isDefault ? "Alamat Utama" : "Jadikan Utama"}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
                      <div className="bg-muted/50 p-4 rounded-full mb-4">
                        <MapPin className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="font-semibold text-lg">
                        Belum ada alamat tersimpan
                      </h3>
                      <p className="text-muted-foreground mb-4 max-w-sm">
                        Tambahkan alamat rumah atau kantor Anda untuk
                        mempercepat proses checkout.
                      </p>
                      <Button onClick={openCreateAddress}>
                        Tambah Alamat Baru
                      </Button>
                    </Card>
                  ))}
              </div>
            )}

            {activeTab === "payment" && (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="bg-muted p-6 rounded-full">
                  <Shield className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold">Segera Hadir</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  Fitur ini sedang dalam pengembangan dan akan segera tersedia
                  untuk Anda.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("profile")}
                >
                  Kembali ke Profil
                </Button>
              </div>
            )}

            {activeTab === "resetPassword" && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">
                    Reset Password
                  </h1>
                  <p className="text-muted-foreground">
                    Perbarui password akun Anda untuk menjaga keamanan.
                  </p>
                </div>

                <Card className="border-none shadow-md">
                  <CardHeader>
                    <CardTitle>Ganti Password</CardTitle>
                    <CardDescription>
                      Masukkan password saat ini dan password baru.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!currentPassword || !newPassword) {
                          toast.error("Semua field wajib diisi");
                          return;
                        }
                        if (newPassword !== confirmNewPassword) {
                          toast.error("Konfirmasi password baru tidak cocok");
                          return;
                        }
                        await changePasswordMutation.mutateAsync({
                          currentPassword,
                          newPassword,
                        });
                      }}
                      className="space-y-6"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">
                          Password Saat Ini
                        </Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newPassword">Password Baru</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <p className="text-[10px] text-muted-foreground">
                          Minimal 6 karakter.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmNewPassword">
                          Konfirmasi Password Baru
                        </Label>
                        <Input
                          id="confirmNewPassword"
                          type="password"
                          value={confirmNewPassword}
                          onChange={(e) =>
                            setConfirmNewPassword(e.target.value)
                          }
                        />
                      </div>

                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          disabled={changePasswordMutation.isPending}
                          className="min-w-[160px]"
                        >
                          {changePasswordMutation.isPending
                            ? "Menyimpan..."
                            : "Simpan Password"}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
