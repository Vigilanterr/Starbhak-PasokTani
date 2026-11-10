import type { TipeStatus } from '../common/ChipStatus';

export type RoleChat = 'pembeli' | 'petani';
export type PeranObrolan = RoleChat;

export type KeadaanKoneksi = 'normal' | 'gagal' | 'putus';
export type KeadaanObrolan = KeadaanKoneksi;

export type JenisPesanChat = 'teks' | 'foto' | 'produk' | 'pesanan' | 'hari' | 'sistem';
export type StatusKirimPesan = 'mengirim' | 'terkirim' | 'dibaca' | 'gagal';
export type StatusPesanChat = StatusKirimPesan;

export type ArahPesan = 'saya' | 'lawan';
export type ArahPesanChat = ArahPesan;

export interface PesanProdukContext {
  id?: string;
  nama: string;
  harga: string | number;
  href: string;
  fotoUrl?: string;
}
export type ProdukPesanChat = PesanProdukContext;

export interface PesanPesananContext {
  id?: string;
  no: string;
  status: TipeStatus | string;
  ringkas: string;
  href: string;
}
export type PesananPesanChat = PesanPesananContext;

export interface PesanChat {
  id?: string;
  jenis: JenisPesanChat;
  dari?: ArahPesan;
  siapa?: string;
  teks?: string;
  waktu?: string;
  status?: StatusKirimPesan;
  jumlahFoto?: number;
  fotoUrls?: string[];
  fotoList?: string[];
  produk?: PesanProdukContext;
  pesanan?: PesanPesananContext;
  ulang?: () => void;
  hapus?: () => void;
}

export interface ObrolanListItem {
  id: string;
  nama: string;
  sub: string;
  terakhir: string;
  waktu: string;
  belum: number;
  unreadCount?: number;
  cepat?: boolean;
  menit?: number;
  avatarUrl?: string;
  inisial?: string;
  href?: string;
}
export type RingkasanObrolan = ObrolanListItem;

export interface BalasanCepatItem {
  judul: string;
  isi: string;
}

export interface ObrolanProps {
  kosong?: boolean;
  peran?: RoleChat;
  daftar?: ObrolanListItem[];
  onPilih?: (id: string) => void;
  onPilihObrolan?: (id: string) => void;
  className?: string;
}

export interface DaftarObrolanProps {
  peran?: RoleChat;
  aktif?: string;
  sempit?: boolean;
  kosong?: boolean;
  lewat?: boolean;
  daftar?: ObrolanListItem[];
  obrolanList?: RingkasanObrolan[];
  onPilih?: (id: string) => void;
  onCari?: (query: string) => void;
  className?: string;
}

export interface PercakapanProps {
  peran?: RoleChat;
  keadaan?: KeadaanKoneksi;
  sheet?: boolean;
  sempit?: boolean;
  lawanNama?: string;
  lawanSub?: string;
  lawanOnline?: boolean;
  lawanTerverifikasi?: boolean;
  lawanAndalan?: boolean;
  menitTunggu?: number;
  hrefPesanan?: string;
  hrefKembali?: string;
  daftarPesan?: PesanChat[];
  pesanList?: PesanChat[];
  balasanCepatList?: BalasanCepatItem[];
  onKirim?: (teks: string, lampiran?: File) => Promise<void> | void;
  onBalasanCepat?: (teks: string) => void;
  onTempelProduk?: (produk: PesanProdukContext) => void;
  onTempelPesanan?: (pesanan: PesanPesananContext) => void;
  onSambungUlang?: () => void;
  onKirimUlang?: (pesanId: string) => void;
  onKirimUlangPesan?: (pesanId: string) => void;
  onHapusPesan?: (pesanId: string) => void;
  className?: string;
}

export interface GelembungObrolanProps {
  pesan?: PesanChat;
  onKirimUlang?: (pesan: PesanChat) => void;
  onHapus?: (pesan: PesanChat) => void;
  className?: string;
}

export interface ObrolanDetailProps {
  conversationId?: string;
  percakapanId?: string;
  keadaan?: KeadaanKoneksi;
  peran?: RoleChat;
  lawanNama?: string;
  lawanOnline?: boolean;
  daftarObrolan?: ObrolanListItem[];
  daftarPesan?: PesanChat[];
  percakapanProps?: Partial<PercakapanProps>;
  onPilihObrolan?: (id: string) => void;
  className?: string;
}

export interface SseChatMessageEvent {
  id: string;
  conversationId: string;
  siapa: string;
  dari: ArahPesan;
  jenis: JenisPesanChat;
  teks?: string;
  waktu: string;
  status: StatusKirimPesan;
  jumlahFoto?: number;
  fotoUrls?: string[];
  produk?: PesanProdukContext;
  pesanan?: PesanPesananContext;
}

export interface SseChatStatusEvent {
  messageId: string;
  status: StatusKirimPesan;
  waktu: string;
}

export interface SseChatPresenceEvent {
  userId: string;
  online: boolean;
  terakhirAktif?: string;
}

export interface SseChatSlaEvent {
  conversationId: string;
  menit: number;
  sisa: number;
  overdue: boolean;
}
