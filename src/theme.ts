/**
 * Token warna SewaTech — sama dengan variabel di Figma ("SewaTech Colors").
 * Palet: Bleu océan, Bleu ciel, Butter yellow, Orange pastel, Blanc cassé + state colors.
 */
export const C = {
  // brand
  primary: '#0A1680', // Bleu océan — aksi utama
  primaryDark: '#0A1680',
  primarySoft: '#93B2F8', // Bleu ciel
  selectedBg: '#EAF0FE', // latar elemen terpilih (dipakai bersama outline primary)
  card: '#FBEDB0', // Butter yellow — kartu ringkasan
  orange: '#F1B94C', // Orange pastel — aksen
  bg: '#FCFDFF', // Blanc cassé
  white: '#FFFFFF',
  // teks & garis
  ink: '#070E52',
  text: '#232B66',
  muted: '#363D66',
  faint: '#6E7599',
  line: '#D3D9EA',
  disabled: '#E3E6EE',
  // state
  success: '#2F8F4E',
  successSoft: '#E6F4EA',
  warning: '#F2A93B',
  warningSoft: '#FFF3D6',
  warningInk: '#8A5A00',
  error: '#E5484D',
  errorSoft: '#FDECEC',
  info: '#4A90C2',
  infoSoft: '#E3F0F8',
  infoInk: '#1F5F8B',
  // alias lama (dipakai beberapa layar)
  red: '#E5484D',
  redSoft: '#FDECEC',
  yellow: '#F1B94C',
  yellowSoft: '#FFF3D6',
  blue: '#4A90C2',
  blueSoft: '#E3F0F8',
  orangeSoft: '#FCEBC9',
};

export const R = { sm: 10, md: 14, lg: 20, xl: 28, pill: 999 };

export const shadow = {
  shadowColor: '#0A1680',
  shadowOpacity: 0.08,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 4 },
  elevation: 3,
};

/** Kartu putih standar: border tipis + bayangan lembut. */
export const cardWhite = {
  backgroundColor: '#FFFFFF',
  borderWidth: 1,
  borderColor: C.line,
  borderRadius: R.lg,
  ...shadow,
};

/** Gaya elemen terpilih (chip, tarif, tanggal, metode bayar). */
export const selected = {
  backgroundColor: C.selectedBg,
  borderColor: C.primary,
  borderWidth: 1.5,
};

/**
 * Gambar memenuhi wadahnya. Dipakai sebagai ganti StyleSheet.absoluteFill pada <Image>,
 * karena di web gambar lokal membawa ukuran aslinya dan absoluteFill tidak menimpanya.
 */
export const imgFill = { position: 'absolute' as const, top: 0, left: 0, width: '100%' as const, height: '100%' as const };
