# Marketplace — Agent Context (CLAUDE.md)

Dokumen ini memberikan konteks lengkap tentang project **Marketplace** kepada AI agent.
Baca seluruh dokumen ini sebelum membuat perubahan apapun.

---

## 1. Gambaran Umum Project

Marketplace adalah aplikasi e-commerce full-stack dengan dua bagian utama:

| Bagian     | Teknologi                              | Port Dev |
|------------|----------------------------------------|----------|
| `backend/` | Node.js + Express + TypeScript + Prisma ORM | `3001`   |
| `frontend/`| React 18 + Vite + TypeScript + Tailwind CSS + Shadcn UI | `5173`   |

Database: **MySQL** (dijalankan via XAMPP). ORM: **Prisma**.

---

## 2. Struktur Direktori

```
Marketplace/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma        # Definisi skema database
│   ├── public/
│   │   └── uploads/             # File upload (gambar produk, avatar)
│   ├── src/
│   │   ├── app.ts               # Setup Express app, middleware, routes
│   │   ├── index.ts             # Entry point server
│   │   ├── seed.ts              # Script seed database
│   │   ├── lib/
│   │   │   ├── auth.ts          # JWT helper (signAccessToken, verifyAccessToken)
│   │   │   ├── http.ts          # Helper sendError()
│   │   │   └── prisma.ts        # Prisma client singleton
│   │   ├── middleware/
│   │   │   └── auth.ts          # requireAuth, requireRole middleware
│   │   └── routes/
│   │       ├── auth.ts          # /api/auth/*
│   │       ├── users.ts         # /api/users/*
│   │       ├── addresses.ts     # /api/addresses/*
│   │       ├── categories.ts    # /api/categories/*
│   │       ├── products.ts      # /api/products/*
│   │       ├── cart.ts          # /api/cart/*
│   │       ├── checkout.ts      # /api/checkout/*
│   │       └── orders.ts        # /api/orders/*
│   ├── .env                     # Konfigurasi environment (jangan di-commit)
│   ├── .env.example             # Template environment
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx              # Root component + routing
│   │   ├── main.tsx             # Entry point React
│   │   ├── components/          # Komponen reusable
│   │   │   ├── Navbar.tsx
│   │   │   ├── CartDrawer.tsx
│   │   │   ├── CategoryBar.tsx
│   │   │   ├── FlashSaleSection.tsx
│   │   │   ├── HeroSection.tsx
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductGrid.tsx
│   │   │   ├── SearchAutosuggest.tsx
│   │   │   ├── SplashScreen.tsx
│   │   │   ├── ThemeToggle.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── seller/          # Komponen khusus seller
│   │   │   └── ui/              # Shadcn/Radix UI components
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx  # State autentikasi global
│   │   ├── hooks/               # Custom React hooks
│   │   ├── integrations/        # Integrasi Supabase (storage)
│   │   ├── lib/
│   │   │   └── apiClient.ts     # Wrapper fetch ke backend API
│   │   ├── pages/
│   │   │   ├── Auth.tsx         # Login & Register
│   │   │   ├── AuthCallback.tsx # Google OAuth callback
│   │   │   ├── Cart.tsx
│   │   │   ├── Checkout.tsx
│   │   │   ├── Index.tsx        # Halaman utama / landing
│   │   │   ├── MyOrders.tsx
│   │   │   ├── ProductDetail.tsx
│   │   │   ├── Profile.tsx
│   │   │   ├── SellerDashboard.tsx
│   │   │   └── seller/
│   │   │       ├── ProductList.tsx
│   │   │       └── ProductForm.tsx
│   │   └── types/               # TypeScript type definitions
│   ├── .env                     # VITE_API_URL, dll
│   └── package.json
│
└── marketplace.sql              # Dump SQL databse (backup)
```

---

## 3. Database Schema (Prisma)

Database MySQL dengan tabel-tabel berikut:

| Model           | Tabel               | Keterangan                                          |
|-----------------|---------------------|-----------------------------------------------------|
| `User`          | `users`             | Buyer, Seller, Admin — role enum                    |
| `UserAddress`   | `user_addresses`    | Soft-delete (`deletedAt`)                           |
| `Store`         | `stores`            | Satu user-seller memiliki satu toko                 |
| `Category`      | `categories`        | Slug unik                                           |
| `Product`       | `products`          | Soft-delete (`deletedAt`), price, originalPrice     |
| `ProductImage`  | `product_images`    | isPrimary flag                                      |
| `ProductVariant`| `product_variants`  | variantType, variantValue, priceModifier            |
| `Cart`          | `carts`             | 1 cart per user                                     |
| `CartItem`      | `cart_items`        | Unique (cartId, productId)                          |
| `Order`         | `orders`            | Status: pending, paid, shipped, done, cancelled     |
| `OrderItem`     | `order_items`       | Snapshot harga saat checkout                        |
| `Payment`       | `payments`          | paymentMethod, paymentStatus, paymentReference      |
| `FlashSale`     | `flash_sales`       | startTime, endTime, isActive                        |
| `FlashSaleItem` | `flash_sale_items`  | flashPrice, quota, sold                             |

> **Catatan penting:** Semua BigInt ID di Prisma harus di-cast ke `String` sebelum dikirim ke frontend, karena JavaScript tidak bisa handle BigInt secara native dalam JSON.

---

## 4. Konfigurasi Environment

### Backend (`backend/.env`)
```env
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/marketplace"
PORT=3001
JWT_SECRET="secret-key-anda"
CORS_ORIGIN="http://localhost:5173"

# Google OAuth (opsional)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GOOGLE_CALLBACK_URL="http://localhost:3001/api/auth/google/callback"
FRONTEND_URL="http://localhost:5173"
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL="http://localhost:3001"
```

---

## 5. Script yang Tersedia

### Backend
```bash
# Di dalam folder backend/
npm run dev              # Development server (tsx watch)
npm run build            # Compile TypeScript
npm run start            # Jalankan production build
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Jalankan migrasi database
npm run prisma:studio    # Buka Prisma Studio (GUI database)
npm run seed             # Seed data awal ke database
```

### Frontend
```bash
# Di dalam folder frontend/
npm run dev              # Vite dev server (port 5173)
npm run build            # Production build
npm run preview          # Preview production build
npm run lint             # ESLint check
```

---

## 6. Autentikasi

- **JWT Bearer Token** disimpan di `localStorage` (`auth_token`)
- **Roles:** `buyer` | `seller` | `admin`
- **Google OAuth** didukung via redirect flow (`/api/auth/google` → callback → `/auth/callback`)
- Frontend menggunakan `AuthContext` untuk state global user
- `apiClient.ts` otomatis menyertakan token di header `Authorization: Bearer <token>`

### Endpoint Auth
```
POST /api/auth/register    # Daftar akun baru (buyer/seller)
POST /api/auth/login       # Login email + password
GET  /api/auth/me          # Info user saat ini (butuh token)
GET  /api/auth/google      # Redirect ke Google OAuth
GET  /api/auth/google/callback  # Callback dari Google
```

---

## 7. API Endpoints

### Users
```
GET    /api/users/:id          # Profil user
PATCH  /api/users/:id          # Update profil (nama, phone, avatar)
```

### Addresses
```
GET    /api/addresses          # Daftar alamat milik user
POST   /api/addresses          # Tambah alamat baru
PATCH  /api/addresses/:id      # Update alamat
DELETE /api/addresses/:id      # Soft-delete alamat
PATCH  /api/addresses/:id/default  # Set sebagai alamat default
```

### Products
```
GET    /api/products           # List produk (filter, search, sort, pagination)
GET    /api/products/:id       # Detail produk
POST   /api/products           # Buat produk baru (seller)
PATCH  /api/products/:id       # Update produk (seller)
DELETE /api/products/:id       # Hapus produk / soft-delete (seller)
POST   /api/products/:id/images   # Upload gambar produk
DELETE /api/products/:id/images/:imgId  # Hapus gambar
```

### Cart
```
GET    /api/cart               # Isi keranjang belanja
POST   /api/cart/items         # Tambah ke keranjang
PATCH  /api/cart/items/:id     # Update jumlah
DELETE /api/cart/items/:id     # Hapus dari keranjang
```

### Checkout & Orders
```
POST   /api/checkout           # Buat order dari cart
GET    /api/orders             # Daftar pesanan user
GET    /api/orders/:id         # Detail pesanan
```

---

## 8. Frontend Routing

| Path                          | Halaman           | Akses          |
|-------------------------------|-------------------|----------------|
| `/`                           | Index (Home)      | Public         |
| `/auth`                       | Login / Register  | Public         |
| `/auth/callback`              | OAuth Callback    | Public         |
| `/product/:id`                | Detail Produk     | Public         |
| `/cart`                       | Keranjang         | Perlu login    |
| `/checkout`                   | Checkout          | Perlu login    |
| `/profile`                    | Profil Pengguna   | Perlu login    |
| `/my-orders`                  | Pesanan Saya      | Perlu login    |
| `/dashboard`                  | Seller Dashboard  | Role: seller   |
| `/dashboard/products`         | Daftar Produk     | Role: seller   |
| `/dashboard/products/new`     | Tambah Produk     | Role: seller   |
| `/dashboard/products/:id/edit`| Edit Produk       | Role: seller   |

---

## 9. Teknologi & Library Utama

### Backend
- **Express** — HTTP server
- **Prisma** — ORM untuk MySQL
- **bcrypt** — Hashing password
- **jsonwebtoken** — JWT auth
- **zod** — Validasi input
- **multer** — Upload file
- **helmet** — Security headers
- **cors** — CORS policy
- **google-auth-library** — Google OAuth

### Frontend
- **React 18** + **React Router v6** — SPA routing
- **Vite** — Build tool / dev server
- **TypeScript** — Type safety
- **Tailwind CSS** — Utility-first styling
- **Shadcn/UI** + **Radix UI** — Komponen UI aksesibel
- **TanStack React Query** — Server state management & caching
- **React Hook Form** + **Zod** — Form validation
- **Supabase JS** — Storage integration (upload file ke Supabase Storage)
- **Lucide React** — Icon set
- **Sonner** + **Toaster** — Toast notifications
- **next-themes** — Dark/light mode
- **Recharts** — Charts (dashboard seller)

---

## 10. Pola Coding yang Wajib Dipatuhi

### Backend
1. **BigInt serialization** — Selalu konversi BigInt ke `String` sebelum `res.json()`.
2. **Validasi input** — Gunakan `zod` untuk semua body request.
3. **Error response** — Gunakan helper `sendError(res, statusCode, message)` dari `lib/http.ts`.
4. **Auth check** — Gunakan middleware `requireAuth` dan `requireRole(['seller'])` di route yang perlu proteksi.
5. **Prisma singleton** — Selalu import `prisma` dari `lib/prisma.ts`.
6. **Soft delete** — Model dengan `deletedAt` harus selalu filter `where: { deletedAt: null }` saat query normal.

### Frontend
1. **API calls** — Gunakan `apiFetch` dari `lib/apiClient.ts`, bukan `fetch` langsung.
2. **Auth state** — Pakai `useAuth()` dari `AuthContext`, jangan akses `localStorage` langsung.
3. **Server state** — Gunakan `useQuery` / `useMutation` dari TanStack React Query.
4. **Komponen UI** — Preferensikan komponen dari `components/ui/` (Shadcn) sebelum membuat custom.
5. **Toast** — Gunakan `toast()` dari `sonner` untuk notifikasi.
6. **BigInt** — API mengembalikan ID sebagai string, simpan dan kirim sebagai string.

---

## 11. Upload File

- **Gambar produk** — Upload ke backend via `POST /api/products/:id/images` (form-data, field `image`). Disimpan di `backend/public/uploads/`.
- **Avatar user** — Upload ke **Supabase Storage** via integrasi di `frontend/src/integrations/`.
- **Akses gambar** — Backend mengekspos `/uploads/*` sebagai static file dengan CORP header `cross-origin`.

---

## 12. Cara Menjalankan Lokal

### Prasyarat
- Node.js >= 20
- XAMPP dengan MySQL aktif
- Database `marketplace` sudah dibuat

### Langkah
```bash
# 1. Setup backend
cd backend
cp .env.example .env
# Edit .env sesuai konfigurasi lokal
npm install
npm run prisma:generate
npm run prisma:migrate
npm run seed          # (opsional) isi data contoh
npm run dev

# 2. Setup frontend (terminal baru)
cd frontend
npm install
# Pastikan .env sudah ada dengan VITE_API_URL
npm run dev
```

Backend berjalan di `http://localhost:3001`
Frontend berjalan di `http://localhost:5173`

---

## 13. Hal-hal yang Perlu Diperhatikan

- **Jangan commit file `.env`** — Hanya `.env.example` yang boleh di-push.
- **Migrasi database** — Jika mengubah `schema.prisma`, selalu jalankan `npm run prisma:migrate`.
- **CORS** — Backend mengizinkan origin dari `CORS_ORIGIN` di `.env`. Jika frontend port berubah, update `.env` backend.
- **Soft delete** — `Product` dan `UserAddress` menggunakan soft delete via `deletedAt`. Filter selalu `deletedAt: null` agar data terhapus tidak muncul.
- **Flash Sale** — Fitur flash sale terintegrasi di homepage. Waktu aktif dikontrol oleh `startTime` dan `endTime`.
- **Seller Store** — Satu seller hanya bisa punya satu toko (`@unique` pada `ownerId` di `Store`).
