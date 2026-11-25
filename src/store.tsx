import React, { createContext, useContext, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { distanceFrom, ITEMS, Item } from './data';
import { addDays, roundTo, rp, startOfToday, uid } from './utils';

/** Sesuai laporan: rincian biaya hanya sewa + deposit (tidak ada biaya layanan). */
export const SERVICE_FEE = 0;
/** Deposit = persentase nilai taksir: 30% penyewa baru, 20% penyewa terpercaya (laporan 3.6.3). */
export const DEPOSIT_NEW = 0.3;
export const DEPOSIT_TRUSTED = 0.2;
/** Penyewa dianggap terpercaya setelah 2 sewa selesai tanpa masalah. */
export const TRUSTED_AFTER = 2;
/** Denda telat 50% tarif per hari, dipotong dari deposit (laporan 3.7.3). */
export const LATE_FEE_RATE = 0.5;
/** Pesanan yang belum dibayar kedaluwarsa setelah 1×24 jam. */
export const PAYMENT_WINDOW_MS = 24 * 3600_000;

export type Verification = 'none' | 'pending' | 'rejected' | 'verified';

export type User = {
  name: string;
  email: string;
  phone: string;
  verification: Verification;
  rejectReason?: string;
  ktpUri?: string;
  selfieUri?: string;
  completedRentals: number;
};

export type Message = {
  id: string;
  from: 'me' | 'owner' | 'system';
  kind: 'text' | 'offer';
  text?: string;
  price?: number;
  offerStatus?: 'pending' | 'accepted' | 'rejected' | 'countered';
  at: number;
};

export type Thread = {
  itemId: string;
  messages: Message[];
  agreedPrice?: number;
  unread?: number;
};

export type OrderStatus =
  | 'menunggu_penyedia' // SOP disetujui penyewa, menunggu persetujuan penyedia
  | 'menunggu_bayar'
  | 'dibayar' // dana sewa + deposit ditahan escrow, penyedia menyiapkan barang
  | 'dikirim' // penyedia upload dokumentasi kondisi awal & serah barang
  | 'disewa' // penyewa konfirmasi terima, hitung mundur berjalan
  | 'dikembalikan' // penyewa konfirmasi pengembalian, penyedia memeriksa
  | 'klaim' // kondisi tidak sesuai, mediasi
  | 'selesai'
  | 'dibatalkan';

export type Order = {
  id: string;
  itemId: string;
  startDate: number;
  days: number;
  pricePerDay: number;
  deposit: number;
  depositRate: number;
  serviceFee: number;
  status: OrderStatus;
  handover?: 'langsung' | 'kurir';
  returnMethod?: 'langsung' | 'kurir';
  paymentMethod?: string;
  claim?: { amount: number; reason: string; resolution?: string };
  depositRefund?: number;
  reviewed?: boolean;
  review?: { stars: number; text: string };
  createdAt: number;
  log: { status: OrderStatus; at: number; note?: string }[];
};

type Store = {
  loggedIn: boolean;
  user: User;
  items: Item[];
  threads: Record<string, Thread>;
  orders: Order[];
  favorites: string[];
  /** Lokasi & tanggal yang dipilih di Beranda (startOffset = hari ke-n dari hari ini). */
  searchPrefs: SearchPrefs;
  setSearchPrefs: (p: SearchPrefs) => void;
  login: (demo: boolean, data?: Partial<User>) => void;
  logout: () => void;
  submitVerification: (ktp: string, selfie: string, simulateReject?: boolean) => void;
  toggleFav: (id: string) => void;
  markRead: (itemId: string) => void;
  sendText: (itemId: string, text: string) => void;
  sendOffer: (itemId: string, price: number) => void;
  respondCounter: (itemId: string, msgId: string, accept: boolean) => void;
  createOrder: (o: { itemId: string; startDate: number; days: number; pricePerDay: number }) => string;
  pay: (orderId: string, method: string) => void;
  confirmReceived: (orderId: string) => void;
  confirmReturn: (orderId: string, method: 'langsung' | 'kurir') => void;
  simulateInspection: (orderId: string, ok: boolean) => void;
  resolveClaim: (orderId: string, accept: boolean) => void;
  submitReview: (orderId: string, stars: number, text: string) => void;
  cancelOrder: (orderId: string) => void;
  addListing: (l: Omit<Item, 'id' | 'ownerId' | 'distanceKm' | 'rating' | 'reviews' | 'bookedOffsets' | 'status'>) => void;
  depositRateFor: () => number;
};

export type SearchPrefs = { area: string; startOffset: number; days: number };

const Ctx = createContext<Store | null>(null);

const DEMO_USER: User = {
  name: 'Nabilla',
  email: 'demo@sewatech.id',
  phone: '0812-0000-0000',
  verification: 'verified',
  completedRentals: 2,
};

function seedThreads(): Record<string, Thread> {
  const now = Date.now();
  const h = 3600_000;
  return {
    i1: {
      itemId: 'i1',
      unread: 1,
      messages: [
        { id: 'm1', from: 'me', kind: 'text', text: 'Halo kak, kameranya bisa dipakai buat foto wisuda hari Senin?', at: now - h * 3 },
        { id: 'm2', from: 'owner', kind: 'text', text: 'Bisa kak, baterainya ada 2 jadi aman seharian.', at: now - h * 2.9 },
        { id: 'm3', from: 'me', kind: 'offer', price: 60000, offerStatus: 'countered', at: now - h * 2.8 },
        { id: 'm4', from: 'owner', kind: 'offer', price: 70000, offerStatus: 'pending', at: now - h * 2.7 },
      ],
    },
    i5: {
      itemId: 'i5',
      messages: [
        { id: 'm5', from: 'me', kind: 'text', text: 'Kak, laptopnya kuat buat edit video ringan & Zoom seharian?', at: now - h * 26 },
        { id: 'm6', from: 'owner', kind: 'text', text: 'Siap kak, barangnya ready ya. RAM 16GB, aman buat edit ringan.', at: now - h * 25 },
      ],
    },
    i6: {
      itemId: 'i6',
      agreedPrice: 70000,
      messages: [
        { id: 'm7', from: 'me', kind: 'text', text: 'Kak, kalau sewa 2 hari bisa Rp70.000/hari?', at: now - h * 72 },
        { id: 'm8', from: 'owner', kind: 'text', text: 'Boleh kak, deal Rp70.000/hari. Harga final sudah tercatat ya.', at: now - h * 71 },
      ],
    },
  };
}

/** Contoh pesanan supaya tab Pesanan (Aktif & Riwayat) langsung terisi seperti di Figma. */
function seedOrders(): Order[] {
  const day = 24 * 3600_000;
  const today = startOfToday().getTime();
  const now = Date.now();
  const base = (o: Partial<Order> & Pick<Order, 'id' | 'itemId' | 'status' | 'startDate' | 'days' | 'pricePerDay' | 'deposit'>): Order => ({
    depositRate: DEPOSIT_TRUSTED, serviceFee: 0, createdAt: o.startDate - day, log: [{ status: o.status, at: o.startDate }], ...o,
  });
  return [
    base({ id: 'ST-BEZUBH', itemId: 'i1', status: 'disewa', startDate: now - 3600_000, days: 1, pricePerDay: 70000, deposit: 1000000, paymentMethod: 'QRIS', handover: 'langsung' }),
    base({ id: 'ST-K9QW2M', itemId: 'i10', status: 'menunggu_bayar', startDate: today + 5 * day, days: 1, pricePerDay: 60000, deposit: 900000, createdAt: now - 3600_000 }),
    base({ id: 'ST-Q3MZ8P', itemId: 'i1', status: 'selesai', startDate: today - 16 * day, days: 2, pricePerDay: 75000, deposit: 1000000, depositRefund: 1000000 }),
    base({ id: 'ST-7HD2LA', itemId: 'i12', status: 'selesai', startDate: today - 23 * day, days: 1, pricePerDay: 25000, deposit: 160000, depositRefund: 160000, reviewed: true, review: { stars: 5, text: 'Suara mantap, bersih.' } }),
    base({ id: 'ST-P0LX4C', itemId: 'i5', status: 'dibatalkan', startDate: today - 30 * day, days: 1, pricePerDay: 75000, deposit: 1400000 }),
  ];
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  // Di web, tambahkan ?demo=1 ke URL untuk langsung masuk sebagai akun demo.
  const [loggedIn, setLoggedIn] = useState(
    () => Platform.OS === 'web' && typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('demo'),
  );
  const [user, setUser] = useState<User>(DEMO_USER);
  const [items, setItems] = useState<Item[]>(ITEMS);
  const [threads, setThreads] = useState<Record<string, Thread>>(seedThreads);
  const [orders, setOrders] = useState<Order[]>(seedOrders);
  const [favorites, setFavorites] = useState<string[]>(['i6', 'i12']);
  const [searchPrefs, setSearchPrefs] = useState<SearchPrefs>({ area: 'Coblong', startOffset: 1, days: 1 });
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const later = (ms: number, fn: () => void) => setTimeout(fn, ms);
  const msg = (m: Omit<Message, 'id' | 'at'>): Message => ({ ...m, id: uid('m'), at: Date.now() });

  const pushMsg = (itemId: string, m: Message, patch?: Partial<Thread>) =>
    setThreads((t) => {
      const th = t[itemId] ?? { itemId, messages: [] };
      return { ...t, [itemId]: { ...th, ...patch, messages: [...th.messages, m] } };
    });

  const updateMsg = (itemId: string, msgId: string, patch: Partial<Message>) =>
    setThreads((t) => {
      const th = t[itemId];
      if (!th) return t;
      return { ...t, [itemId]: { ...th, messages: th.messages.map((m) => (m.id === msgId ? { ...m, ...patch } : m)) } };
    });

  const updateOrder = (id: string, patch: Partial<Order>, note?: string) =>
    setOrders((os) =>
      os.map((o) =>
        o.id === id
          ? { ...o, ...patch, log: patch.status ? [...o.log, { status: patch.status, at: Date.now(), note }] : o.log }
          : o,
      ),
    );

  const depositRateFor = () => (user.completedRentals >= TRUSTED_AFTER ? DEPOSIT_TRUSTED : DEPOSIT_NEW);

  const store: Store = {
    loggedIn,
    user,
    items: items.map((i) => ({ ...i, distanceKm: distanceFrom(searchPrefs.area, i) })),
    threads,
    orders,
    favorites,
    searchPrefs,
    setSearchPrefs,
    depositRateFor,

    login: (demo, data) => {
      if (demo) setUser(DEMO_USER);
      else setUser({ name: '', email: '', phone: '', verification: 'none', completedRentals: 0, ...data });
      setLoggedIn(true);
    },
    logout: () => setLoggedIn(false),

    submitVerification: (ktp, selfie, simulateReject) => {
      setUser((u) => ({ ...u, ktpUri: ktp, selfieUri: selfie, verification: 'pending', rejectReason: undefined }));
      later(2500, () =>
        setUser((u) =>
          simulateReject
            ? { ...u, verification: 'rejected', rejectReason: 'Foto KTP buram, NIK tidak terbaca. Silakan unggah ulang dengan pencahayaan cukup.' }
            : { ...u, verification: 'verified' },
        ),
      );
    },

    markRead: (itemId) =>
      setThreads((t) => (t[itemId]?.unread ? { ...t, [itemId]: { ...t[itemId], unread: 0 } } : t)),

    toggleFav: (id) => setFavorites((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id])),

    sendText: (itemId, text) => {
      pushMsg(itemId, msg({ from: 'me', kind: 'text', text }));
      later(1200, () => {
        const replies = [
          'Siap kak, barangnya ready 👍',
          'Boleh kak, silakan ajukan tawaran langsung di sini ya biar tercatat.',
          'Untuk serah terima bisa COD di sekitar kampus atau kurir kak.',
        ];
        pushMsg(itemId, msg({ from: 'owner', kind: 'text', text: replies[Math.floor(Math.random() * replies.length)] }));
      });
    },

    sendOffer: (itemId, price) => {
      const m = msg({ from: 'me', kind: 'offer', price, offerStatus: 'pending' });
      pushMsg(itemId, m);
      const item = itemsRef.current.find((i) => i.id === itemId)!;
      later(1500, () => {
        const ratio = price / item.pricePerDay;
        if (ratio >= 0.9) {
          updateMsg(itemId, m.id, { offerStatus: 'accepted' });
          pushMsg(itemId, msg({ from: 'system', kind: 'text', text: `Penyedia menerima tawaran. Harga final ${rp(price)}/hari tercatat.` }), {
            agreedPrice: price,
          });
        } else if (ratio >= 0.7) {
          const counter = roundTo((price + item.pricePerDay) / 2, 5000);
          updateMsg(itemId, m.id, { offerStatus: 'countered' });
          pushMsg(itemId, msg({ from: 'owner', kind: 'offer', price: counter, offerStatus: 'pending' }));
        } else {
          updateMsg(itemId, m.id, { offerStatus: 'rejected' });
          pushMsg(itemId, msg({ from: 'owner', kind: 'text', text: 'Maaf kak, belum bisa segitu. Boleh naikkan sedikit tawarannya?' }));
        }
      });
    },

    respondCounter: (itemId, msgId, accept) => {
      const th = threads[itemId];
      const m = th?.messages.find((x) => x.id === msgId);
      if (!m) return;
      if (accept) {
        updateMsg(itemId, msgId, { offerStatus: 'accepted' });
        pushMsg(itemId, msg({ from: 'system', kind: 'text', text: `Kamu menerima kontra-penawaran. Harga final ${rp(m.price ?? 0)}/hari tercatat.` }), {
          agreedPrice: m.price,
        });
      } else {
        updateMsg(itemId, msgId, { offerStatus: 'rejected' });
      }
    },

    createOrder: ({ itemId, startDate, days, pricePerDay }) => {
      const item = itemsRef.current.find((i) => i.id === itemId)!;
      const rate = depositRateFor();
      const id = uid('ST-');
      const now = Date.now();
      const o: Order = {
        id,
        itemId,
        startDate,
        days,
        pricePerDay,
        deposit: roundTo(item.appraisal * rate, 10000),
        depositRate: rate,
        serviceFee: SERVICE_FEE,
        status: 'menunggu_penyedia',
        createdAt: now,
        log: [{ status: 'menunggu_penyedia', at: now, note: 'Kamu menyetujui SOP sewa' }],
      };
      setOrders((os) => [o, ...os]);
      later(2500, () => updateOrder(id, { status: 'menunggu_bayar' }, 'Penyedia menyetujui SOP, jadwal ditahan'));
      return id;
    },

    pay: (orderId, method) => {
      updateOrder(orderId, { status: 'dibayar', paymentMethod: method }, `Dana sewa + deposit ditahan di rekening bersama (${method})`);
      later(3000, () =>
        updateOrder(orderId, { status: 'dikirim', handover: Math.random() > 0.5 ? 'langsung' : 'kurir' }, 'Penyedia mengunggah dokumentasi kondisi awal'),
      );
    },

    confirmReceived: (orderId) => updateOrder(orderId, { status: 'disewa', startDate: Date.now() }, 'Barang diterima, masa sewa dimulai'),

    confirmReturn: (orderId, method) =>
      updateOrder(orderId, { status: 'dikembalikan', returnMethod: method }, 'Kamu mengonfirmasi pengembalian'),

    simulateInspection: (orderId, ok) => {
      const o = orders.find((x) => x.id === orderId);
      if (!o) return;
      if (ok) {
        updateOrder(orderId, { status: 'selesai', depositRefund: o.deposit }, 'Kondisi sesuai. Deposit dikembalikan, dana diteruskan ke penyedia');
        setUser((u) => ({ ...u, completedRentals: u.completedRentals + 1 }));
      } else {
        updateOrder(
          orderId,
          {
            status: 'klaim',
            claim: { amount: Math.min(o.deposit, roundTo(o.deposit * 0.3, 50000)), reason: 'Ada goresan baru di bodi samping kiri yang tidak tercatat di dokumentasi awal.' },
          },
          'Penyedia mengajukan klaim kerusakan',
        );
      }
    },

    resolveClaim: (orderId, accept) => {
      const o = orders.find((x) => x.id === orderId);
      if (!o || !o.claim) return;
      const amount = accept ? o.claim.amount : roundTo(o.claim.amount / 2, 50000);
      updateOrder(
        orderId,
        {
          status: 'selesai',
          depositRefund: o.deposit - amount,
          claim: { ...o.claim, amount, resolution: accept ? 'Penyewa menerima klaim' : 'Hasil mediasi customer service: biaya dibagi dua' },
        },
        accept ? 'Klaim diterima, potongan deposit' : 'Mediasi selesai',
      );
      setUser((u) => ({ ...u, completedRentals: u.completedRentals + 1 }));
    },

    submitReview: (orderId, stars, text) => updateOrder(orderId, { reviewed: true, review: { stars, text } }),

    cancelOrder: (orderId) => updateOrder(orderId, { status: 'dibatalkan' }, 'Pesanan dibatalkan'),

    addListing: (l) => {
      const id = uid('L');
      const item: Item = { ...l, id, ownerId: 'me', distanceKm: 0, rating: 0, reviews: 0, bookedOffsets: [], status: 'kurasi' };
      setItems((is) => [...is, item]);
      later(4000, () => setItems((is) => is.map((i) => (i.id === id ? { ...i, status: 'tayang', isNew: true } : i))));
    },
  };

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore outside provider');
  return s;
}

export function rentalEnd(o: Order) {
  return addDays(new Date(o.startDate), o.days);
}

export const todayTs = () => startOfToday().getTime();

export const STATUS_LABEL: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  menunggu_penyedia: { label: 'Menunggu Penyedia', color: '#8A5A00', bg: '#FFF3D6' },
  menunggu_bayar: { label: 'Menunggu Pembayaran', color: '#8A5A00', bg: '#FFF3D6' },
  dibayar: { label: 'Disiapkan Penyedia', color: '#1F5F8B', bg: '#E3F0F8' },
  dikirim: { label: 'Siap Diserahkan', color: '#1F5F8B', bg: '#E3F0F8' },
  disewa: { label: 'Sedang Disewa', color: '#2F8F4E', bg: '#E6F4EA' },
  dikembalikan: { label: 'Diperiksa Penyedia', color: '#1F5F8B', bg: '#E3F0F8' },
  klaim: { label: 'Klaim / Mediasi', color: '#E5484D', bg: '#FDECEC' },
  selesai: { label: 'Selesai', color: '#2F8F4E', bg: '#E6F4EA' },
  dibatalkan: { label: 'Dibatalkan', color: '#E5484D', bg: '#FDECEC' },
};

export function nextAction(o: Order): string | null {
  switch (o.status) {
    case 'menunggu_bayar':
      return 'Bayar sekarang';
    case 'dikembalikan':
      return null;
    case 'dikirim':
      return 'Konfirmasi barang diterima';
    case 'disewa':
      return 'Kembalikan barang';
    case 'klaim':
      return 'Tanggapi klaim';
    case 'selesai':
      return o.reviewed ? null : 'Beri penilaian';
    default:
      return null;
  }
}
