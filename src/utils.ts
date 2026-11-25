export function rp(n: number): string {
  const s = Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `Rp${s}`;
}

/** Bulatkan ke kelipatan `step` (mis. 10.000) supaya harga mudah ditulis. */
export function roundTo(n: number, step: number): number {
  return Math.round(n / step) * step;
}

export function rpShort(n: number): string {
  if (n >= 1_000_000) return `Rp${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1).replace('.', ',')}jt`;
  if (n >= 1000) return `Rp${Math.round(n / 1000)}rb`;
  return rp(n);
}

const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

export function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function fmtDate(d: Date): string {
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function fmtDay(d: Date) {
  return { dow: DAYS[d.getDay()], date: d.getDate(), month: MONTHS[d.getMonth()] };
}

export function fmtTime(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}.${String(d.getMinutes()).padStart(2, '0')}`;
}

export function uid(prefix = ''): string {
  return prefix + Math.random().toString(36).slice(2, 8).toUpperCase();
}
