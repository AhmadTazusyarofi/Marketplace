import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { SellerLayout } from "@/components/seller/SellerLayout";
import { ImageUploader } from "@/components/seller/ImageUploader";
import { VariantManager } from "@/components/seller/VariantManager";
import { useCategories } from "@/hooks/useCategories";
import {
  useSellerProduct,
  useCreateProduct,
  useUpdateProduct,
} from "@/hooks/useProducts";
import type { ImageState } from "@/types/product";
import { toast } from "sonner";

// ─── Skema validasi form ──────────────────────────────────────────────────────

const productSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(191),
  description: z.string().optional(),
  price: z.coerce
    .number({ invalid_type_error: "Harga harus berupa angka" })
    .positive("Harga harus lebih dari 0"),
  originalPrice: z.coerce
    .number()
    .positive("Harga coret harus lebih dari 0")
    .nullable()
    .optional(),
  stock: z.coerce
    .number({ invalid_type_error: "Stok harus berupa angka" })
    .int()
    .min(0, "Stok tidak boleh negatif"),
  isActive: z.boolean().default(true),
  categoryId: z.string().nullable().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const EMPTY_IMAGE_STATE: ImageState = {
  mode: "new",
  files: [],
  previews: [],
  primaryIndex: 0,
};

function buildFormData(values: ProductFormValues, imageState: ImageState): FormData {
  const fd = new FormData();

  fd.append("name", values.name);
  if (values.description) fd.append("description", values.description);
  fd.append("price", String(values.price));
  if (values.originalPrice) fd.append("originalPrice", String(values.originalPrice));
  fd.append("stock", String(values.stock));
  fd.append("isActive", String(values.isActive));
  if (values.categoryId) fd.append("categoryId", values.categoryId);

  if (imageState.mode === "new" && imageState.files.length > 0) {
    imageState.files.forEach((file) => fd.append("images", file));
    fd.append("primaryImageIndex", String(imageState.primaryIndex));
  }

  return fd;
}

// ─── Komponen utama ───────────────────────────────────────────────────────────

export default function ProductForm() {
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();

  const { data: product, isLoading: loadingProduct } = useSellerProduct(id);
  const { data: categories = [] } = useCategories();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct(id ?? "");

  const isPending = createMutation.isPending || updateMutation.isPending;

  // ─── Image state ─────────────────────────────────────────────────────────
  const [imageState, setImageState] = useState<ImageState>(EMPTY_IMAGE_STATE);

  // ─── Form ─────────────────────────────────────────────────────────────────
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      originalPrice: null,
      stock: 0,
      isActive: true,
      categoryId: null,
    },
  });

  // Populate form saat edit & data tersedia
  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        description: product.description,
        price: product.price,
        originalPrice: product.originalPrice ?? null,
        stock: product.stock,
        isActive: product.isActive,
        categoryId: product.categoryId,
      });
      // Set gambar lama sebagai "existing"
      setImageState({
        mode: "existing",
        urls: product.images,
        primaryIndex: 0,
      });
    }
  }, [product, form]);

  // ─── Submit ───────────────────────────────────────────────────────────────
  const onSubmit = async (values: ProductFormValues) => {
    // Validasi gambar untuk mode create
    if (!isEdit && (imageState.mode !== "new" || imageState.files.length < 1)) {
      toast.error("Minimal 1 gambar produk diperlukan");
      return;
    }

    const fd = buildFormData(values, imageState);

    try {
      if (isEdit) {
        await updateMutation.mutateAsync(fd);
      } else {
        await createMutation.mutateAsync(fd);
      }
      navigate("/dashboard/products");
    } catch {
      // error sudah di-handle oleh mutation onError
    }
  };

  // ─── Loading state (edit mode) ────────────────────────────────────────────
  if (isEdit && loadingProduct) {
    return (
      <SellerLayout title={isEdit ? "Edit Produk" : "Tambah Produk"}>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </SellerLayout>
    );
  }

  const pageTitle = isEdit ? `Edit: ${product?.name ?? ""}` : "Tambah Produk Baru";

  return (
    <SellerLayout title={pageTitle}>
      {/* ── Tombol kembali ───────────────────────────────────────────────── */}
      <Button
        variant="ghost"
        size="sm"
        className="gap-2 mb-4 -mt-2"
        onClick={() => navigate("/dashboard/products")}
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke daftar produk
      </Button>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {isEdit ? (
            // ── Mode edit: pakai Tabs ───────────────────────────────────────
            <Tabs defaultValue="info">
              <TabsList className="mb-6">
                <TabsTrigger value="info">Info Produk</TabsTrigger>
                <TabsTrigger value="images">Gambar</TabsTrigger>
                <TabsTrigger value="variants">
                  Varian
                  {(product?.variants?.length ?? 0) > 0 && (
                    <span className="ml-1.5 bg-primary text-primary-foreground rounded-full text-[10px] px-1.5 py-0.5">
                      {product!.variants!.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* Tab Info */}
              <TabsContent value="info" className="space-y-6">
                <BasicInfoSection form={form} categories={categories} />
                <SubmitBar isPending={isPending} isEdit={isEdit} />
              </TabsContent>

              {/* Tab Gambar */}
              <TabsContent value="images">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Gambar Produk</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ImageUploader
                      value={imageState}
                      onChange={setImageState}
                      canRevert
                    />
                    <Separator className="my-4" />
                    <SubmitBar isPending={isPending} isEdit={isEdit} />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab Varian */}
              <TabsContent value="variants">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Varian Produk</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Tambahkan varian seperti warna, ukuran, dll. Setiap varian
                      bisa punya stok dan penyesuaian harga sendiri.
                    </p>
                  </CardHeader>
                  <CardContent>
                    <VariantManager
                      productId={id!}
                      variants={product?.variants ?? []}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            // ── Mode create: tampil semuanya sekaligus ──────────────────────
            <div className="space-y-6">
              <BasicInfoSection form={form} categories={categories} />

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Gambar Produk</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Minimal 1, maksimal 5 gambar. Gambar pertama yang dipilih
                    sebagai utama.
                  </p>
                </CardHeader>
                <CardContent>
                  <ImageUploader
                    value={imageState}
                    onChange={setImageState}
                  />
                </CardContent>
              </Card>

              <SubmitBar isPending={isPending} isEdit={isEdit} />
            </div>
          )}
        </form>
      </Form>
    </SellerLayout>
  );
}

// ─── Sub-komponen: Bagian Info Dasar + Harga + Inventori ─────────────────────

interface BasicInfoSectionProps {
  form: ReturnType<typeof useForm<ProductFormValues>>;
  categories: Array<{ id: string; name: string }>;
}

function BasicInfoSection({ form, categories }: BasicInfoSectionProps) {
  return (
    <>
      {/* Info Dasar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informasi Dasar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Produk *</FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: Kaos Polos Premium Cotton" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Deskripsi</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Jelaskan detail produk Anda..."
                    className="min-h-[100px] resize-y"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kategori</FormLabel>
                <Select
                  value={field.value ?? ""}
                  onValueChange={(v) => field.onChange(v === "none" ? null : v)}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori (opsional)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">— Tanpa Kategori —</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Harga */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Harga</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Harga Jual (Rp) *</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="originalPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Harga Coret (Rp)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      placeholder="Kosongkan jika tidak ada diskon"
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? null : Number(e.target.value),
                        )
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Harga sebelum diskon. Biarkan kosong jika tidak ada.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Inventori */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Inventori</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4 items-end">
            <FormField
              control={form.control}
              name="stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stok *</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} placeholder="0" {...field} />
                  </FormControl>
                  <FormDescription>
                    Stok utama. Jika pakai varian, setiap varian punya stok
                    sendiri.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center gap-3 pb-2">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div>
                    <FormLabel className="cursor-pointer">
                      {field.value ? "Produk Aktif" : "Produk Non-aktif"}
                    </FormLabel>
                    <FormDescription>
                      Produk non-aktif tidak muncul di halaman publik.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
}

// ─── Sub-komponen: Tombol submit ──────────────────────────────────────────────

interface SubmitBarProps {
  isPending: boolean;
  isEdit: boolean;
}

function SubmitBar({ isPending, isEdit }: SubmitBarProps) {
  const navigate = useNavigate();
  return (
    <div className="flex items-center justify-end gap-3 pt-2">
      <Button
        type="button"
        variant="outline"
        onClick={() => navigate("/dashboard/products")}
        disabled={isPending}
      >
        Batal
      </Button>
      <Button type="submit" disabled={isPending} className="min-w-[120px]">
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Menyimpan...
          </>
        ) : isEdit ? (
          "Simpan Perubahan"
        ) : (
          "Tambah Produk"
        )}
      </Button>
    </div>
  );
}
