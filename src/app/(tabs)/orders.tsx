import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Chip, EmptyState, Row, Screen } from '../../components/ui';
import { cover } from '../../data';
import { nextAction, Order, PAYMENT_WINDOW_MS, rentalEnd, STATUS_LABEL, useStore } from '../../store';
import { C, cardWhite, R } from '../../theme';
import { fmtDate, rp } from '../../utils';

const isHistory = (o: Order) => ['selesai', 'dibatalkan'].includes(o.status);

export default function Orders() {
  const { orders, items } = useStore();
  const [history, setHistory] = useState(false);
  const active = orders.filter((o) => !isHistory(o));
  const past = orders.filter(isHistory);
  const list = history ? past : active;

  return (
    <Screen>
      <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
        <Text style={styles.title}>Pesanan</Text>
        <Row style={{ marginTop: 14, marginBottom: 6 }}>
          <Chip label={`Aktif (${active.length})`} active={!history} onPress={() => setHistory(false)} />
          <Chip label={`Riwayat (${past.length})`} active={history} onPress={() => setHistory(true)} />
        </Row>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120, gap: 14 }}>
        {list.length === 0 ? (
          <EmptyState
            icon="receipt-outline"
            title={history ? 'Belum ada riwayat' : 'Belum ada sewa aktif'}
            text="Cari barang, nego harga lewat chat, lalu ajukan pesanan. Semua progres sewa akan muncul di sini."
            action="Cari barang"
            onAction={() => router.push('/search')}
          />
        ) : (
          list.map((o) => {
            const item = items.find((i) => i.id === o.itemId)!;
            const st = STATUS_LABEL[o.status];
            let act = nextAction(o);
            if (o.status === 'menunggu_bayar') {
              const left = Math.max(0, Math.round((o.createdAt + PAYMENT_WINDOW_MS - Date.now()) / 3600_000));
              act = `Bayar sekarang · sisa ${left} jam`;
            }
            const total = o.pricePerDay * o.days + o.deposit;
            return (
              <Pressable key={o.id} style={styles.card} onPress={() => router.push(o.status === 'menunggu_bayar' ? `/pay/${o.id}` : `/order/${o.id}`)}>
                <Row style={{ justifyContent: 'space-between', marginBottom: 12 }}>
                  <Text style={{ color: C.muted, fontSize: 12, fontWeight: '600' }}>#{o.id}</Text>
                  <View style={[styles.status, { backgroundColor: st.bg }]}>
                    <Text style={{ color: st.color, fontSize: 10, fontWeight: '800', letterSpacing: 0.4 }}>{st.label.toUpperCase()}</Text>
                  </View>
                </Row>
                <Row>
                  <Image source={cover(item)} style={[styles.thumb, o.status === 'dibatalkan' && { opacity: 0.5 }]} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={{ fontWeight: '700', color: C.ink, fontSize: 14 }} numberOfLines={1}>
                      {item.shortName}
                    </Text>
                    <Text style={{ color: C.muted, marginTop: 3, fontSize: 12 }}>
                      {o.status === 'dibatalkan' ? `${fmtDate(new Date(o.startDate))} · tidak dibayar dalam 1×24 jam` : `${fmtDate(new Date(o.startDate))} – ${fmtDate(rentalEnd(o))} · ${o.days} hari`}
                    </Text>
                    {o.status === 'selesai' ? (
                      <Text style={{ color: C.success, fontWeight: '600', marginTop: 3, fontSize: 12 }}>Deposit {rp(o.depositRefund ?? o.deposit)} sudah dikembalikan</Text>
                    ) : o.status === 'dibatalkan' ? (
                      <Text style={{ color: C.muted, fontWeight: '600', marginTop: 3, fontSize: 12 }}>Tidak ada dana yang ditarik</Text>
                    ) : (
                      <Text style={{ fontWeight: '700', marginTop: 3, color: C.ink, fontSize: 13 }}>Total {rp(total)}</Text>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={C.faint} />
                </Row>
                {o.reviewed && o.review ? (
                  <Row style={{ marginTop: 12, gap: 6 }}>
                    <Text style={{ color: C.muted, fontSize: 12 }}>Penilaianmu</Text>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Ionicons key={n} name="star" size={13} color={n <= o.review!.stars ? C.orange : C.line} />
                    ))}
                  </Row>
                ) : act ? (
                  <Pressable style={styles.action} onPress={() => router.push(o.status === 'menunggu_bayar' ? `/pay/${o.id}` : o.status === 'selesai' ? `/review/${o.id}` : `/order/${o.id}`)}>
                    <Text style={{ color: C.primary, fontWeight: '700', fontSize: 13 }}>{act}</Text>
                    <Ionicons name={o.status === 'selesai' ? 'star' : 'arrow-forward'} size={16} color={o.status === 'selesai' ? C.orange : C.primary} />
                  </Pressable>
                ) : null}
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </Screen>
  );
}


const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: '800', color: C.ink, letterSpacing: -0.6 },
  card: { ...cardWhite, padding: 14 },
  status: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  thumb: { width: 56, height: 56, borderRadius: R.md, backgroundColor: C.card },
  action: { marginTop: 12, backgroundColor: C.selectedBg, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
