import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Btn, Divider, Header, KV, Notice, Row, Screen, SectionTitle } from '../../components/ui';
import { cover, gallery, ownerOf, PHOTOS } from '../../data';
import { LATE_FEE_RATE, Order, PAYMENT_WINDOW_MS, rentalEnd, STATUS_LABEL, useStore } from '../../store';
import { C, R, selected } from '../../theme';
import { fmtDate, fmtTime, roundTo, rp } from '../../utils';

const STEPS = ['Pesan', 'Bayar', 'Serah', 'Sewa', 'Kembali', 'Selesai'];
const STEP_OF: Record<Order['status'], number> = {
  menunggu_penyedia: 0,
  menunggu_bayar: 1,
  dibayar: 2,
  dikirim: 2,
  disewa: 3,
  dikembalikan: 4,
  klaim: 4,
  selesai: 5,
  dibatalkan: 0,
};

export default function OrderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { orders, items } = useStore();
  const o = orders.find((x) => x.id === id);
  if (!o) return null;
  const item = items.find((i) => i.id === o.itemId)!;
  const st = STATUS_LABEL[o.status];
  const step = STEP_OF[o.status];

  return (
    <Screen>
      <Header title={`Pesanan #${o.id}`} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
        <Row style={styles.itemRow}>
          <Image source={cover(item)} style={styles.thumb} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ fontWeight: '700', color: C.ink, fontSize: 15 }} numberOfLines={1}>
              {item.shortName}
            </Text>
            <Text style={{ color: C.muted, marginTop: 2, fontSize: 13 }}>
              {fmtDate(new Date(o.startDate))} – {fmtDate(rentalEnd(o))} · {o.days} hari
            </Text>
            <View style={[styles.status, { backgroundColor: st.bg }]}>
              <Text style={{ color: st.color, fontSize: 10, fontWeight: '800', letterSpacing: 0.4 }}>{st.label.toUpperCase()}</Text>
            </View>
          </View>
        </Row>

        {o.status !== 'dibatalkan' ? (
          <Row style={{ marginTop: 18, marginBottom: 4 }}>
            {STEPS.map((s, i) => (
              <View key={s} style={{ flex: 1, alignItems: 'center' }}>
                <Row style={{ width: '100%' }}>
                  <View style={[styles.line, { opacity: i === 0 ? 0 : 1 }, i <= step && { backgroundColor: C.primary }]} />
                  <View style={[styles.stepDot, i < step && { backgroundColor: C.primary, borderColor: C.primary }, i === step && { borderColor: C.primary }]}>
                    {i < step || (i === step && o.status === 'selesai') ? (
                      <Ionicons name="checkmark" size={12} color="#fff" />
                    ) : i === step ? (
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: C.primary }} />
                    ) : null}
                  </View>
                  <View style={[styles.line, { opacity: i === STEPS.length - 1 ? 0 : 1 }, i < step && { backgroundColor: C.primary }]} />
                </Row>
                <Text style={{ fontSize: 11, marginTop: 6, color: i <= step ? C.ink : C.faint, fontWeight: i === step ? '800' : '500' }}>{s}</Text>
              </View>
            ))}
          </Row>
        ) : null}

        <View style={{ marginTop: 16 }}>
          <ActionPanel o={o} />
        </View>

        <SectionTitle title="Rincian pembayaran" />
        <View style={styles.box}>
          <KV k={`Sewa ${rp(o.pricePerDay)} × ${o.days}`} v={rp(o.pricePerDay * o.days)} />
          <KV k={`Deposit (${Math.round(o.depositRate * 100)}%)`} v={rp(o.deposit)} />
          <Divider />
          <KV k="Total" v={rp(o.pricePerDay * o.days + o.deposit)} bold />
          {o.claim?.resolution ? <KV k="Potongan klaim" v={`-${rp(o.claim.amount)}`} color={C.error} /> : null}
          {o.depositRefund !== undefined ? <KV k="Deposit dikembalikan" v={rp(o.depositRefund)} color={C.success} bold /> : null}
          {o.paymentMethod ? <Text style={{ color: C.muted, fontSize: 12, marginTop: 6 }}>Dibayar via {o.paymentMethod}</Text> : null}
        </View>

        <SectionTitle title="Riwayat" />
        <View style={{ paddingLeft: 4 }}>
          {[...o.log].reverse().map((l, i) => (
            <Row key={i} style={{ alignItems: 'flex-start' }}>
              <View style={{ alignItems: 'center', width: 16 }}>
                <View style={[styles.logDot, i === 0 && { backgroundColor: C.primary }]} />
                {i < o.log.length - 1 ? <View style={styles.logLine} /> : null}
              </View>
              <View style={{ flex: 1, marginLeft: 10, paddingBottom: 16 }}>
                <Text style={{ fontWeight: '700', color: C.ink }}>{STATUS_LABEL[l.status].label}</Text>
                {l.note ? <Text style={{ color: C.muted, fontSize: 13, marginTop: 2 }}>{l.note}</Text> : null}
                <Text style={{ color: C.faint, fontSize: 11, marginTop: 2 }}>
                  {fmtDate(new Date(l.at))} · {fmtTime(new Date(l.at))}
                </Text>
              </View>
            </Row>
          ))}
        </View>

        <Btn title="Chat penyedia" variant="outline" icon="chatbubble-ellipses-outline" onPress={() => router.push(`/chat/${item.id}`)} />
      </ScrollView>
    </Screen>
  );
}

function Waiting({ title, text }: { title: string; text: string }) {
  return (
    <View style={styles.panel}>
      <Row>
        <ActivityIndicator color={C.primary} />
        <Text style={{ fontWeight: '800', color: C.ink, marginLeft: 10, fontSize: 16, flex: 1 }}>{title}</Text>
      </Row>
      <Text style={{ color: C.muted, marginTop: 8, lineHeight: 20 }}>{text}</Text>
    </View>
  );
}

function ActionPanel({ o }: { o: Order }) {
  const { items, cancelOrder, confirmReceived, confirmReturn, simulateInspection, resolveClaim } = useStore();
  const item = items.find((i) => i.id === o.itemId)!;
  const owner = ownerOf(item);
  const [checked, setChecked] = useState(false);
  const [returnMethod, setReturnMethod] = useState<'langsung' | 'kurir'>('langsung');
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (o.status !== 'disewa') return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [o.status]);

  switch (o.status) {
    case 'menunggu_penyedia':
      return (
        <>
          <Waiting title="Menunggu persetujuan penyedia" text={`${owner.name} perlu menyetujui SOP. Setelah disetujui, jadwal barang ditahan untukmu dan pesanan menunggu pembayaran.`} />
          <Btn title="Batalkan pesanan" variant="ghost" style={{ marginTop: 6 }} onPress={() => cancelOrder(o.id)} />
        </>
      );
    case 'menunggu_bayar':
      return (
        <View style={styles.panel}>
          <Row style={{ gap: 8 }}>
            <Ionicons name="time-outline" size={20} color={C.warning} />
            <Text style={{ fontWeight: '800', color: C.ink, fontSize: 16 }}>Selesaikan pembayaran</Text>
          </Row>
          <Text style={{ color: C.muted, marginTop: 8, lineHeight: 20 }}>
            Penyedia sudah setuju dan jadwal ditahan. Bayar sebelum {fmtDate(new Date(o.createdAt + PAYMENT_WINDOW_MS))} · {fmtTime(new Date(o.createdAt + PAYMENT_WINDOW_MS))} (1×24 jam) supaya pesanan tidak batal otomatis.
          </Text>
          <Btn title="Bayar sekarang" icon="arrow-forward" style={{ marginTop: 14 }} onPress={() => router.push(`/pay/${o.id}`)} />
          <Btn title="Batalkan" variant="ghost" style={{ marginTop: 4 }} onPress={() => cancelOrder(o.id)} />
        </View>
      );
    case 'dibayar':
      return <Waiting title="Dana aman di escrow" text={`Pembayaran berhasil dan dananya ditahan di rekening bersama. ${owner.name} sedang memotret kondisi awal barang dan memilih cara serah terima.`} />;
    case 'dikirim': {
      const pics = gallery(item);
      return (
        <View style={styles.panel}>
          <Row style={{ gap: 8 }}>
            <Ionicons name={o.handover === 'kurir' ? 'bicycle' : 'people'} size={20} color={C.info} />
            <Text style={{ fontWeight: '800', color: C.ink, fontSize: 16 }}>{o.handover === 'kurir' ? 'Barang dikirim via kurir' : 'Serah terima langsung'}</Text>
          </Row>
          <Text style={{ color: C.muted, marginTop: 6, lineHeight: 20 }}>
            {o.handover === 'kurir'
              ? 'GoSend Instan · Resi GK-2291837 · estimasi tiba 45 menit.'
              : `Titik temu: Gerbang Depan ITB Ganesha · ${fmtDate(new Date(o.startDate))}, 10.00`}
          </Text>
          <Text style={{ fontWeight: '700', color: C.ink, marginTop: 14 }}>Dokumentasi kondisi awal dari penyedia</Text>
          <Row style={{ gap: 8, marginTop: 8 }}>
            {pics.map((p, i) => (
              <Image key={i} source={p} style={styles.docImg} />
            ))}
          </Row>
          <Text style={{ color: C.muted, fontSize: 12, marginTop: 8, lineHeight: 18 }}>“{item.condition}”</Text>
          <Pressable onPress={() => setChecked(!checked)} style={styles.checkRow}>
            <View style={[styles.check, checked && { backgroundColor: C.primary, borderColor: C.primary }]}>{checked ? <Ionicons name="checkmark" size={14} color="#fff" /> : null}</View>
            <Text style={{ flex: 1, marginLeft: 10, color: C.text, fontSize: 13 }}>Barang sudah kuterima dan kondisinya sesuai foto di atas.</Text>
          </Pressable>
          <Btn title="Konfirmasi barang diterima" disabled={!checked} style={{ marginTop: 12 }} onPress={() => confirmReceived(o.id)} />
        </View>
      );
    }
    case 'disewa': {
      const end = rentalEnd(o).getTime();
      const left = Math.max(0, end - now);
      const dd = Math.floor(left / 86400000);
      const hh = Math.floor((left % 86400000) / 3600000);
      const mm = Math.floor((left % 3600000) / 60000);
      const ss = Math.floor((left % 60000) / 1000);
      return (
        <View>
          <View style={styles.countdown}>
            <Text style={{ color: C.ink, fontSize: 12, fontWeight: '800', letterSpacing: 1 }}>SISA MASA SEWA</Text>
            <Row style={{ marginTop: 10, gap: 8 }}>
              {[
                [dd, 'Hari'],
                [hh, 'Jam'],
                [mm, 'Menit'],
                [ss, 'Detik'],
              ].map(([v, l]) => (
                <View key={l as string} style={styles.cdBox}>
                  <Text style={{ color: C.ink, fontSize: 26, fontWeight: '800' }}>{String(v).padStart(2, '0')}</Text>
                  <Text style={{ color: C.text, fontSize: 11 }}>{l}</Text>
                </View>
              ))}
            </Row>
            <Text style={{ color: C.ink, fontSize: 12, marginTop: 12 }}>
              Kembalikan sebelum {fmtDate(new Date(end))}, {fmtTime(new Date(end))}
            </Text>
          </View>
          <View style={{ marginTop: 10, gap: 8 }}>
            <Notice tone="info" icon="notifications-outline" text="Pengingat otomatis dikirim 1×24 jam sebelum masa sewa berakhir." />
            <Notice tone="warning" icon="alert-circle-outline" text={`Telat kembali kena denda ${rp(roundTo(o.pricePerDay * LATE_FEE_RATE, 500))}/hari (50% tarif), dipotong dari deposit. Lewat 3×24 jam, barang dinyatakan hilang.`} />
          </View>
          <View style={[styles.panel, { marginTop: 10 }]}>
            <Text style={{ fontWeight: '800', color: C.ink, fontSize: 16 }}>Kembalikan barang</Text>
            <Row style={{ gap: 8, marginTop: 10 }}>
              {(['langsung', 'kurir'] as const).map((m) => (
                <Pressable key={m} onPress={() => setReturnMethod(m)} style={[styles.opt, returnMethod === m && { ...selected, borderWidth: 2 }]}>
                  <Ionicons name={m === 'kurir' ? 'bicycle' : 'people'} size={20} color={returnMethod === m ? C.primary : C.ink} />
                  <Text style={{ fontWeight: '700', marginTop: 6, color: returnMethod === m ? C.primary : C.ink, textAlign: 'center' }}>{m === 'kurir' ? 'Kirim kurir' : 'Ketemu langsung'}</Text>
                </Pressable>
              ))}
            </Row>
            <Btn title="Konfirmasi pengembalian" style={{ marginTop: 12 }} onPress={() => confirmReturn(o.id, returnMethod)} />
          </View>
        </View>
      );
    }
    case 'dikembalikan':
      return (
        <View>
          <Waiting title="Penyedia sedang memeriksa barang" text="Kondisi barang dibandingkan dengan dokumentasi awal. Kalau sesuai, deposit langsung dikembalikan dan dana sewa diteruskan ke penyedia." />
          <View style={styles.sim}>
            <Text style={styles.simLabel}>SIMULASI HASIL PEMERIKSAAN (sisi penyedia)</Text>
            <Row style={{ gap: 8, marginTop: 8 }}>
              <Btn title="Kondisi sesuai" small style={{ flex: 1 }} icon="checkmark" onPress={() => simulateInspection(o.id, true)} />
              <Btn title="Tidak sesuai" small variant="danger" style={{ flex: 1 }} icon="alert" onPress={() => simulateInspection(o.id, false)} />
            </Row>
          </View>
        </View>
      );
    case 'klaim':
      return (
        <View style={[styles.panel, { borderColor: 'rgba(229,72,77,0.45)' }]}>
          <Row style={{ gap: 8 }}>
            <Ionicons name="alert-circle-outline" size={20} color={C.error} />
            <Text style={{ fontWeight: '800', color: C.ink, fontSize: 16 }}>Penyedia mengajukan klaim</Text>
          </Row>
          <Text style={{ color: C.text, marginTop: 8, lineHeight: 20 }}>{o.claim?.reason}</Text>
          <Row style={styles.deadline}>
            <Ionicons name="time-outline" size={16} color={C.warning} />
            <Text style={{ color: C.warningInk, fontSize: 12, fontWeight: '600', marginLeft: 8 }}>
              Tanggapi sebelum {fmtDate(new Date(Date.now() + 2 * 86400000))} · 18.00
            </Text>
          </Row>
          <Row style={{ gap: 8, marginTop: 10 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cmpLabel}>Kondisi awal</Text>
              <Image source={item.image} style={styles.cmpImg} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cmpLabel}>Saat dikembalikan</Text>
              <View>
                <Image source={item.id === 'i1' ? PHOTOS.cameraScratch : item.image} style={styles.cmpImg} />
                <View style={styles.marker} />
                <View style={styles.markerTag}>
                  <Text style={{ color: '#fff', fontSize: 9, fontWeight: '800' }}>Goresan baru</Text>
                </View>
              </View>
            </View>
          </Row>
          <View style={[styles.box, { marginTop: 12, backgroundColor: C.errorSoft, paddingVertical: 14 }]}>
            <KV k="Biaya perbaikan" v={rp(o.claim?.amount ?? 0)} bold color={C.error} />
            <Text style={{ color: C.muted, fontSize: 12 }}>Dipotong dari deposit {rp(o.deposit)}</Text>
          </View>
          <Btn title="Terima potongan" variant="danger" style={{ marginTop: 12 }} onPress={() => resolveClaim(o.id, true)} />
          <Btn title="Minta mediasi CS" variant="outline" style={{ marginTop: 10, borderColor: C.primary }} icon="people-outline" onPress={() => resolveClaim(o.id, false)} />
          <View style={{ marginTop: 12 }}>
            <Notice text="Mediasi ditangani customer service SewaTech. Potongan tidak akan melebihi deposit dan dirinci ke kedua pihak." />
          </View>
        </View>
      );
    case 'selesai':
      return (
        <View style={styles.panel}>
          <Row style={{ gap: 8 }}>
            <Ionicons name="checkmark-circle" size={22} color={C.success} />
            <Text style={{ fontWeight: '800', color: C.ink, fontSize: 16 }}>Sewa selesai</Text>
          </Row>
          <Text style={{ color: C.muted, marginTop: 8, lineHeight: 20 }}>
            Deposit {rp(o.depositRefund ?? o.deposit)} sudah dikembalikan ke saldomu. Dana sewa diteruskan ke {owner.name}.
            {o.claim?.resolution ? ` (${o.claim.resolution})` : ''}
          </Text>
          {o.reviewed ? (
            <View style={[styles.box, { marginTop: 12 }]}>
              <Row style={{ gap: 2 }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <Ionicons key={n} name="star" size={16} color={n <= (o.review?.stars ?? 0) ? C.orange : C.line} />
                ))}
              </Row>
              {o.review?.text ? <Text style={{ marginTop: 6, color: C.text }}>{o.review.text}</Text> : null}
              <Text style={{ color: C.muted, fontSize: 12, marginTop: 6 }}>Penyedia juga memberimu ★ 5 — “Penyewa tepat waktu, barang rapi.”</Text>
            </View>
          ) : (
            <Btn title="Beri penilaian" icon="star" style={{ marginTop: 12 }} onPress={() => router.push(`/review/${o.id}`)} />
          )}
        </View>
      );
    case 'dibatalkan':
      return <Notice tone="error" icon="close-circle-outline" text="Pesanan dibatalkan karena tidak dibayar dalam 1×24 jam. Jadwal barang dilepas kembali dan tidak ada dana yang ditarik." />;
  }
}

const styles = StyleSheet.create({
  itemRow: { backgroundColor: C.card, padding: 12, borderRadius: R.lg, marginTop: 4, alignItems: 'flex-start' },
  thumb: { width: 72, height: 72, borderRadius: R.md },
  status: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, marginTop: 6 },
  line: { flex: 1, height: 2, backgroundColor: C.line },
  stepDot: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: C.line, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  panel: { borderWidth: 1.5, borderColor: C.line, borderRadius: R.lg, padding: 16, backgroundColor: '#fff' },
  box: { backgroundColor: C.card, borderRadius: R.lg, padding: 16 },
  docImg: { flex: 1, height: 64, borderRadius: R.sm, backgroundColor: C.card },
  checkRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14, padding: 12, borderRadius: R.md, backgroundColor: C.selectedBg },
  check: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: C.faint, alignItems: 'center', justifyContent: 'center' },
  countdown: { backgroundColor: C.orange, borderRadius: R.lg, padding: 18 },
  cdBox: { flex: 1, alignItems: 'center', backgroundColor: C.bg, borderRadius: R.md, paddingVertical: 10 },
  opt: { flex: 1, alignItems: 'center', padding: 14, borderRadius: R.md, borderWidth: 1.5, borderColor: C.line, backgroundColor: '#fff' },
  deadline: { marginTop: 10, backgroundColor: C.warningSoft, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  sim: { marginTop: 10, padding: 12, borderRadius: R.md, borderWidth: 1.5, borderStyle: 'dashed', borderColor: C.faint },
  simLabel: { fontSize: 10, fontWeight: '800', color: C.muted, letterSpacing: 0.6 },
  cmpLabel: { fontSize: 11, color: C.muted, marginBottom: 4, fontWeight: '600' },
  cmpImg: { width: '100%', height: 100, borderRadius: R.sm, backgroundColor: C.card },
  marker: { position: 'absolute', left: '34%', top: '34%', width: 48, height: 34, borderRadius: 24, borderWidth: 2, borderStyle: 'dashed', borderColor: C.error, backgroundColor: 'rgba(229,72,77,0.15)' },
  markerTag: { position: 'absolute', left: 6, bottom: 6, backgroundColor: C.error, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  logDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: C.faint, marginTop: 5 },
  logLine: { width: 2, flex: 1, backgroundColor: C.line, marginTop: 2 },
});
