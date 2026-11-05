# PasokTani Backend API

REST API backend untuk platform PasokTani - menghubungkan petani dengan pembeli secara langsung untuk distribusi hasil pertanian yang lebih efisien.

## Tech Stack

- **Runtime**: Bun
- **Framework**: Hono
- **Database**: PostgreSQL (Neon)
- **Authentication**: JWT
- **Password Hashing**: bcryptjs
- **Validation**: Zod

## Persyaratan Sistem

- Bun v1.4.0+
- PostgreSQL database (Neon recommended)
- Node.js 18+ (jika tidak menggunakan Bun)

## Setup & Installation

### 1. Clone dan Install Dependencies

```bash
cd PasokTani-Backend
bun install
```

### 2. Setup Environment

Copy `.env.example` ke `.env` dan sesuaikan nilai:

```bash
cp .env.example .env
```

Edit `.env`:

```
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://user:password@host:5432/pasoktani_db?schema=public"
JWT_SECRET="your_jwt_secret_key"
JWT_EXPIRES_IN="7d"
```

### 3. Inisialisasi Database

```bash
psql $DATABASE_URL < migrations/001_init_schema.sql
```

Atau gunakan Neon CLI:

```bash
neon sql -c "$DATABASE_URL" < migrations/001_init_schema.sql
```

## Menjalankan Backend

### Development Mode

```bash
bun run dev
```

Server akan berjalan di `http://localhost:5000`

### Production Build

```bash
bun run build
bun run start
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/me` - Get current user (protected)

### Categories
- `GET /api/v1/categories` - Get all categories
- `GET /api/v1/categories/count` - Get categories with commodity count
- `POST /api/v1/categories` - Create category (admin only)
- `PATCH /api/v1/categories/:id` - Update category (admin only)
- `DELETE /api/v1/categories/:id` - Delete category (admin only)

### Products
- `GET /api/v1/products` - Get public products
- `GET /api/v1/products/:id` - Get product detail
- `POST /api/v1/products` - Create product (farmer only)
- `GET /api/v1/products/me/products` - Get farmer's products
- `PATCH /api/v1/products/:id` - Update product (farmer only)
- `DELETE /api/v1/products/:id` - Delete product (farmer only)
- `PATCH /api/v1/products/:id/stock` - Update stock (farmer only)
- `PATCH /api/v1/products/:id/publish` - Toggle publish status (farmer only)

### Orders
- `POST /api/v1/orders` - Create order
- `GET /api/v1/orders/me` - Get user's orders
- `GET /api/v1/orders/:id` - Get order detail
- `PATCH /api/v1/orders/:id/status` - Update order status

### Dashboard
- `GET /api/v1/dashboard/farmer` - Get farmer dashboard stats (farmer only)
- `GET /api/v1/dashboard/admin` - Get admin dashboard stats (admin only)

### Reviews
- `POST /api/v1/reviews` - Create review
- `GET /api/v1/reviews/farmer/:farmerId` - Get farmer reviews
- `GET /api/v1/reviews/commodity/:commodityId` - Get commodity reviews

## Authentication

Semua endpoint yang dilindungi memerlukan Bearer Token di header:

```
Authorization: Bearer <your_jwt_token>
```

Token diperoleh dari endpoint `/api/v1/auth/login` setelah login berhasil.

## Database Schema

Database terdiri dari tabel-tabel utama:

- **users** - Pengguna (farmer, pembeli, admin)
- **commodities** - Produk pertanian
- **categories** - Kategori produk
- **orders** - Pesanan
- **payments** - Pembayaran
- **reviews** - Ulasan produk
- **chat_rooms** - Ruang chat
- **chat_messages** - Pesan chat
- **notifications** - Notifikasi
- **wishlist_items** - Item favorit
- **admin_activity_logs** - Log aktivitas admin

Lihat `migrations/001_init_schema.sql` untuk detail lengkap.

## Role & Permission

### ADMIN
- Mengelola kategori
- Mengelola pengguna
- Verifikasi petani dan produk

### FARMER (PETANI)
- Membuat dan mengelola produk
- Melihat pesanan masuk
- Akses dashboard penjualan

### BUYER (PEMBELI)
- Browsing produk
- Membuat pesanan
- Memberikan ulasan

## Struktur Folder

```
PasokTani-Backend/
├── src/
│   ├── db.ts              # Database connection
│   ├── index.ts           # Main app entry
│   ├── middleware/
│   │   └── auth.ts        # Auth middleware
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── categories.ts
│   │   ├── products.ts
│   │   ├── orders.ts
│   │   ├── dashboard.ts
│   │   └── reviews.ts
│   └── utils/
│       ├── jwt.ts         # JWT utilities
│       └── response.ts    # Response helpers
├── migrations/
│   └── 001_init_schema.sql
├── dist/                  # Build output
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## Feature Status

### Core Features (✓ Implemented)
- ✓ Authentication & JWT
- ✓ User Management
- ✓ Category Management
- ✓ Product CRUD
- ✓ Order Management
- ✓ Payment Tracking
- ✓ Review System
- ✓ Dashboard Stats

### Pending Features (TODO)
- [ ] Chat & Real-time Messaging
- [ ] Negotiation System
- [ ] Wishlist Management
- [ ] Notifications
- [ ] Admin Verification Workflow
- [ ] Reports & Analytics
- [ ] Achievements System
- [ ] Support Tickets
- [ ] Preorder System

## Kontribusi

Untuk menambahkan fitur atau memperbaiki bug:

1. Buat branch baru: `git checkout -b feature/nama-fitur`
2. Commit perubahan: `git commit -m "feat: deskripsi singkat"`
3. Push ke branch: `git push origin feature/nama-fitur`
4. Buat Pull Request

## License

MIT

## Support

Untuk pertanyaan atau isu teknis, buat issue di repository atau hubungi tim development.
