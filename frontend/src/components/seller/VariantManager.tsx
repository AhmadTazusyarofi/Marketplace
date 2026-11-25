import { useState } from "react";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  useCreateVariant,
  useUpdateVariant,
  useDeleteVariant,
} from "@/hooks/useProducts";
import type { ProductVariant } from "@/types/product";

// ─── Tipe varian yang tersedia (mudah ditambah) ───────────────────────────────

const VARIANT_TYPES = [
  { value: "Warna", label: "Warna" },
  { value: "Ukuran", label: "Ukuran" },
  { value: "Material", label: "Material" },
  { value: "Model", label: "Model / Tipe" },
  { value: "Lainnya", label: "Lainnya" },
] as const;

// ─── State form kosong ────────────────────────────────────────────────────────

const EMPTY_FORM = {
  variantType: "",
  variantValue: "",
  stock: 0,
  priceModifier: 0,
  sku: "",
};

type VariantForm = typeof EMPTY_FORM;

// ─── Komponen baris form (dipakai untuk add & edit) ───────────────────────────

interface VariantFormRowProps {
  form: VariantForm;
  onChange: (next: VariantForm) => void;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
  confirmLabel: string;
}

function VariantFormRow({
  form,
  onChange,
  onConfirm,
  onCancel,
  loading,
  confirmLabel,
}: VariantFormRowProps) {
  const set = (field: keyof VariantForm) => (val: string | number) =>
    onChange({ ...form, [field]: val });

  return (
    <div className="grid grid-cols-[140px_1fr_80px_100px_120px_auto] gap-2 items-center p-3 bg-muted/50 rounded-lg border border-dashed">
      {/* Tipe */}
      <Select value={form.variantType} onValueChange={set("variantType")}>
        <SelectTrigger className="h-8 text-sm">
          <SelectValue placeholder="Tipe varian" />
        </SelectTrigger>
        <SelectContent>
          {VARIANT_TYPES.map((t) => (
            <SelectItem key={t.value} value={t.value}>
              {t.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Nilai */}
      <Input
        className="h-8 text-sm"
        placeholder="Contoh: Merah, XL, ..."
        value={form.variantValue}
        onChange={(e) => set("variantValue")(e.target.value)}
      />

      {/* Stok */}
      <Input
        type="number"
        min={0}
        className="h-8 text-sm"
        placeholder="Stok"
        value={form.stock}
        onChange={(e) => set("stock")(Number(e.target.value))}
      />

      {/* Tambahan harga */}
      <Input
        type="number"
        className="h-8 text-sm"
        placeholder="+/- Harga"
        value={form.priceModifier}
        onChange={(e) => set("priceModifier")(Number(e.target.value))}
      />

      {/* SKU */}
      <Input
        className="h-8 text-sm"
        placeholder="SKU (opsional)"
        value={form.sku}
        onChange={(e) => set("sku")(e.target.value)}
      />

      {/* Aksi */}
      <div className="flex gap-1">
        <Button
          type="button"
          size="icon"
          className="h-8 w-8"
          disabled={loading || !form.variantType || !form.variantValue}
          onClick={onConfirm}
        >
          <Check className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onCancel}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ─── Komponen utama ───────────────────────────────────────────────────────────

interface VariantManagerProps {
  productId: string;
  variants: ProductVariant[];
}

export function VariantManager({ productId, variants }: VariantManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<VariantForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<VariantForm>(EMPTY_FORM);

  const createMutation = useCreateVariant(productId);
  const updateMutation = useUpdateVariant(productId);
  const deleteMutation = useDeleteVariant(productId);

  // ─── Tambah ────────────────────────────────────────────────────────────────
  const handleCreate = async () => {
    await createMutation.mutateAsync({
      variantType: addForm.variantType,
      variantValue: addForm.variantValue,
      stock: addForm.stock,
      priceModifier: addForm.priceModifier,
      sku: addForm.sku || null,
    });
    setAddForm(EMPTY_FORM);
    setShowAddForm(false);
  };

  // ─── Edit ──────────────────────────────────────────────────────────────────
  const startEdit = (v: ProductVariant) => {
    setEditingId(v.id);
    setEditForm({
      variantType: v.variantType,
      variantValue: v.variantValue,
      stock: v.stock,
      priceModifier: v.priceModifier,
      sku: v.sku ?? "",
    });
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    await updateMutation.mutateAsync({
      variantId: editingId,
      data: {
        variantType: editForm.variantType,
        variantValue: editForm.variantValue,
        stock: editForm.stock,
        priceModifier: editForm.priceModifier,
        sku: editForm.sku || null,
      },
    });
    setEditingId(null);
  };

  const handleToggleActive = async (v: ProductVariant) => {
    await updateMutation.mutateAsync({
      variantId: v.id,
      data: { isActive: !v.isActive },
    });
  };

  return (
    <div className="space-y-3">
      {/* ── Header kolom ─────────────────────────────────────────────────── */}
      {variants.length > 0 && (
        <div className="grid grid-cols-[140px_1fr_80px_100px_120px_auto] gap-2 px-3 text-xs font-medium text-muted-foreground">
          <span>Tipe</span>
          <span>Nilai</span>
          <span>Stok</span>
          <span>+/- Harga</span>
          <span>SKU</span>
          <span>Aksi</span>
        </div>
      )}

      {/* ── Daftar varian ────────────────────────────────────────────────── */}
      {variants.map((v) =>
        editingId === v.id ? (
          <VariantFormRow
            key={v.id}
            form={editForm}
            onChange={setEditForm}
            onConfirm={handleUpdate}
            onCancel={() => setEditingId(null)}
            loading={updateMutation.isPending}
            confirmLabel="Simpan"
          />
        ) : (
          <div
            key={v.id}
            className={cn(
              "grid grid-cols-[140px_1fr_80px_100px_120px_auto] gap-2 items-center p-3 rounded-lg border",
              !v.isActive && "opacity-50",
            )}
          >
            <Badge variant="outline" className="w-fit text-xs">
              {v.variantType}
            </Badge>
            <span className="text-sm font-medium">{v.variantValue}</span>
            <span className="text-sm">{v.stock}</span>
            <span className="text-sm text-muted-foreground">
              {v.priceModifier > 0
                ? `+${v.priceModifier.toLocaleString("id-ID")}`
                : v.priceModifier < 0
                  ? v.priceModifier.toLocaleString("id-ID")
                  : "—"}
            </span>
            <span className="text-sm text-muted-foreground truncate">
              {v.sku || "—"}
            </span>

            {/* Aksi */}
            <div className="flex items-center gap-1">
              <Switch
                checked={v.isActive}
                onCheckedChange={() => handleToggleActive(v)}
                aria-label="Toggle aktif"
                className="scale-75"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => startEdit(v)}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Hapus varian?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Varian <strong>{v.variantType}: {v.variantValue}</strong>{" "}
                      akan dihapus permanen.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive hover:bg-destructive/90"
                      onClick={() => deleteMutation.mutate(v.id)}
                    >
                      Hapus
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ),
      )}

      {/* ── Form tambah varian ──────────────────────────────────────────── */}
      {showAddForm ? (
        <VariantFormRow
          form={addForm}
          onChange={setAddForm}
          onConfirm={handleCreate}
          onCancel={() => {
            setShowAddForm(false);
            setAddForm(EMPTY_FORM);
          }}
          loading={createMutation.isPending}
          confirmLabel="Tambah"
        />
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => setShowAddForm(true)}
        >
          <Plus className="h-4 w-4" />
          Tambah Varian
        </Button>
      )}

      {variants.length === 0 && !showAddForm && (
        <p className="text-sm text-muted-foreground italic">
          Belum ada varian. Klik "Tambah Varian" untuk mulai.
        </p>
      )}

      {/* ── Keterangan kolom harga ──────────────────────────────────────── */}
      {(variants.length > 0 || showAddForm) && (
        <p className="text-xs text-muted-foreground">
          * "+/- Harga" adalah selisih dari harga dasar produk (bisa negatif).
        </p>
      )}
    </div>
  );
}
