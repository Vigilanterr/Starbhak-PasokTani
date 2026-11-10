# Test Infrastructure & Dual-Track E2E Verification Specification

## 1. Overview & Dual-Track Principles

The **Starbhak-PasokTani** project utilizes a **Dual-Track Testing Architecture** to guarantee absolute visual, architectural, and type fidelity across all 92 React components and release gates defined in `ORIGINAL_REQUEST.md` and `PROJECT.md`.

### Dual-Track Architecture
```
┌────────────────────────────────────────────────────────┐
│                      REQUIREMENTS                      │
│            ORIGINAL_REQUEST.md & PROJECT.md            │
└───────────────────────────┬────────────────────────────┘
                            │
            ┌───────────────┴───────────────┐
            ▼                               ▼
┌───────────────────────┐       ┌───────────────────────┐
│        TRACK A        │       │        TRACK B        │
│  Implementation Track │       │   Verification Track  │
│                       │       │                       │
│  • M1: Common & Layout│       │  • Requirement-driven │
│  • M2: Auth & Account │       │  • Opaque-box testing │
│  • M3: Commerce & Cart│       │  • 4-Tier methodology │
│  • M4: Toko (Farmer)  │       │  • Plain Design Guard │
│  • M5: Production Gate│       │  • Progressive Gating │
└───────────┬───────────┘       └───────────┬───────────┘
            │                               │
            └───────────────┬───────────────┘
                            ▼
              ┌───────────────────────────┐
              │  Automated Verification   │
              │  ./scripts/run_e2e_tests  │
              └───────────────────────────┘
```

1. **Track A (Implementation Track)**: Implementers develop components milestone-by-milestone (`M1` through `M4`) under `frontend/src/components/`, strictly adhering to component paths and design requirements.
2. **Track B (Verification Track)**: An independent, requirement-driven, opaque-box test harness verifies that components satisfy all acceptance criteria without circular bias or facade testing.
3. **Progressive Testability**: Tests are runnable incrementally per milestone (`--milestone M1`, `--milestone M2`, etc.) using only features from completed milestones, or holistically across all milestones with progressive status reporting.
4. **Zero Production Interference**: Test harnesses and test runners reside outside `frontend/src/` (in `test/` and `scripts/`), preserving clean production builds and avoiding test artifacts in bundled code.

---

## 2. The 4-Tier Testing Methodology

The verification suite evaluates every component and system gate across four ascending tiers:

### Tier 1: Feature Coverage (Smoke & Component Completeness)
- **Objective**: Ensure 100% of the 92 inventoried component files exist at their authoritative file paths under `frontend/src/components/`.
- **Validation Criteria**:
  - Target file exists (e.g. `frontend/src/components/common/ChipStatus.tsx`).
  - File exports the designated React component (default export or named export matching component identifier).
  - Component returns valid TSX/JSX render markup.

### Tier 2: Boundary & Corner Cases (API Data Injection & Plain Design Guard)
- **Objective**: Ensure components accept typed props for API data injection, handle edge parameters, and strictly adhere to the plain design constraint.
- **Validation Criteria**:
  - **TypeScript Props Interface**: Component defines and exports a typed interface/type (e.g., `ChipStatusProps`, `TokoProdukProps`) for API data injection.
  - **Key Prop Parameters**: Component exposes the expected parameters derived from the design (e.g., `status`, `nilai`, `langkahList`, `profil`, `resepList`, `kampanyeList`).
  - **Strict Plain Design Guard**: Scans code for forbidden animation tokens. Replicating the plain design requirement, zero animations or transitions are permitted:
    - No Tailwind animation utilities: `animate-*`, `transition-*`, `transition`, `duration-*`, `ease-*`, `delay-*`.
    - No native CSS animation keywords: `@keyframes`, `animation:`, `animation-name:`, `animation-duration:`.
    - No external motion libraries: `framer-motion`, `lottie-react`, `lottie-web`, `gsap`, `react-spring`.
  - **Adversarial & Boundary Verification**: Exercises currency formatting (`Rp 180.000`), rating bounds clamping (0 to 5), and scanner sensitivity.

### Tier 3: Cross-Feature Architecture & Directory Layout Compliance
- **Objective**: Enforce clean folder organization, domain separation, and layout compliance as mandated by `ORIGINAL_REQUEST.md` (R2) and `PROJECT.md` § Code Layout.
- **Validation Criteria**:
  - Every component is organized into its domain folder under `frontend/src/components/`:
    `common/`, `layout/`, `auth/`, `account/`, `cart-recipe/`, `checkout/`, `orders/`, `commitments/`, `waitlist-follow/`, `subscriptions/`, `chat/`, `notifications/`, `wallet/`, `toko/`.
  - No loose `.tsx` or `.ts` component files directly in `frontend/src/components/` root.
  - `toko/` merchant portal strictly follows the 7 sub-modules: `products/`, `orders/`, `waitlist/`, `finance/`, `reviews/`, `chat/`, `settings/`.

### Tier 4: Real-World Scenarios & Release Gates
- **Objective**: Real build and lint verification in the actual production toolchain.
- **Validation Criteria**:
  - **Lint Gate**: `npm --prefix frontend run lint` executes with exit code 0 and 0 errors.
  - **Build Gate**: `npm --prefix frontend run build` executes with exit code 0, verifying Turbopack compilation and Next.js static/dynamic route optimization without errors.

---

## 3. Authoritative Feature Inventory (93 Items)

| # | Feature / Component | Relative Path | Domain | Milestone | Props Interface | Key Props |
|---|---------------------|---------------|--------|-----------|-----------------|-----------|
| 1 | ChipStatus | `common/ChipStatus.tsx` | common | M1 | `ChipStatusProps` | status |
| 2 | Bintang | `common/Bintang.tsx` | common | M1 | `BintangProps` | nilai |
| 3 | UnggahFoto | `common/UnggahFoto.tsx` | common | M1 | `UnggahFotoProps` | (callbacks/optional) |
| 4 | LangkahWizard | `common/LangkahWizard.tsx` | common | M1 | `LangkahWizardProps` | langkah, langkahAktif |
| 5 | KartuAngka | `common/KartuAngka.tsx` | common | M1 | `KartuAngkaProps` | label, nilai |
| 6 | Grafik | `common/Grafik.tsx` | common | M1 | `GrafikProps` | data |
| 7 | JalurStatus | `common/JalurStatus.tsx` | common | M1 | `JalurStatusProps` | langkahList |
| 8 | JalurKomplain | `common/JalurKomplain.tsx` | common | M1 | `JalurKomplainProps` | tahap |
| 9 | BarisNotifikasi | `common/BarisNotifikasi.tsx` | common | M1 | `BarisNotifikasiProps` | notifikasi |
| 10 | SiteHeader | `layout/SiteHeader.tsx` | layout | M1 | `SiteHeaderProps` | (header nav props) |
| 11 | SiteFooter | `layout/SiteFooter.tsx` | layout | M1 | `SiteFooterProps` | (className) |
| 12 | NavBawah | `layout/NavBawah.tsx` | layout | M1 | `NavBawahProps` | ruteAktif |
| 13 | TokoAtas | `layout/TokoAtas.tsx` | layout | M1 | `TokoAtasProps` | toko |
| 14 | TokoSamping | `layout/TokoSamping.tsx` | layout | M1 | `TokoSampingProps` | ruteAktif |
| 15 | TokoNavBawah | `layout/TokoNavBawah.tsx` | layout | M1 | `TokoNavBawahProps` | ruteAktif |
| 16 | AkunMenu | `layout/AkunMenu.tsx` | layout | M1 | `AkunMenuProps` | tabAktif |
| 17 | AuthHeader | `layout/AuthHeader.tsx` | layout | M1 | `AuthHeaderProps` | (minimal auth) |
| 18 | AuthPanel | `layout/AuthPanel.tsx` | layout | M1 | `AuthPanelProps` | judul, subtitel |
| 19 | Masuk | `auth/Masuk.tsx` | auth | M2 | `MasukProps` | (login form) |
| 20 | Daftar | `auth/Daftar.tsx` | auth | M2 | `DaftarProps` | (role picker) |
| 21 | DaftarPetani | `auth/DaftarPetani.tsx` | auth | M2 | `DaftarPetaniProps` | (farmer fields) |
| 22 | DaftarPembeli | `auth/DaftarPembeli.tsx` | auth | M2 | `DaftarPembeliProps` | (buyer fields) |
| 23 | LupaSandi | `auth/LupaSandi.tsx` | auth | M2 | `LupaSandiProps` | (reset form) |
| 24 | AturUlangSandi | `auth/AturUlangSandi.tsx` | auth | M2 | `AturUlangSandiProps` | (confirm password) |
| 25 | Akun | `account/Akun.tsx` | account | M2 | `AkunProps` | (dashboard stats) |
| 26 | AkunProfil | `account/AkunProfil.tsx` | account | M2 | `AkunProfilProps` | profil |
| 27 | AkunAlamat | `account/AkunAlamat.tsx` | account | M2 | `AkunAlamatProps` | alamatList |
| 28 | AlamatForm | `account/AlamatForm.tsx` | account | M2 | `AlamatFormProps` | (address form) |
| 29 | AkunKeamanan | `account/AkunKeamanan.tsx` | account | M2 | `AkunKeamananProps` | (security settings) |
| 30 | AkunNotifikasi | `account/AkunNotifikasi.tsx` | account | M2 | `AkunNotifikasiProps` | (preferences) |
| 31 | Obrolan | `chat/Obrolan.tsx` | chat | M2 | `ObrolanProps` | (chat shell) |
| 32 | ObrolanDetail | `chat/ObrolanDetail.tsx` | chat | M2 | `ObrolanDetailProps` | percakapanId |
| 33 | DaftarObrolan | `chat/DaftarObrolan.tsx` | chat | M2 | `DaftarObrolanProps` | obrolanList |
| 34 | Percakapan | `chat/Percakapan.tsx` | chat | M2 | `PercakapanProps` | pesanList |
| 35 | GelembungObrolan | `chat/GelembungObrolan.tsx` | chat | M2 | `GelembungObrolanProps` | pesan |
| 36 | Notifikasi | `notifications/Notifikasi.tsx` | notifications | M2 | `NotifikasiProps` | notifikasiList |
| 37 | Dompet | `wallet/Dompet.tsx` | wallet | M2 | `DompetProps` | dompet |
| 38 | KeranjangResep | `cart-recipe/KeranjangResep.tsx` | cart-recipe | M3 | `KeranjangResepProps` | resepList |
| 39 | KeranjangResepIsi | `cart-recipe/KeranjangResepIsi.tsx` | cart-recipe | M3 | `KeranjangResepIsiProps` | resep |
| 40 | KeranjangResepBaru | `cart-recipe/KeranjangResepBaru.tsx` | cart-recipe | M3 | `KeranjangResepBaruProps` | (bundle modal) |
| 41 | KeranjangResepAlternatif | `cart-recipe/KeranjangResepAlternatif.tsx` | cart-recipe | M3 | `KeranjangResepAlternatifProps` | alternatifList |
| 42 | KeranjangItem | `cart-recipe/KeranjangItem.tsx` | cart-recipe | M3 | `KeranjangItemProps` | item |
| 43 | Checkout | `checkout/Checkout.tsx` | checkout | M3 | `CheckoutProps` | dataCheckout |
| 44 | Bayar | `checkout/Bayar.tsx` | checkout | M3 | `BayarProps` | tagihan |
| 45 | Pesanan | `orders/Pesanan.tsx` | orders | M3 | `PesananProps` | pesananList |
| 46 | PesananDetail | `orders/PesananDetail.tsx` | orders | M3 | `PesananDetailProps` | pesanan |
| 47 | Komplain | `orders/Komplain.tsx` | orders | M3 | `KomplainProps` | pesananId |
| 48 | KomplainDiajukan | `orders/KomplainDiajukan.tsx` | orders | M3 | `KomplainDiajukanProps` | komplain |
| 49 | KomplainDitanggapi | `orders/KomplainDitanggapi.tsx` | orders | M3 | `KomplainDitanggapiProps` | komplain |
| 50 | Ulasan | `orders/Ulasan.tsx` | orders | M3 | `UlasanProps` | pesananId, produkList |
| 51 | Komitmen | `commitments/Komitmen.tsx` | commitments | M3 | `KomitmenProps` | komitmenList |
| 52 | KomitmenDetail | `commitments/KomitmenDetail.tsx` | commitments | M3 | `KomitmenDetailProps` | komitmen |
| 53 | KomitmenDetailTertunda | `commitments/KomitmenDetailTertunda.tsx` | commitments | M3 | `KomitmenDetailTertundaProps` | komitmen |
| 54 | Ikuti | `waitlist-follow/Ikuti.tsx` | waitlist-follow | M3 | `IkutiProps` | waitlistFollowList |
| 55 | Langganan | `subscriptions/Langganan.tsx` | subscriptions | M3 | `LanggananProps` | langgananList |
| 56 | Toko | `toko/Toko.tsx` | toko | M4 | `TokoProps` | ringkasanToko |
| 57 | TokoNotifikasi | `toko/TokoNotifikasi.tsx` | toko | M4 | `TokoNotifikasiProps` | notifikasiList |
| 58 | TokoVerifikasi | `toko/TokoVerifikasi.tsx` | toko | M4 | `TokoVerifikasiProps` | statusVerifikasi |
| 59 | TokoLencana | `toko/TokoLencana.tsx` | toko | M4 | `TokoLencanaProps` | kriteriaList |
| 60 | TokoLencanaAktif | `toko/TokoLencanaAktif.tsx` | toko | M4 | `TokoLencanaAktifProps` | lencana |
| 61 | TokoAnalitik | `toko/TokoAnalitik.tsx` | toko | M4 | `TokoAnalitikProps` | dataAnalitik |
| 62 | TokoProduk | `toko/products/TokoProduk.tsx` | toko/products | M4 | `TokoProdukProps` | produkList |
| 63 | TokoProdukDetail | `toko/products/TokoProdukDetail.tsx` | toko/products | M4 | `TokoProdukDetailProps` | produk |
| 64 | TokoProdukBaru | `toko/products/TokoProdukBaru.tsx` | toko/products | M4 | `TokoProdukBaruProps` | (wizard steps) |
| 65 | TokoProdukUbah | `toko/products/TokoProdukUbah.tsx` | toko/products | M4 | `TokoProdukUbahProps` | produkId |
| 66 | TokoProdukStok | `toko/products/TokoProdukStok.tsx` | toko/products | M4 | `TokoProdukStokProps` | batchList |
| 67 | TokoStokBaru | `toko/products/TokoStokBaru.tsx` | toko/products | M4 | `TokoStokBaruProps` | (new batch modal) |
| 68 | TokoProdukSurplus | `toko/products/TokoProdukSurplus.tsx` | toko/products | M4 | `TokoProdukSurplusProps` | aturanSurplus |
| 69 | TokoHargaGrosir | `toko/products/TokoHargaGrosir.tsx` | toko/products | M4 | `TokoHargaGrosirProps` | tierList |
| 70 | TokoPesanan | `toko/orders/TokoPesanan.tsx` | toko/orders | M4 | `TokoPesananProps` | pesananList |
| 71 | TokoPesananDetail | `toko/orders/TokoPesananDetail.tsx` | toko/orders | M4 | `TokoPesananDetailProps` | pesanan |
| 72 | TokoKomplain | `toko/orders/TokoKomplain.tsx` | toko/orders | M4 | `TokoKomplainProps` | komplainList |
| 73 | TokoKomplainTerkirim | `toko/orders/TokoKomplainTerkirim.tsx` | toko/orders | M4 | `TokoKomplainTerkirimProps` | (response confirm) |
| 74 | TokoDaftarTunggu | `toko/waitlist/TokoDaftarTunggu.tsx` | toko/waitlist | M4 | `TokoDaftarTungguProps` | kampanyeList |
| 75 | TokoDaftarTungguDetail | `toko/waitlist/TokoDaftarTungguDetail.tsx` | toko/waitlist | M4 | `TokoDaftarTungguDetailProps` | kampanye |
| 76 | TokoDaftarTungguBaru | `toko/waitlist/TokoDaftarTungguBaru.tsx` | toko/waitlist | M4 | `TokoDaftarTungguBaruProps` | (campaign wizard) |
| 77 | TokoDaftarTungguUbah | `toko/waitlist/TokoDaftarTungguUbah.tsx` | toko/waitlist | M4 | `TokoDaftarTungguUbahProps` | kampanyeId |
| 78 | TokoDaftarTungguJadwal | `toko/waitlist/TokoDaftarTungguJadwal.tsx` | toko/waitlist | M4 | `TokoDaftarTungguJadwalProps` | kampanyeId |
| 79 | TokoDaftarTungguKabar | `toko/waitlist/TokoDaftarTungguKabar.tsx` | toko/waitlist | M4 | `TokoDaftarTungguKabarProps` | kampanyeId |
| 80 | TokoDaftarTungguKomitmen | `toko/waitlist/TokoDaftarTungguKomitmen.tsx` | toko/waitlist | M4 | `TokoDaftarTungguKomitmenProps` | komitmenList |
| 81 | TokoKeuangan | `toko/finance/TokoKeuangan.tsx` | toko/finance | M4 | `TokoKeuanganProps` | keuangan |
| 82 | TokoPenarikan | `toko/finance/TokoPenarikan.tsx` | toko/finance | M4 | `TokoPenarikanProps` | saldoTersedia |
| 83 | TokoLaporan | `toko/finance/TokoLaporan.tsx` | toko/finance | M4 | `TokoLaporanProps` | laporanList |
| 84 | TokoUlasan | `toko/reviews/TokoUlasan.tsx` | toko/reviews | M4 | `TokoUlasanProps` | ulasanList |
| 85 | TokoObrolan | `toko/chat/TokoObrolan.tsx` | toko/chat | M4 | `TokoObrolanProps` | obrolanList |
| 86 | TokoObrolanDetail | `toko/chat/TokoObrolanDetail.tsx` | toko/chat | M4 | `TokoObrolanDetailProps` | percakapanId |
| 87 | TokoPengaturan | `toko/settings/TokoPengaturan.tsx` | toko/settings | M4 | `TokoPengaturanProps` | (settings menu) |
| 88 | TokoPengaturanProfil | `toko/settings/TokoPengaturanProfil.tsx` | toko/settings | M4 | `TokoPengaturanProfilProps` | profil |
| 89 | TokoPengaturanRekening | `toko/settings/TokoPengaturanRekening.tsx` | toko/settings | M4 | `TokoPengaturanRekeningProps` | rekening |
| 90 | TokoPengaturanJam | `toko/settings/TokoPengaturanJam.tsx` | toko/settings | M4 | `TokoPengaturanJamProps` | jadwal |
| 91 | TokoPengaturanKirim | `toko/settings/TokoPengaturanKirim.tsx` | toko/settings | M4 | `TokoPengaturanKirimProps` | opsiKirim |
| 92 | TokoPengaturanOtomatis | `toko/settings/TokoPengaturanOtomatis.tsx` | toko/settings | M4 | `TokoPengaturanOtomatisProps` | aturan |
| 93 | Build & Lint Gate | `N/A` | verification | M5 | `N/A` | `npm run build`, `npm run lint` |

---

## 4. Test Runner Usage & CLI Commands

### Basic Execution
```bash
# Run all tests in progressive mode (runs all 4 tiers)
node test/run_all_tests.mjs

# Or via wrapper script
./scripts/run_e2e_tests.sh
```

### Targeted Milestone Verification
```bash
# Verify Milestone 1 (Common & Layout)
node test/run_all_tests.mjs --milestone M1

# Verify Milestone 2 (Auth, Account, Chat, Notifications, Wallet)
node test/run_all_tests.mjs --milestone M2

# Verify Milestone 3 (Commerce, Recipes, Orders, Commitments, Checkout)
node test/run_all_tests.mjs --milestone M3

# Verify Milestone 4 (Toko Merchant Operations)
node test/run_all_tests.mjs --milestone M4

# Verify Milestone 5 (Build and Lint Gate)
node test/run_all_tests.mjs --milestone M5
```

### Tier-Specific Execution
```bash
# Run Tier 1 (Component completeness) only
node test/run_all_tests.mjs --tier 1

# Run Tier 2 (Props interface & Strict Plain Design Guard) only
node test/run_all_tests.mjs --tier 2

# Run Tier 3 (Directory structure & domain layout) only
node test/run_all_tests.mjs --tier 3

# Run Tier 4 (Build & Lint gates) only
node test/run_all_tests.mjs --tier 4
```

### Modes & Fast Development Flags
```bash
# Strict mode: fails if ANY of the 92 components is missing
node test/run_all_tests.mjs --strict

# Skip slow build/lint checks during component iteration
node test/run_all_tests.mjs --skip-build --skip-lint

# Machine-readable JSON output for CI pipelines
node test/run_all_tests.mjs --json
```

---

## 5. Acceptance Criteria Traceability Matrix

| Original Request Criterion | Automated Verification Suite | Result Method |
|---|---|---|
| **All components from design/ implemented** | `test/tier1_feature_coverage.mjs` | Verifies existence of all 92 components at exact paths |
| **Clean folder structure under frontend/src/components/** | `test/tier3_cross_feature.mjs` | Verifies 13 domain folders, 7 toko subdomains, 0 loose root files |
| **Strict plain design (NO animations or keyframes)** | `test/tier2_boundary_corner.mjs` | AST & regex scan for `animate-*`, `transition-*`, `@keyframes`, motion libs |
| **Typed props (TypeScript interfaces) for API injection** | `test/tier2_boundary_corner.mjs` | Verifies exported interface and key API parameter bindings |
| **Build verification (`npm run build` 0 errors)** | `test/tier4_real_world_gates.mjs` | Executes `npm --prefix frontend run build`, asserts exit code 0 |
| **Lint verification (`npm run lint` 0 errors)** | `test/tier4_real_world_gates.mjs` | Executes `npm --prefix frontend run lint`, asserts exit code 0 |
