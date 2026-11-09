/**
 * Authoritative Feature & Component Inventory for Starbhak-PasokTani
 * Maps all 93 items (92 React components + M5 Build/Lint Gate) across Milestones M1 - M5.
 */

export const INVENTORY = [
  // ==========================================
  // Milestone 1: Common Primitives (9) & Layouts (9)
  // ==========================================
  {
    id: 1,
    name: 'ChipStatus',
    file: 'common/ChipStatus.tsx',
    domain: 'common',
    milestone: 'M1',
    propsInterface: 'ChipStatusProps',
    keyProps: ['status'],
    designSource: 'design/common/ChipStatus.dc.html',
    description: '22 lifecycle status badge chips with semantic colors & dots'
  },
  {
    id: 2,
    name: 'Bintang',
    file: 'common/Bintang.tsx',
    domain: 'common',
    milestone: 'M1',
    propsInterface: 'BintangProps',
    keyProps: ['nilai'],
    designSource: 'design/common/Bintang.dc.html',
    description: 'Rating stars display & interactive rating selector'
  },
  {
    id: 3,
    name: 'UnggahFoto',
    file: 'common/UnggahFoto.tsx',
    domain: 'common',
    milestone: 'M1',
    propsInterface: 'UnggahFotoProps',
    keyProps: [],
    designSource: 'design/common/UnggahFoto.dc.html',
    description: 'Multi-photo uploader with drag-and-drop & previews'
  },
  {
    id: 4,
    name: 'LangkahWizard',
    file: 'common/LangkahWizard.tsx',
    domain: 'common',
    milestone: 'M1',
    propsInterface: 'LangkahWizardProps',
    keyProps: ['langkah', 'langkahAktif'],
    designSource: 'design/common/LangkahWizard.dc.html',
    description: 'Stepper wizard progress indicators for multi-step flows'
  },
  {
    id: 5,
    name: 'KartuAngka',
    file: 'common/KartuAngka.tsx',
    domain: 'common',
    milestone: 'M1',
    propsInterface: 'KartuAngkaProps',
    keyProps: ['label', 'nilai'],
    designSource: 'design/common/KartuAngka.dc.html',
    description: 'Metric/KPI highlight cards with delta indicators'
  },
  {
    id: 6,
    name: 'Grafik',
    file: 'common/Grafik.tsx',
    domain: 'common',
    milestone: 'M1',
    propsInterface: 'GrafikProps',
    keyProps: ['data'],
    designSource: 'design/common/Grafik.dc.html',
    description: 'Pure SVG/CSS data visualization charts (sales, harvests)'
  },
  {
    id: 7,
    name: 'JalurStatus',
    file: 'common/JalurStatus.tsx',
    domain: 'common',
    milestone: 'M1',
    propsInterface: 'JalurStatusProps',
    keyProps: ['langkahList'],
    designSource: 'design/common/JalurStatus.dc.html',
    description: 'Vertical/horizontal timeline progress tracker for orders'
  },
  {
    id: 8,
    name: 'JalurKomplain',
    file: 'common/JalurKomplain.tsx',
    domain: 'common',
    milestone: 'M1',
    propsInterface: 'JalurKomplainProps',
    keyProps: ['tahap'],
    designSource: 'design/common/JalurKomplain.dc.html',
    description: 'Dispute progression timeline (filed -> response -> mediation)'
  },
  {
    id: 9,
    name: 'BarisNotifikasi',
    file: 'common/BarisNotifikasi.tsx',
    domain: 'common',
    milestone: 'M1',
    propsInterface: 'BarisNotifikasiProps',
    keyProps: ['notifikasi'],
    designSource: 'design/notifikasi/BarisNotifikasi.dc.html',
    description: 'Reusable notification item row with icon and action'
  },
  {
    id: 10,
    name: 'SiteHeader',
    file: 'layout/SiteHeader.tsx',
    domain: 'layout',
    milestone: 'M1',
    propsInterface: 'SiteHeaderProps',
    keyProps: [],
    designSource: 'design/layout/SiteHeader.dc.html',
    description: 'Global buyer header with search, location, cart, notif, profile'
  },
  {
    id: 11,
    name: 'SiteFooter',
    file: 'layout/SiteFooter.tsx',
    domain: 'layout',
    milestone: 'M1',
    propsInterface: 'SiteFooterProps',
    keyProps: [],
    designSource: 'design/layout/SiteFooter.dc.html',
    description: 'Global buyer footer with navigation links and copyright'
  },
  {
    id: 12,
    name: 'NavBawah',
    file: 'layout/NavBawah.tsx',
    domain: 'layout',
    milestone: 'M1',
    propsInterface: 'NavBawahProps',
    keyProps: ['ruteAktif'],
    designSource: 'design/layout/NavBawah.dc.html',
    description: 'Mobile bottom navigation bar for buyer shell'
  },
  {
    id: 13,
    name: 'TokoAtas',
    file: 'layout/TokoAtas.tsx',
    domain: 'layout',
    milestone: 'M1',
    propsInterface: 'TokoAtasProps',
    keyProps: ['toko'],
    designSource: 'design/toko/TokoAtas.dc.html',
    description: 'Farmer portal header with store status, alerts, profile'
  },
  {
    id: 14,
    name: 'TokoSamping',
    file: 'layout/TokoSamping.tsx',
    domain: 'layout',
    milestone: 'M1',
    propsInterface: 'TokoSampingProps',
    keyProps: ['ruteAktif'],
    designSource: 'design/toko/TokoSamping.dc.html',
    description: 'Farmer portal desktop sidebar navigation'
  },
  {
    id: 15,
    name: 'TokoNavBawah',
    file: 'layout/TokoNavBawah.tsx',
    domain: 'layout',
    milestone: 'M1',
    propsInterface: 'TokoNavBawahProps',
    keyProps: ['ruteAktif'],
    designSource: 'design/toko/TokoNavBawah.dc.html',
    description: 'Farmer portal mobile bottom navigation bar'
  },
  {
    id: 16,
    name: 'AkunMenu',
    file: 'layout/AkunMenu.tsx',
    domain: 'layout',
    milestone: 'M1',
    propsInterface: 'AkunMenuProps',
    keyProps: ['tabAktif'],
    designSource: 'design/akun/AkunMenu.dc.html',
    description: 'Buyer account navigation tabs / sidebar'
  },
  {
    id: 17,
    name: 'AuthHeader',
    file: 'layout/AuthHeader.tsx',
    domain: 'layout',
    milestone: 'M1',
    propsInterface: 'AuthHeaderProps',
    keyProps: [],
    designSource: 'design/auth/AuthHeader.dc.html',
    description: 'Minimal auth flow header with PasokTani logo'
  },
  {
    id: 18,
    name: 'AuthPanel',
    file: 'layout/AuthPanel.tsx',
    domain: 'layout',
    milestone: 'M1',
    propsInterface: 'AuthPanelProps',
    keyProps: ['judul', 'subtitel'],
    designSource: 'design/auth/AuthPanel.dc.html',
    description: 'Split-screen branding visual panel for auth pages'
  },

  // ==========================================
  // Milestone 2: Buyer Auth, Accounts, Communication & Wallet (19)
  // ==========================================
  {
    id: 19,
    name: 'Masuk',
    file: 'auth/Masuk.tsx',
    domain: 'auth',
    milestone: 'M2',
    propsInterface: 'MasukProps',
    keyProps: [],
    designSource: 'design/masuk/Masuk.dc.html',
    description: 'Buyer/seller login form with credentials & OAuth'
  },
  {
    id: 20,
    name: 'Daftar',
    file: 'auth/Daftar.tsx',
    domain: 'auth',
    milestone: 'M2',
    propsInterface: 'DaftarProps',
    keyProps: [],
    designSource: 'design/daftar/Daftar.dc.html',
    description: 'Registration role selection (Pembeli vs Petani)'
  },
  {
    id: 21,
    name: 'DaftarPetani',
    file: 'auth/DaftarPetani.tsx',
    domain: 'auth',
    milestone: 'M2',
    propsInterface: 'DaftarPetaniProps',
    keyProps: [],
    designSource: 'design/daftar/DaftarPetani.dc.html',
    description: 'Comprehensive farmer registration & farm details'
  },
  {
    id: 22,
    name: 'DaftarPembeli',
    file: 'auth/DaftarPembeli.tsx',
    domain: 'auth',
    milestone: 'M2',
    propsInterface: 'DaftarPembeliProps',
    keyProps: [],
    designSource: 'design/daftar/DaftarPembeli.dc.html',
    description: 'Buyer registration with contact & preferences'
  },
  {
    id: 23,
    name: 'LupaSandi',
    file: 'auth/LupaSandi.tsx',
    domain: 'auth',
    milestone: 'M2',
    propsInterface: 'LupaSandiProps',
    keyProps: [],
    designSource: 'design/lupa-sandi/LupaSandi.dc.html',
    description: 'Password reset request form via email/phone'
  },
  {
    id: 24,
    name: 'AturUlangSandi',
    file: 'auth/AturUlangSandi.tsx',
    domain: 'auth',
    milestone: 'M2',
    propsInterface: 'AturUlangSandiProps',
    keyProps: [],
    designSource: 'design/atur-ulang-sandi/AturUlangSandi.dc.html',
    description: 'New password creation and confirmation form'
  },
  {
    id: 25,
    name: 'Akun',
    file: 'account/Akun.tsx',
    domain: 'account',
    milestone: 'M2',
    propsInterface: 'AkunProps',
    keyProps: [],
    designSource: 'design/akun/Akun.dc.html',
    description: 'Buyer account dashboard overview'
  },
  {
    id: 26,
    name: 'AkunProfil',
    file: 'account/AkunProfil.tsx',
    domain: 'account',
    milestone: 'M2',
    propsInterface: 'AkunProfilProps',
    keyProps: ['profil'],
    designSource: 'design/akun/AkunProfil.dc.html',
    description: 'Buyer personal information edit form'
  },
  {
    id: 27,
    name: 'AkunAlamat',
    file: 'account/AkunAlamat.tsx',
    domain: 'account',
    milestone: 'M2',
    propsInterface: 'AkunAlamatProps',
    keyProps: ['alamatList'],
    designSource: 'design/akun/AkunAlamat.dc.html',
    description: 'Delivery address management list'
  },
  {
    id: 28,
    name: 'AlamatForm',
    file: 'account/AlamatForm.tsx',
    domain: 'account',
    milestone: 'M2',
    propsInterface: 'AlamatFormProps',
    keyProps: [],
    designSource: 'design/akun/AlamatForm.dc.html',
    description: 'Add/edit address modal with coordinate tagging'
  },
  {
    id: 29,
    name: 'AkunKeamanan',
    file: 'account/AkunKeamanan.tsx',
    domain: 'account',
    milestone: 'M2',
    propsInterface: 'AkunKeamananProps',
    keyProps: [],
    designSource: 'design/akun/AkunKeamanan.dc.html',
    description: 'Security settings (password change, 2FA)'
  },
  {
    id: 30,
    name: 'AkunNotifikasi',
    file: 'account/AkunNotifikasi.tsx',
    domain: 'account',
    milestone: 'M2',
    propsInterface: 'AkunNotifikasiProps',
    keyProps: [],
    designSource: 'design/akun/AkunNotifikasi.dc.html',
    description: 'Notification preferences toggles'
  },
  {
    id: 31,
    name: 'Obrolan',
    file: 'chat/Obrolan.tsx',
    domain: 'chat',
    milestone: 'M2',
    propsInterface: 'ObrolanProps',
    keyProps: [],
    designSource: 'design/obrolan/Obrolan.dc.html',
    description: 'Main chat inbox and active conversation layout'
  },
  {
    id: 32,
    name: 'ObrolanDetail',
    file: 'chat/ObrolanDetail.tsx',
    domain: 'chat',
    milestone: 'M2',
    propsInterface: 'ObrolanDetailProps',
    keyProps: ['percakapanId'],
    designSource: 'design/obrolan/ObrolanDetail.dc.html',
    description: 'Individual conversation view with message list & input'
  },
  {
    id: 33,
    name: 'DaftarObrolan',
    file: 'chat/DaftarObrolan.tsx',
    domain: 'chat',
    milestone: 'M2',
    propsInterface: 'DaftarObrolanProps',
    keyProps: ['obrolanList'],
    designSource: 'design/obrolan/DaftarObrolan.dc.html',
    description: 'Conversation threads list with online status & unread'
  },
  {
    id: 34,
    name: 'Percakapan',
    file: 'chat/Percakapan.tsx',
    domain: 'chat',
    milestone: 'M2',
    propsInterface: 'PercakapanProps',
    keyProps: ['pesanList'],
    designSource: 'design/obrolan/Percakapan.dc.html',
    description: 'Active chat header, product pin, and order context'
  },
  {
    id: 35,
    name: 'GelembungObrolan',
    file: 'chat/GelembungObrolan.tsx',
    domain: 'chat',
    milestone: 'M2',
    propsInterface: 'GelembungObrolanProps',
    keyProps: ['pesan'],
    designSource: 'design/obrolan/GelembungObrolan.dc.html',
    description: 'Chat message bubbles (text, photo, product, order card)'
  },
  {
    id: 36,
    name: 'Notifikasi',
    file: 'notifications/Notifikasi.tsx',
    domain: 'notifications',
    milestone: 'M2',
    propsInterface: 'NotifikasiProps',
    keyProps: ['notifikasiList'],
    designSource: 'design/notifikasi/Notifikasi.dc.html',
    description: 'Full notification center with category filtering'
  },
  {
    id: 37,
    name: 'Dompet',
    file: 'wallet/Dompet.tsx',
    domain: 'wallet',
    milestone: 'M2',
    propsInterface: 'DompetProps',
    keyProps: ['dompet'],
    designSource: 'design/dompet/Dompet.dc.html',
    description: 'Digital wallet with active balance & escrow breakdown'
  },

  // ==========================================
  // Milestone 3: Buyer Commerce, Cart-Recipe, Orders, Commitments & Checkout (18)
  // ==========================================
  {
    id: 38,
    name: 'KeranjangResep',
    file: 'cart-recipe/KeranjangResep.tsx',
    domain: 'cart-recipe',
    milestone: 'M3',
    propsInterface: 'KeranjangResepProps',
    keyProps: ['resepList'],
    designSource: 'design/keranjang-resep/KeranjangResep.dc.html',
    description: 'Smart recipe shopping list converter'
  },
  {
    id: 39,
    name: 'KeranjangResepIsi',
    file: 'cart-recipe/KeranjangResepIsi.tsx',
    domain: 'cart-recipe',
    milestone: 'M3',
    propsInterface: 'KeranjangResepIsiProps',
    keyProps: ['resep'],
    designSource: 'design/keranjang-resep/KeranjangResepIsi.dc.html',
    description: 'Shopping cart itemized list with quantities & totals'
  },
  {
    id: 40,
    name: 'KeranjangResepBaru',
    file: 'cart-recipe/KeranjangResepBaru.tsx',
    domain: 'cart-recipe',
    milestone: 'M3',
    propsInterface: 'KeranjangResepBaruProps',
    keyProps: [],
    designSource: 'design/keranjang-resep/KeranjangResepBaru.dc.html',
    description: 'Add new recipe bundle to cart modal'
  },
  {
    id: 41,
    name: 'KeranjangResepAlternatif',
    file: 'cart-recipe/KeranjangResepAlternatif.tsx',
    domain: 'cart-recipe',
    milestone: 'M3',
    propsInterface: 'KeranjangResepAlternatifProps',
    keyProps: ['alternatifList'],
    designSource: 'design/keranjang-resep/KeranjangResepAlternatif.dc.html',
    description: 'Smart substitute product recommendation drawer'
  },
  {
    id: 42,
    name: 'KeranjangItem',
    file: 'cart-recipe/KeranjangItem.tsx',
    domain: 'cart-recipe',
    milestone: 'M3',
    propsInterface: 'KeranjangItemProps',
    keyProps: ['item'],
    designSource: 'design/keranjang-resep/KeranjangItem.dc.html',
    description: 'Individual cart item row with batch & price floor tag'
  },
  {
    id: 43,
    name: 'Checkout',
    file: 'checkout/Checkout.tsx',
    domain: 'checkout',
    milestone: 'M3',
    propsInterface: 'CheckoutProps',
    keyProps: ['dataCheckout'],
    designSource: 'design/checkout/Checkout.dc.html',
    description: 'Delivery method, address, shipping fee, voucher checkout'
  },
  {
    id: 44,
    name: 'Bayar',
    file: 'checkout/Bayar.tsx',
    domain: 'checkout',
    milestone: 'M3',
    propsInterface: 'BayarProps',
    keyProps: ['tagihan'],
    designSource: 'design/checkout/Bayar.dc.html',
    description: 'Payment gateway selector (QRIS, VA, Escrow) with timer'
  },
  {
    id: 45,
    name: 'Pesanan',
    file: 'orders/Pesanan.tsx',
    domain: 'orders',
    milestone: 'M3',
    propsInterface: 'PesananProps',
    keyProps: ['pesananList'],
    designSource: 'design/pesanan/Pesanan.dc.html',
    description: 'Buyer orders list with status filter tabs'
  },
  {
    id: 46,
    name: 'PesananDetail',
    file: 'orders/PesananDetail.tsx',
    domain: 'orders',
    milestone: 'M3',
    propsInterface: 'PesananDetailProps',
    keyProps: ['pesanan'],
    designSource: 'design/pesanan/PesananDetail.dc.html',
    description: 'Order tracking, receipt, item breakdown, invoice'
  },
  {
    id: 47,
    name: 'Komplain',
    file: 'orders/Komplain.tsx',
    domain: 'orders',
    milestone: 'M3',
    propsInterface: 'KomplainProps',
    keyProps: ['pesananId'],
    designSource: 'design/pesanan/Komplain.dc.html',
    description: 'Buyer complaint submission form with proof upload'
  },
  {
    id: 48,
    name: 'KomplainDiajukan',
    file: 'orders/KomplainDiajukan.tsx',
    domain: 'orders',
    milestone: 'M3',
    propsInterface: 'KomplainDiajukanProps',
    keyProps: ['komplain'],
    designSource: 'design/pesanan/KomplainDiajukan.dc.html',
    description: 'Awaiting farmer response complaint state view'
  },
  {
    id: 49,
    name: 'KomplainDitanggapi',
    file: 'orders/KomplainDitanggapi.tsx',
    domain: 'orders',
    milestone: 'M3',
    propsInterface: 'KomplainDitanggapiProps',
    keyProps: ['komplain'],
    designSource: 'design/pesanan/KomplainDitanggapi.dc.html',
    description: 'Farmer response review & mediation request view'
  },
  {
    id: 50,
    name: 'Ulasan',
    file: 'orders/Ulasan.tsx',
    domain: 'orders',
    milestone: 'M3',
    propsInterface: 'UlasanProps',
    keyProps: ['pesananId', 'produkList'],
    designSource: 'design/pesanan/Ulasan.dc.html',
    description: 'Buyer product and merchant review form'
  },
  {
    id: 51,
    name: 'Komitmen',
    file: 'commitments/Komitmen.tsx',
    domain: 'commitments',
    milestone: 'M3',
    propsInterface: 'KomitmenProps',
    keyProps: ['komitmenList'],
    designSource: 'design/komitmen/Komitmen.dc.html',
    description: 'Buyer harvest pre-order commitments list'
  },
  {
    id: 52,
    name: 'KomitmenDetail',
    file: 'commitments/KomitmenDetail.tsx',
    domain: 'commitments',
    milestone: 'M3',
    propsInterface: 'KomitmenDetailProps',
    keyProps: ['komitmen'],
    designSource: 'design/komitmen/KomitmenDetail.dc.html',
    description: 'Commitment milestones, downpayment, harvest ETA'
  },
  {
    id: 53,
    name: 'KomitmenDetailTertunda',
    file: 'commitments/KomitmenDetailTertunda.tsx',
    domain: 'commitments',
    milestone: 'M3',
    propsInterface: 'KomitmenDetailTertundaProps',
    keyProps: ['komitmen'],
    designSource: 'design/komitmen/KomitmenDetailTertunda.dc.html',
    description: 'Postponed harvest notification & refund options'
  },
  {
    id: 54,
    name: 'Ikuti',
    file: 'waitlist-follow/Ikuti.tsx',
    domain: 'waitlist-follow',
    milestone: 'M3',
    propsInterface: 'IkutiProps',
    keyProps: ['waitlistFollowList'],
    designSource: 'design/ikuti/Ikuti.dc.html',
    description: 'Buyer harvest waitlist tracking and notifications'
  },
  {
    id: 55,
    name: 'Langganan',
    file: 'subscriptions/Langganan.tsx',
    domain: 'subscriptions',
    milestone: 'M3',
    propsInterface: 'LanggananProps',
    keyProps: ['langgananList'],
    designSource: 'design/langganan/Langganan.dc.html',
    description: 'Automated recurring produce subscription planner'
  },

  // ==========================================
  // Milestone 4: Farmer Portal (Toko) (37)
  // ==========================================
  {
    id: 56,
    name: 'Toko',
    file: 'toko/Toko.tsx',
    domain: 'toko',
    milestone: 'M4',
    propsInterface: 'TokoProps',
    keyProps: ['ringkasanToko'],
    designSource: 'design/toko/Toko.dc.html',
    description: 'Farmer portal dashboard overview (revenue, pending, stats)'
  },
  {
    id: 57,
    name: 'TokoNotifikasi',
    file: 'toko/TokoNotifikasi.tsx',
    domain: 'toko',
    milestone: 'M4',
    propsInterface: 'TokoNotifikasiProps',
    keyProps: ['notifikasiList'],
    designSource: 'design/toko/TokoNotifikasi.dc.html',
    description: 'Merchant notification hub with action triggers'
  },
  {
    id: 58,
    name: 'TokoVerifikasi',
    file: 'toko/TokoVerifikasi.tsx',
    domain: 'toko',
    milestone: 'M4',
    propsInterface: 'TokoVerifikasiProps',
    keyProps: ['statusVerifikasi'],
    designSource: 'design/toko/TokoVerifikasi.dc.html',
    description: 'KYC identity and land certificate verification wizard'
  },
  {
    id: 59,
    name: 'TokoLencana',
    file: 'toko/TokoLencana.tsx',
    domain: 'toko',
    milestone: 'M4',
    propsInterface: 'TokoLencanaProps',
    keyProps: ['kriteriaList'],
    designSource: 'design/toko/TokoLencana.dc.html',
    description: 'Farmer tier progression and badge criteria modal'
  },
  {
    id: 60,
    name: 'TokoLencanaAktif',
    file: 'toko/TokoLencanaAktif.tsx',
    domain: 'toko',
    milestone: 'M4',
    propsInterface: 'TokoLencanaAktifProps',
    keyProps: ['lencana'],
    designSource: 'design/toko/TokoLencanaAktif.dc.html',
    description: 'Active merchant badge display'
  },
  {
    id: 61,
    name: 'TokoAnalitik',
    file: 'toko/TokoAnalitik.tsx',
    domain: 'toko',
    milestone: 'M4',
    propsInterface: 'TokoAnalitikProps',
    keyProps: ['dataAnalitik'],
    designSource: 'design/toko/TokoAnalitik.dc.html',
    description: 'Sales conversion funnel and harvest demand analytics'
  },
  {
    id: 62,
    name: 'TokoProduk',
    file: 'toko/products/TokoProduk.tsx',
    domain: 'toko/products',
    milestone: 'M4',
    propsInterface: 'TokoProdukProps',
    keyProps: ['produkList'],
    designSource: 'design/toko/products/TokoProduk.dc.html',
    description: 'Farmer product catalog list with search and stock status'
  },
  {
    id: 63,
    name: 'TokoProdukDetail',
    file: 'toko/products/TokoProdukDetail.tsx',
    domain: 'toko/products',
    milestone: 'M4',
    propsInterface: 'TokoProdukDetailProps',
    keyProps: ['produk'],
    designSource: 'design/toko/products/TokoProdukDetail.dc.html',
    description: 'Product details, image gallery, batch breakdown'
  },
  {
    id: 64,
    name: 'TokoProdukBaru',
    file: 'toko/products/TokoProdukBaru.tsx',
    domain: 'toko/products',
    milestone: 'M4',
    propsInterface: 'TokoProdukBaruProps',
    keyProps: [],
    designSource: 'design/toko/products/TokoProdukBaru.dc.html',
    description: '3-step new product creation wizard'
  },
  {
    id: 65,
    name: 'TokoProdukUbah',
    file: 'toko/products/TokoProdukUbah.tsx',
    domain: 'toko/products',
    milestone: 'M4',
    propsInterface: 'TokoProdukUbahProps',
    keyProps: ['produkId'],
    designSource: 'design/toko/products/TokoProdukUbah.dc.html',
    description: 'Existing product edit form'
  },
  {
    id: 66,
    name: 'TokoProdukStok',
    file: 'toko/products/TokoProdukStok.tsx',
    domain: 'toko/products',
    milestone: 'M4',
    propsInterface: 'TokoProdukStokProps',
    keyProps: ['batchList'],
    designSource: 'design/toko/products/TokoProdukStok.dc.html',
    description: 'Stock batches manager with FEFO expiry tracking'
  },
  {
    id: 67,
    name: 'TokoStokBaru',
    file: 'toko/products/TokoStokBaru.tsx',
    domain: 'toko/products',
    milestone: 'M4',
    propsInterface: 'TokoStokBaruProps',
    keyProps: [],
    designSource: 'design/toko/products/TokoStokBaru.dc.html',
    description: 'Add new harvest stock batch modal'
  },
  {
    id: 68,
    name: 'TokoProdukSurplus',
    file: 'toko/products/TokoProdukSurplus.tsx',
    domain: 'toko/products',
    milestone: 'M4',
    propsInterface: 'TokoProdukSurplusProps',
    keyProps: ['aturanSurplus'],
    designSource: 'design/toko/products/TokoProdukSurplus.dc.html',
    description: '2-tier surplus discount rules & price floor guard'
  },
  {
    id: 69,
    name: 'TokoHargaGrosir',
    file: 'toko/products/TokoHargaGrosir.tsx',
    domain: 'toko/products',
    milestone: 'M4',
    propsInterface: 'TokoHargaGrosirProps',
    keyProps: ['tierList'],
    designSource: 'design/toko/products/TokoHargaGrosir.dc.html',
    description: 'Wholesale tier pricing based on volume (kg)'
  },
  {
    id: 70,
    name: 'TokoPesanan',
    file: 'toko/orders/TokoPesanan.tsx',
    domain: 'toko/orders',
    milestone: 'M4',
    propsInterface: 'TokoPesananProps',
    keyProps: ['pesananList'],
    designSource: 'design/toko/orders/TokoPesanan.dc.html',
    description: 'Farmer incoming orders queue with status tabs'
  },
  {
    id: 71,
    name: 'TokoPesananDetail',
    file: 'toko/orders/TokoPesananDetail.tsx',
    domain: 'toko/orders',
    milestone: 'M4',
    propsInterface: 'TokoPesananDetailProps',
    keyProps: ['pesanan'],
    designSource: 'design/toko/orders/TokoPesananDetail.dc.html',
    description: 'Order fulfillment, packing slip, shipping receipt'
  },
  {
    id: 72,
    name: 'TokoKomplain',
    file: 'toko/orders/TokoKomplain.tsx',
    domain: 'toko/orders',
    milestone: 'M4',
    propsInterface: 'TokoKomplainProps',
    keyProps: ['komplainList'],
    designSource: 'design/toko/orders/TokoKomplain.dc.html',
    description: 'Farmer dispute resolution portal'
  },
  {
    id: 73,
    name: 'TokoKomplainTerkirim',
    file: 'toko/orders/TokoKomplainTerkirim.tsx',
    domain: 'toko/orders',
    milestone: 'M4',
    propsInterface: 'TokoKomplainTerkirimProps',
    keyProps: [],
    designSource: 'design/toko/orders/TokoKomplainTerkirim.dc.html',
    description: 'Confirmation of merchant dispute response'
  },
  {
    id: 74,
    name: 'TokoDaftarTunggu',
    file: 'toko/waitlist/TokoDaftarTunggu.tsx',
    domain: 'toko/waitlist',
    milestone: 'M4',
    propsInterface: 'TokoDaftarTungguProps',
    keyProps: ['kampanyeList'],
    designSource: 'design/toko/waitlist/TokoDaftarTunggu.dc.html',
    description: 'Farmer crop waitlist campaigns list'
  },
  {
    id: 75,
    name: 'TokoDaftarTungguDetail',
    file: 'toko/waitlist/TokoDaftarTungguDetail.tsx',
    domain: 'toko/waitlist',
    milestone: 'M4',
    propsInterface: 'TokoDaftarTungguDetailProps',
    keyProps: ['kampanye'],
    designSource: 'design/toko/waitlist/TokoDaftarTungguDetail.dc.html',
    description: 'Waitlist campaign details, quota progress, stages'
  },
  {
    id: 76,
    name: 'TokoDaftarTungguBaru',
    file: 'toko/waitlist/TokoDaftarTungguBaru.tsx',
    domain: 'toko/waitlist',
    milestone: 'M4',
    propsInterface: 'TokoDaftarTungguBaruProps',
    keyProps: [],
    designSource: 'design/toko/waitlist/TokoDaftarTungguBaru.dc.html',
    description: 'Create new harvest campaign wizard'
  },
  {
    id: 77,
    name: 'TokoDaftarTungguUbah',
    file: 'toko/waitlist/TokoDaftarTungguUbah.tsx',
    domain: 'toko/waitlist',
    milestone: 'M4',
    propsInterface: 'TokoDaftarTungguUbahProps',
    keyProps: ['kampanyeId'],
    designSource: 'design/toko/waitlist/TokoDaftarTungguUbah.dc.html',
    description: 'Edit harvest campaign parameters'
  },
  {
    id: 78,
    name: 'TokoDaftarTungguJadwal',
    file: 'toko/waitlist/TokoDaftarTungguJadwal.tsx',
    domain: 'toko/waitlist',
    milestone: 'M4',
    propsInterface: 'TokoDaftarTungguJadwalProps',
    keyProps: ['kampanyeId'],
    designSource: 'design/toko/waitlist/TokoDaftarTungguJadwal.dc.html',
    description: 'Harvest date adjustment tool (postpone/advance)'
  },
  {
    id: 79,
    name: 'TokoDaftarTungguKabar',
    file: 'toko/waitlist/TokoDaftarTungguKabar.tsx',
    domain: 'toko/waitlist',
    milestone: 'M4',
    propsInterface: 'TokoDaftarTungguKabarProps',
    keyProps: ['kampanyeId'],
    designSource: 'design/toko/waitlist/TokoDaftarTungguKabar.dc.html',
    description: 'Farmer field condition and progress photo updater'
  },
  {
    id: 80,
    name: 'TokoDaftarTungguKomitmen',
    file: 'toko/waitlist/TokoDaftarTungguKomitmen.tsx',
    domain: 'toko/waitlist',
    milestone: 'M4',
    propsInterface: 'TokoDaftarTungguKomitmenProps',
    keyProps: ['komitmenList'],
    designSource: 'design/toko/waitlist/TokoDaftarTungguKomitmen.dc.html',
    description: 'List of committed buyers & harvest allocation'
  },
  {
    id: 81,
    name: 'TokoKeuangan',
    file: 'toko/finance/TokoKeuangan.tsx',
    domain: 'toko/finance',
    milestone: 'M4',
    propsInterface: 'TokoKeuanganProps',
    keyProps: ['keuangan'],
    designSource: 'design/toko/finance/TokoKeuangan.dc.html',
    description: 'Escrow balance, available funds, payout history'
  },
  {
    id: 82,
    name: 'TokoPenarikan',
    file: 'toko/finance/TokoPenarikan.tsx',
    domain: 'toko/finance',
    milestone: 'M4',
    propsInterface: 'TokoPenarikanProps',
    keyProps: ['saldoTersedia'],
    designSource: 'design/toko/finance/TokoPenarikan.dc.html',
    description: 'Bank withdrawal request form with fee calculator'
  },
  {
    id: 83,
    name: 'TokoLaporan',
    file: 'toko/finance/TokoLaporan.tsx',
    domain: 'toko/finance',
    milestone: 'M4',
    propsInterface: 'TokoLaporanProps',
    keyProps: ['laporanList'],
    designSource: 'design/toko/finance/TokoLaporan.dc.html',
    description: 'Monthly sales & financial CSV/PDF statements'
  },
  {
    id: 84,
    name: 'TokoUlasan',
    file: 'toko/reviews/TokoUlasan.tsx',
    domain: 'toko/reviews',
    milestone: 'M4',
    propsInterface: 'TokoUlasanProps',
    keyProps: ['ulasanList'],
    designSource: 'design/toko/reviews/TokoUlasan.dc.html',
    description: 'Merchant customer review moderation & replies'
  },
  {
    id: 85,
    name: 'TokoObrolan',
    file: 'toko/chat/TokoObrolan.tsx',
    domain: 'toko/chat',
    milestone: 'M4',
    propsInterface: 'TokoObrolanProps',
    keyProps: ['obrolanList'],
    designSource: 'design/toko/chat/TokoObrolan.dc.html',
    description: 'Merchant CS inbox with unread counts and quick reply'
  },
  {
    id: 86,
    name: 'TokoObrolanDetail',
    file: 'toko/chat/TokoObrolanDetail.tsx',
    domain: 'toko/chat',
    milestone: 'M4',
    propsInterface: 'TokoObrolanDetailProps',
    keyProps: ['percakapanId'],
    designSource: 'design/toko/chat/TokoObrolanDetail.dc.html',
    description: 'Active chat with customer, order context, custom offers'
  },
  {
    id: 87,
    name: 'TokoPengaturan',
    file: 'toko/settings/TokoPengaturan.tsx',
    domain: 'toko/settings',
    milestone: 'M4',
    propsInterface: 'TokoPengaturanProps',
    keyProps: [],
    designSource: 'design/toko/settings/TokoPengaturan.dc.html',
    description: 'Store settings navigation hub'
  },
  {
    id: 88,
    name: 'TokoPengaturanProfil',
    file: 'toko/settings/TokoPengaturanProfil.tsx',
    domain: 'toko/settings',
    milestone: 'M4',
    propsInterface: 'TokoPengaturanProfilProps',
    keyProps: ['profil'],
    designSource: 'design/toko/settings/TokoPengaturanProfil.dc.html',
    description: 'Farm name, bio, photo, farm location settings'
  },
  {
    id: 89,
    name: 'TokoPengaturanRekening',
    file: 'toko/settings/TokoPengaturanRekening.tsx',
    domain: 'toko/settings',
    milestone: 'M4',
    propsInterface: 'TokoPengaturanRekeningProps',
    keyProps: ['rekening'],
    designSource: 'design/toko/settings/TokoPengaturanRekening.dc.html',
    description: 'Merchant bank account configuration'
  },
  {
    id: 90,
    name: 'TokoPengaturanJam',
    file: 'toko/settings/TokoPengaturanJam.tsx',
    domain: 'toko/settings',
    milestone: 'M4',
    propsInterface: 'TokoPengaturanJamProps',
    keyProps: ['jadwal'],
    designSource: 'design/toko/settings/TokoPengaturanJam.dc.html',
    description: 'Store operational hours and holiday mode toggles'
  },
  {
    id: 91,
    name: 'TokoPengaturanKirim',
    file: 'toko/settings/TokoPengaturanKirim.tsx',
    domain: 'toko/settings',
    milestone: 'M4',
    propsInterface: 'TokoPengaturanKirimProps',
    keyProps: ['opsiKirim'],
    designSource: 'design/toko/settings/TokoPengaturanKirim.dc.html',
    description: 'Delivery methods and logistics courier toggles'
  },
  {
    id: 92,
    name: 'TokoPengaturanOtomatis',
    file: 'toko/settings/TokoPengaturanOtomatis.tsx',
    domain: 'toko/settings',
    milestone: 'M4',
    propsInterface: 'TokoPengaturanOtomatisProps',
    keyProps: ['aturan'],
    designSource: 'design/toko/settings/TokoPengaturanOtomatis.dc.html',
    description: 'Auto-accept order rules and stock thresholds'
  },

  // ==========================================
  // Milestone 5: Verification & Integration Gate (1)
  // ==========================================
  {
    id: 93,
    name: 'BuildAndLintGate',
    file: 'N/A',
    domain: 'verification',
    milestone: 'M5',
    propsInterface: 'N/A',
    keyProps: [],
    designSource: 'N/A',
    description: 'Build & Lint Gate verification: npm run build & npm run lint exit code 0'
  }
];

export const DOMAINS = [
  'common',
  'layout',
  'auth',
  'account',
  'cart-recipe',
  'checkout',
  'orders',
  'commitments',
  'waitlist-follow',
  'subscriptions',
  'chat',
  'notifications',
  'wallet',
  'toko'
];

export const TOKO_SUBDOMAINS = [
  'products',
  'orders',
  'waitlist',
  'finance',
  'reviews',
  'chat',
  'settings'
];
