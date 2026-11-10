/** Wilayah MVP: Jawa Barat saja. `nilai` dipakai juga sebagai filter URL (?kabupaten=...). */
export const WILAYAH_JAWA_BARAT = [
  ...[
    "Bandung", "Bandung Barat", "Bekasi", "Bogor", "Ciamis", "Cianjur",
    "Cirebon", "Garut", "Indramayu", "Karawang", "Kuningan", "Majalengka",
    "Pangandaran", "Purwakarta", "Subang", "Sukabumi", "Sumedang", "Tasikmalaya",
  ].map((nama) => ({
    nilai: `kabupaten-${nama.toLowerCase().replaceAll(" ", "-")}`,
    label: `Kabupaten ${nama}`,
  })),
  ...[
    "Bandung", "Banjar", "Bekasi", "Bogor", "Cimahi",
    "Cirebon", "Depok", "Sukabumi", "Tasikmalaya",
  ].map((nama) => ({
    nilai: `kota-${nama.toLowerCase().replaceAll(" ", "-")}`,
    label: `Kota ${nama}`,
  })),
];
