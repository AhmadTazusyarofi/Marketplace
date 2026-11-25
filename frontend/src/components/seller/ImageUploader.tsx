import { useRef, useCallback } from "react";
import { UploadCloud, X, Star, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { resolveImageUrl } from "@/lib/apiClient";
import type { ImageState } from "@/types/product";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE_MB = 2;
const MAX_FILES = 5;

interface ImageUploaderProps {
  value: ImageState;
  onChange: (next: ImageState) => void;
  /** Tampilkan tombol "Gunakan gambar lama" (mode edit) */
  canRevert?: boolean;
}

export function ImageUploader({ value, onChange, canRevert }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // ─── Validasi file ──────────────────────────────────────────────────────────
  const validate = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return `${file.name}: hanya JPG/PNG/WEBP`;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return `${file.name}: ukuran maks ${MAX_FILE_SIZE_MB}MB`;
    }
    return null;
  };

  // ─── Tambah file baru ───────────────────────────────────────────────────────
  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      const currentFiles = value.mode === "new" ? value.files : [];
      const currentPreviews = value.mode === "new" ? value.previews : [];

      const valid: File[] = [];
      const newPreviews: string[] = [];
      const errors: string[] = [];

      Array.from(incoming).forEach((file) => {
        const err = validate(file);
        if (err) {
          errors.push(err);
        } else if (currentFiles.length + valid.length < MAX_FILES) {
          valid.push(file);
          newPreviews.push(URL.createObjectURL(file));
        } else {
          errors.push(`Maksimal ${MAX_FILES} gambar`);
        }
      });

      if (errors.length) {
        // Tampilkan error tanpa menyebabkan crash — parent bisa handle toast
        console.warn("[ImageUploader]", errors);
        // Trigger native alert sebagai fallback sederhana
        alert(errors.join("\n"));
        return;
      }

      onChange({
        mode: "new",
        files: [...currentFiles, ...valid],
        previews: [...currentPreviews, ...newPreviews],
        primaryIndex: value.mode === "new" ? value.primaryIndex : 0,
      });
    },
    [value, onChange],
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) addFiles(e.target.files);
    e.target.value = "";
  };

  // ─── Drag & Drop ────────────────────────────────────────────────────────────
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    addFiles(e.dataTransfer.files);
  };

  // ─── Hapus satu gambar ──────────────────────────────────────────────────────
  const removeImage = (idx: number) => {
    if (value.mode !== "new") return;
    const files = value.files.filter((_, i) => i !== idx);
    const previews = value.previews.filter((_, i) => i !== idx);
    const primaryIndex =
      value.primaryIndex === idx
        ? 0
        : value.primaryIndex > idx
          ? value.primaryIndex - 1
          : value.primaryIndex;
    onChange({ mode: "new", files, previews, primaryIndex });
  };

  // ─── Set primary ────────────────────────────────────────────────────────────
  const setPrimary = (idx: number) => {
    if (value.mode === "new") {
      onChange({ ...value, primaryIndex: idx });
    } else {
      onChange({ ...value, primaryIndex: idx });
    }
  };

  // ─── Tombol kembali ke gambar lama (mode edit) ─────────────────────────────
  const revert = () => {
    if (value.mode === "new") {
      // Bersihkan object URLs agar tidak memory leak
      value.previews.forEach((url) => URL.revokeObjectURL(url));
    }
    onChange({ mode: "existing", urls: [], primaryIndex: 0 });
  };

  // ─── Render preview ─────────────────────────────────────────────────────────
  const renderPreviews = () => {
    const items: { src: string; key: string }[] =
      value.mode === "new"
        ? value.previews.map((src, i) => ({ src, key: String(i) }))
        : value.urls.map((url, i) => ({
            src: resolveImageUrl(url),
            key: url + i,
          }));

    if (!items.length) return null;

    return (
      <div className="flex flex-wrap gap-3 mt-3">
        {items.map(({ src, key }, idx) => (
          <div key={key} className="relative group">
            <img
              src={src}
              alt={`Preview ${idx + 1}`}
              className={cn(
                "w-24 h-24 object-cover rounded-lg border-2 transition-all",
                (value.mode === "new" || value.mode === "existing") &&
                  value.primaryIndex === idx
                  ? "border-primary ring-2 ring-primary/40"
                  : "border-border",
              )}
            />

            {/* Badge utama */}
            {value.primaryIndex === idx && (
              <Badge className="absolute top-1 left-1 text-[10px] px-1 py-0 gap-0.5">
                <Star className="h-2.5 w-2.5" /> Utama
              </Badge>
            )}

            {/* Overlay aksi */}
            <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
              {value.primaryIndex !== idx && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="h-6 text-[10px] px-2"
                  onClick={() => setPrimary(idx)}
                >
                  Set Utama
                </Button>
              )}
              {value.mode === "new" && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="h-6 text-[10px] px-2"
                  onClick={() => removeImage(idx)}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const fileCount = value.mode === "new" ? value.files.length : value.urls.length;
  const canAddMore = fileCount < MAX_FILES;

  return (
    <div className="space-y-3">
      {/* ── Drop zone ──────────────────────────────────────────────────── */}
      {(value.mode === "new" || value.mode === "existing") && canAddMore && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer",
            "hover:border-primary hover:bg-muted/50 transition-colors",
          )}
        >
          <UploadCloud className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            {value.mode === "existing" && value.urls.length > 0
              ? "Klik atau drag untuk mengganti semua gambar"
              : "Klik atau drag gambar ke sini"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            JPG/PNG/WEBP, maks {MAX_FILE_SIZE_MB}MB per file, maks {MAX_FILES}{" "}
            gambar
          </p>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={ACCEPTED_TYPES.join(",")}
            className="hidden"
            onChange={handleFileInput}
          />
        </div>
      )}

      {/* ── Preview list ───────────────────────────────────────────────── */}
      {renderPreviews()}

      {/* ── Info & aksi ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {fileCount}/{MAX_FILES} gambar
          {value.mode === "existing" && fileCount > 0 && (
            <span className="ml-1 text-blue-500">(gambar saat ini)</span>
          )}
        </span>

        {canRevert && value.mode === "new" && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 text-xs gap-1"
            onClick={revert}
          >
            <RefreshCw className="h-3 w-3" />
            Gunakan gambar lama
          </Button>
        )}
      </div>
    </div>
  );
}
