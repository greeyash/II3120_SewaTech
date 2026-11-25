import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BottomBar, Btn, Header, KV, Notice, Row, Screen, SectionTitle } from '../../components/ui';
import { cover, ownerOf, SOP } from '../../data';
import { useStore } from '../../store';
import { C, R, selected } from '../../theme';
import { addDays, fmtDate, fmtDay, roundTo, rp, startOfToday } from '../../utils';

export default function Book() {
  const { id, days: d0 } = useLocalSearchParams<{ id: string; days?: string }>();
  const { items, threads, user, createOrder, depositRateFor, searchPrefs } = useStore();
  const item = items.find((i) => i.id === id)!;
  const today = startOfToday();
  const want = Math.max(1, searchPrefs.startOffset);
  const firstFree = [want, 1, 2, 3, 4, 5, 6, 7].find((n) => !item.bookedOffsets.includes(n)) ?? 1;
  const [start, setStart] = useState(firstFree);
  const [days, setDays] = useState(Math.max(1, parseInt(d0 ?? String(searchPrefs.days), 10)));
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!item) return null;
  if (user.verification !== 'verified') {
    return (
      <Screen>
        <Header title="Pesan sewa" />
        <View style={{ padding: 24, alignItems: 'center', marginTop: 40 }}>
          <View style={styles.lock}>
            <Ionicons name="shield-half" size={36} color={C.warningInk} />
          </View>
          <Text style={{ fontSize: 20, fontWeight: '800', color: C.ink, marginTop: 16 }}>Verifikasi identitas dulu</Text>
          <Text style={{ color: C.muted, textAlign: 'center', marginTop: 8, lineHeight: 20 }}>
            Sesuai ketentuan layanan, hanya akun terverifikasi (KTP + foto diri) yang bisa menyewa barang. Prosesnya cuma beberapa menit.
          </Text>
          <Btn title="Verifikasi sekarang" icon="arrow-forward" style={{ marginTop: 20, alignSelf: 'stretch' }} onPress={() => router.replace('/verify')} />
        </View>
      </Screen>
    );
  }

  const agreed = threads[item.id]?.agreedPrice;
  const weekly = !agreed && days >= 7;
  const pricePerDay = agreed ?? (weekly ? roundTo(item.pricePerDay * 0.8, 10000) : item.pricePerDay);
  const range = Array.from({ length: days }, (_, k) => start + k);
  const conflict = range.some((n) => item.bookedOffsets.includes(n));
  const rate = depositRateFor();
  const subtotal = pricePerDay * days;
  const deposit = roundTo(item.appraisal * rate, 10000);

  const submit = () => {
    setBusy(true);
    const oid = createOrder({ itemId: item.id, startDate: addDays(today, start).getTime(), days, pricePerDay });
    setTimeout(() => router.replace(`/order/${oid}`), 400);
  };

  return (
    <Screen>
      <Header title="Pesan sewa" />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 30 }}>
        <Row style={styles.itemRow}>
          <Image source={cover(item)} style={styles.thumb} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ fontWeight: '700', color: C.ink, fontSize: 15 }}>{item.shortName}</Text>
            <Text style={{ color: C.muted, marginTop: 2, fontSize: 13 }}>{ownerOf(item).name}</Text>
            <Text style={{ fontWeight: '800', marginTop: 4, color: C.ink }}>
              {rp(pricePerDay)}/hari {agreed ? <Text style={{ color: C.primary, fontSize: 12 }}>· harga nego</Text> : weekly ? <Text style={{ color: C.primary, fontSize: 12 }}>· diskon mingguan</Text> : null}
            </Text>
          </View>
        </Row>

        <SectionTitle title="Tanggal mulai" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {Array.from({ length: 14 }).map((_, n) => {
            const off = n + 1;
            const d = fmtDay(addDays(today, off));
            const booked = item.bookedOffsets.includes(off);
            const inRange = range.includes(off);
            return (
              <Pressable
                key={off}
                disabled={booked}
                onPress={() => setStart(off)}
                style={[
                  styles.day,
                  inRange && selected,
                  booked && { backgroundColor: '#ECEEF3', borderColor: '#ECEEF3' },
                  inRange && booked && { backgroundColor: C.errorSoft, borderColor: C.error },
                ]}>
                <Text style={{ fontSize: 11, color: inRange ? C.primary : booked ? C.faint : C.muted }}>{d.dow}</Text>
                <Text style={{ fontSize: 17, fontWeight: '800', color: inRange ? C.primary : booked ? C.faint : C.ink, marginTop: 2 }}>{d.date}</Text>
                <Text style={{ fontSize: 10, color: inRange ? C.primary : C.faint }}>{d.month}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <SectionTitle title="Durasi" />
        <Row style={styles.stepper}>
          <Pressable style={styles.stepBtn} onPress={() => setDays(Math.max(1, days - 1))}>
            <Ionicons name="remove" size={20} color={C.primary} />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontSize: 22, fontWeight: '800', color: C.ink }}>{days} hari</Text>
            <Text style={{ color: C.muted, fontSize: 12 }}>
              {fmtDate(addDays(today, start))} → {fmtDate(addDays(today, start + days))}
            </Text>
          </View>
          <Pressable style={styles.stepBtn} onPress={() => setDays(Math.min(14, days + 1))}>
            <Ionicons name="add" size={20} color={C.primary} />
          </Pressable>
        </Row>
        <View style={{ marginTop: 10 }}>
          {conflict ? (
            <Notice tone="error" icon="close-circle-outline" text="Ada tanggal yang sudah disewa orang lain di rentang ini. Geser tanggal mulai atau kurangi durasi." />
          ) : (
            <Notice tone="success" icon="checkmark-circle-outline" text="Barang tersedia di seluruh rentang tanggal ini." />
          )}
        </View>

        <SectionTitle title="Estimasi biaya" />
        <View style={styles.box}>
          <KV k={`Sewa ${rp(pricePerDay)} × ${days} hari`} v={rp(subtotal)} />
          <KV k={`Deposit (${Math.round(rate * 100)}% nilai taksir)`} v={rp(deposit)} />
          <View style={{ height: 1, backgroundColor: C.line, marginVertical: 6 }} />
          <KV k="Total dibayar" v={rp(subtotal + deposit)} bold />
          <Text style={{ color: C.muted, fontSize: 12, marginTop: 6 }}>Deposit {rp(deposit)} dikembalikan setelah barang dicek sesuai kondisi awal.</Text>
        </View>

        <SectionTitle title="SOP sewa" />
        <View style={styles.box}>
          {SOP.map((t, i) => (
            <Row key={i} style={{ alignItems: 'flex-start', marginBottom: 8 }}>
              <Text style={styles.num}>{i + 1}</Text>
              <Text style={{ flex: 1, color: C.text, lineHeight: 20, fontSize: 13 }}>{t}</Text>
            </Row>
          ))}
        </View>
        <Pressable onPress={() => setAgree(!agree)} style={styles.agree}>
          <View style={[styles.check, agree && { backgroundColor: C.primary, borderColor: C.primary }]}>
            {agree ? <Ionicons name="checkmark" size={16} color="#fff" /> : null}
          </View>
          <Text style={{ flex: 1, marginLeft: 10, color: C.text, lineHeight: 20 }}>Saya sudah membaca dan menyetujui SOP sewa di atas.</Text>
        </Pressable>
      </ScrollView>
      <BottomBar>
        <Btn title="Setujui SOP & ajukan pesanan" style={{ flex: 1 }} disabled={!agree || conflict} loading={busy} onPress={submit} />
      </BottomBar>
    </Screen>
  );
}

const styles = StyleSheet.create({
  lock: { width: 80, height: 80, borderRadius: 40, backgroundColor: C.warningSoft, alignItems: 'center', justifyContent: 'center' },
  itemRow: { backgroundColor: C.card, padding: 12, borderRadius: R.lg, marginTop: 4 },
  thumb: { width: 64, height: 64, borderRadius: R.md },
  day: { width: 54, alignItems: 'center', paddingVertical: 10, borderRadius: R.md, borderWidth: 1, borderColor: C.line, marginRight: 8, backgroundColor: '#fff' },
  stepper: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: C.line, borderRadius: R.lg, padding: 10 },
  stepBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: C.selectedBg, alignItems: 'center', justifyContent: 'center' },
  box: { backgroundColor: C.card, borderRadius: R.lg, padding: 16 },
  num: { width: 22, height: 22, borderRadius: 11, backgroundColor: C.primary, color: '#fff', textAlign: 'center', lineHeight: 22, fontSize: 11, fontWeight: '800', marginRight: 10, overflow: 'hidden' },
  agree: { flexDirection: 'row', alignItems: 'center', marginTop: 14, padding: 14, borderRadius: R.md, borderWidth: 1, borderColor: C.line, backgroundColor: '#fff' },
  check: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: C.line, alignItems: 'center', justifyContent: 'center' },
});
