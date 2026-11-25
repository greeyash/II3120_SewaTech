import { Asset } from 'expo-asset';
import { Platform, type ImageSourcePropType } from 'react-native';

export type Category = 'Kamera' | 'Laptop' | 'Gaming' | 'Audio' | 'Drone' | 'Tablet';

export const CATEGORIES: { key: Category | 'Semua'; icon: string }[] = [
  { key: 'Semua', icon: 'apps' },
  { key: 'Kamera', icon: 'camera' },
  { key: 'Laptop', icon: 'laptop' },
  { key: 'Gaming', icon: 'game-controller' },
  { key: 'Audio', icon: 'headset' },
  { key: 'Tablet', icon: 'tablet-portrait' },
  { key: 'Drone', icon: 'airplane' },
];

export type Owner = {
  id: string;
  name: string;
  rating: number;
  rentals: number;
  area: string;
  responseTime: string;
  online: boolean;
};

export type Item = {
  id: string;
  name: string;
  /** Nama pendek untuk kartu ringkasan (pesanan, pembayaran, chat). */
  shortName: string;
  category: Category;
  pricePerDay: number;
  appraisal: number; // nilai taksir, dasar perhitungan deposit
  image: ImageSourcePropType;
  /** Foto tambahan (belakang, atas, kelengkapan). */
  extraPhotos?: ImageSourcePropType[];
  ownerId: string;
  distanceKm: number;
  rating: number;
  reviews: number;
  specs: { icon: string; label: string; value: string }[];
  condition: string;
  terms: string[];
  bookedOffsets: number[]; // hari ke-n dari hari ini yang sudah disewa
  isNew?: boolean;
  status?: 'kurasi' | 'tayang' | 'ditolak';
  localPhotos?: string[];
};

export const OWNERS: Owner[] = [
  { id: 'o1', name: 'Lensa Bandung', rating: 4.9, rentals: 212, area: 'Coblong, Bandung', responseTime: '± 5 menit', online: true },
  { id: 'o2', name: 'Raka Gadget', rating: 4.7, rentals: 86, area: 'Dago, Bandung', responseTime: '± 15 menit', online: true },
  { id: 'o3', name: 'Main Terus Rental', rating: 4.8, rentals: 143, area: 'Sukajadi, Bandung', responseTime: '± 10 menit', online: false },
  { id: 'o4', name: 'Sky Aerial', rating: 5.0, rentals: 37, area: 'Lengkong, Bandung', responseTime: '± 30 menit', online: false },
];

/**
 * Di web, require() gambar menghasilkan { uri, width, height } dan ukuran aslinya
 * menimpa style. Ambil uri-nya saja supaya gambar mengikuti ukuran wadah.
 */
const src = (m: any): ImageSourcePropType => {
  if (Platform.OS !== 'web') return m;
  if (typeof m === 'number') return { uri: Asset.fromModule(m).uri };
  return m && typeof m === 'object' && 'uri' in m ? { uri: m.uri } : m;
};

/** Foto produk (latar pastel, dibuat untuk desain Figma). */
const RAW_PHOTOS = {
  camera: require('../assets/products/camera.jpg'),
  cameraBack: require('../assets/products/camera-back.jpg'),
  cameraTop: require('../assets/products/camera-top.jpg'),
  cameraKit: require('../assets/products/camera-kit.jpg'),
  cameraScratch: require('../assets/products/camera-scratch.jpg'),
  dslr: require('../assets/products/dslr.jpg'),
  tablet: require('../assets/products/tablet.jpg'),
  laptopSilver: require('../assets/products/laptop-silver.jpg'),
  laptopGray: require('../assets/products/laptop-gray.jpg'),
  console: require('../assets/products/console.jpg'),
  headphone: require('../assets/products/headphone.jpg'),
};
export const PHOTOS = Object.fromEntries(Object.entries(RAW_PHOTOS).map(([k, v]) => [k, src(v)])) as Record<keyof typeof RAW_PHOTOS, ImageSourcePropType>;

const unsplash = (id: string): ImageSourcePropType => ({ uri: `https://images.unsplash.com/photo-${id}?w=600&h=600&fit=crop&auto=format&q=70` });

export function cover(item: Item): ImageSourcePropType {
  return item.localPhotos?.[0] ? { uri: item.localPhotos[0] } : item.image;
}

export function gallery(item: Item): ImageSourcePropType[] {
  if (item.localPhotos?.length) return item.localPhotos.map((uri) => ({ uri }));
  return [item.image, ...(item.extraPhotos ?? [])];
}

const T_DEFAULT = [
  'Wajib akun terverifikasi (KTP + foto diri)',
  'Deposit dikembalikan otomatis bila kondisi sesuai dokumentasi awal',
  'Telat kembali dikenai denda 50% tarif sewa per hari, dipotong dari deposit',
  'Lewat 3×24 jam tanpa kabar, barang dinyatakan hilang',
];

export const ITEMS: Item[] = [
  {
    id: 'i1', name: 'Canon EOS M100 + Lensa 15-45mm', shortName: 'Canon EOS M100', category: 'Kamera', pricePerDay: 75000, appraisal: 5000000,
    image: PHOTOS.camera, extraPhotos: [PHOTOS.cameraBack, PHOTOS.cameraTop, PHOTOS.cameraKit],
    ownerId: 'o1', distanceKm: 1.2, rating: 4.9, reviews: 128,
    specs: [
      { icon: 'aperture', label: 'Sensor', value: 'APS-C' },
      { icon: 'videocam', label: 'Video', value: 'Full HD' },
      { icon: 'battery-full', label: 'Baterai', value: '2 unit' },
      { icon: 'save', label: 'Memori', value: 'SD 32GB' },
      { icon: 'briefcase', label: 'Kelengkapan', value: 'Tas + cas' },
      { icon: 'calendar', label: 'Min. sewa', value: '1 hari' },
    ],
    condition: 'Body mulus, ada baret halus di bagian bawah. Lensa bersih tanpa jamur. Shutter count ± 8.000.',
    terms: T_DEFAULT, bookedOffsets: [3, 4],
  },
  {
    id: 'i10', name: 'iPad 9th Gen + Stylus', shortName: 'iPad 9th Gen + Stylus', category: 'Tablet', pricePerDay: 60000, appraisal: 4500000,
    image: PHOTOS.tablet, ownerId: 'o1', distanceKm: 1.2, rating: 4.8, reviews: 42,
    specs: [
      { icon: 'hardware-chip', label: 'Chip', value: 'A13 Bionic' },
      { icon: 'save', label: 'Storage', value: '64 GB' },
      { icon: 'brush', label: 'Aksesori', value: 'Stylus' },
      { icon: 'desktop', label: 'Layar', value: '10,2"' },
      { icon: 'wifi', label: 'Konektivitas', value: 'Wi-Fi' },
      { icon: 'calendar', label: 'Min. sewa', value: '1 hari' },
    ],
    condition: 'Sudah pakai antigores & case. Tidak ada retak.',
    terms: T_DEFAULT, bookedOffsets: [0], isNew: true,
  },
  {
    id: 'i5', name: 'Asus Vivobook 14', shortName: 'Asus Vivobook 14', category: 'Laptop', pricePerDay: 75000, appraisal: 7000000,
    image: PHOTOS.laptopSilver, ownerId: 'o2', distanceKm: 2.6, rating: 4.8, reviews: 63,
    specs: [
      { icon: 'hardware-chip', label: 'Prosesor', value: 'Core i5' },
      { icon: 'server', label: 'RAM', value: '16 GB' },
      { icon: 'save', label: 'SSD', value: '512 GB' },
      { icon: 'desktop', label: 'Layar', value: '14" FHD' },
      { icon: 'battery-full', label: 'Baterai', value: '± 6 jam' },
      { icon: 'apps', label: 'Software', value: 'Office' },
    ],
    condition: 'Body mulus, ada bekas pemakaian ringan di palm rest.',
    terms: T_DEFAULT, bookedOffsets: [6, 7], isNew: true,
  },
  {
    id: 'i12', name: 'Headphone Bluetooth', shortName: 'Headphone Bluetooth', category: 'Audio', pricePerDay: 25000, appraisal: 800000,
    image: PHOTOS.headphone, ownerId: 'o1', distanceKm: 1.2, rating: 4.7, reviews: 29,
    specs: [
      { icon: 'headset', label: 'Tipe', value: 'Over-ear' },
      { icon: 'battery-full', label: 'Baterai', value: '30 jam' },
      { icon: 'bluetooth', label: 'Koneksi', value: 'Bluetooth 5.0' },
      { icon: 'mic', label: 'Mic', value: 'Ada' },
      { icon: 'briefcase', label: 'Kelengkapan', value: 'Pouch' },
      { icon: 'calendar', label: 'Min. sewa', value: '1 hari' },
    ],
    condition: 'Earpad baru diganti, steril dan bersih.',
    terms: T_DEFAULT, bookedOffsets: [], isNew: true,
  },
  {
    id: 'i4', name: 'Lenovo IdeaPad Slim 3', shortName: 'Lenovo IdeaPad Slim 3', category: 'Laptop', pricePerDay: 70000, appraisal: 7500000,
    image: PHOTOS.laptopGray, ownerId: 'o2', distanceKm: 2.6, rating: 4.7, reviews: 54,
    specs: [
      { icon: 'hardware-chip', label: 'Prosesor', value: 'Ryzen 5' },
      { icon: 'server', label: 'RAM', value: '8 GB' },
      { icon: 'save', label: 'SSD', value: '512 GB' },
      { icon: 'desktop', label: 'Layar', value: '14" FHD' },
      { icon: 'battery-full', label: 'Baterai', value: '± 7 jam' },
      { icon: 'apps', label: 'Software', value: 'Office' },
    ],
    condition: 'Unit terawat, keyboard normal semua, layar tanpa dead pixel.',
    terms: T_DEFAULT, bookedOffsets: [1, 2],
  },
  {
    id: 'i2', name: 'Canon EOS 1200D Kit', shortName: 'Canon EOS 1200D', category: 'Kamera', pricePerDay: 50000, appraisal: 3500000,
    image: PHOTOS.dslr, ownerId: 'o2', distanceKm: 2.6, rating: 4.6, reviews: 77,
    specs: [
      { icon: 'aperture', label: 'Sensor', value: 'APS-C 18MP' },
      { icon: 'videocam', label: 'Video', value: 'Full HD' },
      { icon: 'battery-full', label: 'Baterai', value: '1 unit' },
      { icon: 'save', label: 'Memori', value: 'SD 32GB' },
      { icon: 'briefcase', label: 'Kelengkapan', value: 'Tas + strap' },
      { icon: 'calendar', label: 'Min. sewa', value: '1 hari' },
    ],
    condition: 'Kamera pemula, berfungsi normal. Grip agak mengelupas.',
    terms: T_DEFAULT, bookedOffsets: [], isNew: true,
  },
  {
    id: 'i6', name: 'PlayStation 5 + 2 Stik', shortName: 'PlayStation 5 + 2 Stik', category: 'Gaming', pricePerDay: 80000, appraisal: 7000000,
    image: PHOTOS.console, ownerId: 'o3', distanceKm: 3.1, rating: 4.8, reviews: 201,
    specs: [
      { icon: 'game-controller', label: 'Stik', value: '2 DualSense' },
      { icon: 'disc', label: 'Versi', value: 'Disc Edition' },
      { icon: 'albums', label: 'Game', value: '12 game' },
      { icon: 'tv', label: 'Output', value: '4K HDMI' },
      { icon: 'save', label: 'Storage', value: '825 GB' },
      { icon: 'calendar', label: 'Min. sewa', value: '1 hari' },
    ],
    condition: 'Konsol normal, stik tidak drift. Ada sticker kecil di sisi kanan.',
    terms: T_DEFAULT, bookedOffsets: [5, 6], isNew: true,
  },
  {
    id: 'i11', name: 'JBL Flip 6 Speaker', shortName: 'JBL Flip 6', category: 'Audio', pricePerDay: 30000, appraisal: 1900000,
    image: unsplash('1608043152269-423dbba4e7e1'), ownerId: 'o2', distanceKm: 2.6, rating: 4.7, reviews: 51,
    specs: [
      { icon: 'volume-high', label: 'Daya', value: '30 W' },
      { icon: 'water', label: 'Tahan air', value: 'IP67' },
      { icon: 'battery-full', label: 'Baterai', value: '12 jam' },
      { icon: 'bluetooth', label: 'Koneksi', value: 'Bluetooth 5.1' },
      { icon: 'git-merge', label: 'PartyBoost', value: 'Ya' },
      { icon: 'calendar', label: 'Min. sewa', value: '1 hari' },
    ],
    condition: 'Suara jernih, bass normal. Ada goresan kecil di karet samping.',
    terms: T_DEFAULT, bookedOffsets: [2],
  },
  {
    id: 'i8', name: 'Nintendo Switch OLED', shortName: 'Nintendo Switch', category: 'Gaming', pricePerDay: 60000, appraisal: 4500000,
    image: unsplash('1578303512597-81e6cc155b3e'), ownerId: 'o3', distanceKm: 3.1, rating: 4.7, reviews: 88,
    specs: [
      { icon: 'game-controller', label: 'Joy-Con', value: '1 pasang' },
      { icon: 'albums', label: 'Game', value: '6 game' },
      { icon: 'tv', label: 'Dock', value: 'Ada' },
      { icon: 'save', label: 'Storage', value: '64 GB + SD' },
      { icon: 'battery-full', label: 'Baterai', value: '± 6 jam' },
      { icon: 'calendar', label: 'Min. sewa', value: '1 hari' },
    ],
    condition: 'Layar mulus, Joy-Con kiri sedikit longgar tapi normal.',
    terms: T_DEFAULT, bookedOffsets: [4],
  },
  {
    id: 'i9', name: 'DJI Mini 2 SE', shortName: 'DJI Mini 2 SE', category: 'Drone', pricePerDay: 100000, appraisal: 5000000,
    image: unsplash('1473968512647-3e447244af8f'), ownerId: 'o4', distanceKm: 5.4, rating: 5.0, reviews: 19,
    specs: [
      { icon: 'videocam', label: 'Kamera', value: '2.7K' },
      { icon: 'time', label: 'Terbang', value: '31 menit' },
      { icon: 'battery-full', label: 'Baterai', value: '2 unit' },
      { icon: 'navigate', label: 'Jarak', value: '10 km' },
      { icon: 'scale', label: 'Bobot', value: '< 249 g' },
      { icon: 'briefcase', label: 'Kelengkapan', value: 'Tas' },
    ],
    condition: 'Propeller baru diganti. Gimbal normal.',
    terms: [...T_DEFAULT, 'Penyewa wajib paham regulasi terbang drone'], bookedOffsets: [2],
  },
];

export const ownerOf = (item: Item) => OWNERS.find((o) => o.id === item.ownerId) ?? OWNERS[0];

export const SOP = [
  'Barang diserahkan dengan dokumentasi kondisi awal (foto/video) dari penyedia.',
  'Penyewa wajib mengonfirmasi penerimaan di aplikasi saat barang diterima.',
  'Keterlambatan dikenai denda 50% tarif sewa per hari, dipotong dari deposit.',
  'Barang yang tidak kembali dalam 3×24 jam setelah masa sewa berakhir dinyatakan hilang.',
  'Kerusakan di luar kondisi awal diselesaikan lewat klaim & mediasi customer service.',
];

/** Kecamatan di Bandung untuk lokasi pengguna. Koordinat kasar (km) relatif ke Coblong. */
export const AREAS: { name: string; x: number; y: number }[] = [
  { name: 'Coblong', x: 0, y: 0 },
  { name: 'Dago', x: 0.6, y: 2.4 },
  { name: 'Sukajadi', x: -2.9, y: 1.1 },
  { name: 'Cidadap', x: -1.2, y: 3.6 },
  { name: 'Cicendo', x: -3.2, y: -1.0 },
  { name: 'Sumur Bandung', x: 0.2, y: -2.6 },
  { name: 'Bandung Wetan', x: 1.0, y: -1.4 },
  { name: 'Lengkong', x: 1.2, y: -5.0 },
  { name: 'Cibeunying Kidul', x: 3.4, y: -1.2 },
  { name: 'Antapani', x: 5.6, y: -2.0 },
  { name: 'Buahbatu', x: 4.2, y: -6.4 },
  { name: 'Sukasari', x: -2.4, y: 3.4 },
];

/** Jarak (km) dari kecamatan pengguna ke penyedia barang. */
export function distanceFrom(area: string, item: Item): number {
  if (area === 'Coblong') return item.distanceKm;
  const me = AREAS.find((a) => a.name === area) ?? AREAS[0];
  const ownerArea = ownerOf(item).area.split(',')[0];
  const o = AREAS.find((a) => a.name === ownerArea) ?? AREAS[0];
  const d = Math.hypot(me.x - o.x, me.y - o.y) + 0.6 + (item.distanceKm % 1) * 0.3;
  return Math.round(d * 10) / 10;
}
