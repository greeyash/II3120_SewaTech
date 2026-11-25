import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BottomBar, Btn, Divider, Header, KV, Notice, Row, Screen, SectionTitle } from '../../components/ui';
import { DEPOSIT_NEW, DEPOSIT_TRUSTED, PAYMENT_WINDOW_MS, useStore } from '../../store';
import { C, R, selected } from '../../theme';
import { fmtDate, fmtTime, rp } from '../../utils';

/** Ubin logo sederhana (wordmark teks) untuk metode bayar. */
const METHODS = [
  { key: 'QRIS', label: 'QRIS', sub: 'Semua e-wallet & m-banking', logo: 'QRIS', bg: '#FFFFFF', fg: '#1A1A1A', border: C.line, italic: false },
  { key: 'GoPay', label: 'GoPay', sub: 'Saldo GoPay', logo: 'gopay', bg: '#00AED6', fg: '#FFFFFF', border: null, italic: false },
  { key: 'VA BCA', label: 'Virtual Account BCA', sub: 'Transfer via ATM / m-BCA', logo: 'BCA', bg: '#0060AF', fg: '#FFFFFF', border: null, italic: false },
  { key: 'VA Mandiri', label: 'Virtual Account Mandiri', sub: 'Transfer via Livin’', logo: 'mandiri', bg: '#003D79', fg: '#FFC72C', border: null, italic: true },
];

export default function Pay() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { orders, items, pay } = useStore();
  const o = orders.find((x) => x.id === id);
  const [method, setMethod] = useState('QRIS');
  const [phase, setPhase] = useState<'pilih' | 'proses' | 'gagal'>('pilih');
  const [attempt, setAttempt] = useState(0);
  if (!o) return null;
  const item = items.find((i) => i.id === o.itemId)!;
  const subtotal = o.pricePerDay * o.days;
  const total = subtotal + o.deposit;
  const deadline = new Date(o.createdAt + PAYMENT_WINDOW_MS);
  const hoursLeft = Math.max(0, Math.round((deadline.getTime() - Date.now()) / 3600_000));

  const doPay = (forceFail = false) => {
    setPhase('proses');
    setTimeout(() => {
      if (forceFail) {
        setPhase('gagal');
        setAttempt((a) => a + 1);
        return;
      }
      pay(o.id, method);
      router.replace(`/order/${o.id}`);
    }, 1600);
  };

  return (
    <Screen>
      <Header title="Pembayaran" />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 30 }}>
        <LinearGradient colors={[C.primary, C.primarySoft]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.total}>
          <Text style={{ color: '#fff', fontSize: 13 }}>Total pembayaran</Text>
          <Text style={{ color: '#fff', fontSize: 32, fontWeight: '800', marginTop: 4, letterSpacing: -0.5 }}>{rp(total)}</Text>
          <Row style={{ marginTop: 8, gap: 6 }}>
            <Ionicons name="shield-checkmark-outline" size={14} color={C.orange} />
            <Text style={{ color: '#fff', fontSize: 12 }}>Ditahan di rekening bersama sampai sewa selesai</Text>
          </Row>
          <Row style={styles.deadline}>
            <Ionicons name="time-outline" size={14} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600', marginLeft: 6 }}>
              Bayar sebelum {fmtDate(deadline)} · {fmtTime(deadline)} · sisa {hoursLeft} jam
            </Text>
          </Row>
        </LinearGradient>

        <SectionTitle title="Rincian biaya" />
        <View style={styles.box}>
          <Text style={{ fontWeight: '700', color: C.ink, marginBottom: 4 }}>{item.shortName}</Text>
          <KV k={`Sewa ${rp(o.pricePerDay)} × ${o.days} hari`} v={rp(subtotal)} />
          <KV k={`Deposit (${Math.round(o.depositRate * 100)}% × ${rp(item.appraisal)})`} v={rp(o.deposit)} />
          <Divider />
          <KV k="Total" v={rp(total)} bold />
        </View>
        <View style={{ marginTop: 10 }}>
          <Notice
            text={`Deposit dihitung dari nilai taksir barang dan status akunmu (penyewa terpercaya ${DEPOSIT_TRUSTED * 100}%, penyewa baru ${DEPOSIT_NEW * 100}%). Tidak ada proteksi tambahan, jadi deposit menjadi jaminan utama.`}
          />
        </View>

        <SectionTitle title="Metode pembayaran" />
        {METHODS.map((m) => (
          <Pressable key={m.key} onPress={() => setMethod(m.key)} style={[styles.method, method === m.key && { ...selected, borderWidth: 2 }]}>
            <View style={[styles.logo, { backgroundColor: m.bg }, m.border ? { borderWidth: 1, borderColor: m.border } : null]}>
              <Text style={{ color: m.fg, fontWeight: '800', fontSize: m.italic ? 10 : 11, fontStyle: m.italic ? 'italic' : 'normal' }}>{m.logo}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ fontWeight: '700', color: C.ink }}>{m.label}</Text>
              <Text style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>{m.sub}</Text>
            </View>
            <View style={[styles.radio, method === m.key && { borderColor: C.primary }]}>{method === m.key ? <View style={styles.radioDot} /> : null}</View>
          </Pressable>
        ))}

        {phase === 'gagal' ? (
          <View style={{ marginTop: 12 }}>
            <Notice tone="error" icon="close-circle-outline" text={`Pembayaran gagal diproses oleh payment gateway (percobaan ke-${attempt}). Kamu bisa coba lagi sebelum pesanan kedaluwarsa.`} />
          </View>
        ) : null}

        <Pressable onPress={() => doPay(true)} style={{ marginTop: 16, alignSelf: 'center' }}>
          <Text style={{ color: C.faint, fontSize: 12, textDecorationLine: 'underline' }}>Simulasi: pembayaran gagal</Text>
        </Pressable>
      </ScrollView>
      <BottomBar>
        <Btn title={phase === 'gagal' ? 'Coba bayar lagi' : `Bayar ${rp(total)}`} style={{ flex: 1 }} loading={phase === 'proses'} icon="lock-closed-outline" onPress={() => doPay(false)} />
      </BottomBar>
    </Screen>
  );
}

const styles = StyleSheet.create({
  total: { borderRadius: R.lg, padding: 20, marginTop: 4 },
  deadline: { marginTop: 10, alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.18)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  box: { backgroundColor: C.card, borderRadius: R.lg, padding: 16 },
  method: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: R.md, borderWidth: 1.5, borderColor: C.line, marginBottom: 10, backgroundColor: '#fff' },
  logo: { width: 48, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: C.line, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: C.primary },
});
