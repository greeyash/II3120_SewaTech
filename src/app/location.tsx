import type React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { BottomBar, Btn, Header, Notice, Row, Screen, SectionTitle } from '../components/ui';
import { AREAS, distanceFrom, ITEMS } from '../data';
import { useStore } from '../store';
import { C, R, selected } from '../theme';
import { addDays, fmtDate, fmtDay, startOfToday } from '../utils';

const NEAR_KM = 3;

/** Atur lokasi & tanggal mulai sewa (dibuka dari kartu pencarian di Beranda). */
export default function LocationPage() {
  const { focus } = useLocalSearchParams<{ focus?: string }>();
  const { searchPrefs, setSearchPrefs } = useStore();
  const [area, setArea] = useState(searchPrefs.area);
  const [start, setStart] = useState(searchPrefs.startOffset);
  const [days, setDays] = useState(searchPrefs.days);
  const [q, setQ] = useState('');
  const [locating, setLocating] = useState(false);
  const scroll = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const dateY = useRef(0);
  const today = startOfToday();

  const live = ITEMS.filter((i) => i.status !== 'kurasi');
  const nearCount = (a: string) => live.filter((i) => distanceFrom(a, i) <= NEAR_KM).length;
  const list = AREAS.filter((a) => a.name.toLowerCase().includes(q.trim().toLowerCase()));

  const useCurrent = () => {
    setLocating(true);
    setTimeout(() => {
      setArea('Coblong');
      setQ('');
      setLocating(false);
    }, 900);
  };

  const apply = () => {
    setSearchPrefs({ area, startOffset: start, days });
    router.canGoBack() ? router.back() : router.replace('/');
  };

  return (
    <Screen>
      <Header title="Lokasi & tanggal sewa" />
      <ScrollView
        ref={scroll}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 30 }}
        keyboardShouldPersistTaps="handled">
        <SectionTitle title="Lokasi kamu" />
        <View style={styles.search}>
          <Ionicons name="search" size={18} color={C.muted} />
          <TextInput value={q} onChangeText={setQ} placeholder="Cari kecamatan di Bandung…" placeholderTextColor={C.faint} style={styles.input} />
          {q ? (
            <Pressable onPress={() => setQ('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={C.faint} />
            </Pressable>
          ) : null}
        </View>

        <Pressable style={styles.current} onPress={useCurrent} disabled={locating}>
          <View style={styles.currentIcon}>
            {locating ? <ActivityIndicator size="small" color={C.primary} /> : <Ionicons name="navigate" size={18} color={C.primary} />}
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ fontWeight: '700', color: C.primary }}>{locating ? 'Mencari lokasimu…' : 'Gunakan lokasi saat ini'}</Text>
            <Text style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>Pakai GPS HP untuk menentukan kecamatan</Text>
          </View>
        </Pressable>

        <View style={styles.list}>
          {list.length ? (
            list.map((a, idx) => {
              const on = area === a.name;
              const n = nearCount(a.name);
              return (
                <Pressable
                  key={a.name}
                  onPress={() => setArea(a.name)}
                  style={[styles.areaRow, idx > 0 && { borderTopWidth: 1, borderTopColor: C.line }, on && { backgroundColor: C.selectedBg }]}>
                  <Ionicons name="location-outline" size={20} color={on ? C.primary : C.muted} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={{ fontWeight: on ? '700' : '600', color: on ? C.primary : C.ink }}>{a.name}, Bandung</Text>
                    <Text style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>
                      {n ? `${n} barang dalam ${NEAR_KM} km` : `Belum ada barang dalam ${NEAR_KM} km`}
                    </Text>
                  </View>
                  <View style={[styles.radio, on && { borderColor: C.primary }]}>{on ? <View style={styles.radioDot} /> : null}</View>
                </Pressable>
              );
            })
          ) : (
            <Text style={{ color: C.muted, padding: 16 }}>Kecamatan "{q}" belum terjangkau SewaTech. Saat ini layanan baru ada di Kota Bandung.</Text>
          )}
        </View>

        <View onLayout={(e) => {
          dateY.current = e.nativeEvent.layout.y;
          if (focus === 'date') scroll.current?.scrollTo({ y: dateY.current - 10, animated: false });
        }}>
          <SectionTitle title="Mulai sewa" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {Array.from({ length: 14 }).map((_, off) => {
              const d = fmtDay(addDays(today, off));
              const on = off >= start && off < start + days;
              return (
                <Pressable key={off} onPress={() => setStart(off)} style={[styles.day, on && selected]}>
                  <Text style={{ fontSize: 11, color: on ? C.primary : C.muted }}>{off === 0 ? 'Hari ini' : d.dow}</Text>
                  <Text style={{ fontSize: 17, fontWeight: '800', color: on ? C.primary : C.ink, marginTop: 2 }}>{d.date}</Text>
                  <Text style={{ fontSize: 10, color: on ? C.primary : C.faint }}>{d.month}</Text>
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

          <View style={{ marginTop: 14 }}>
            <Notice tone="info" icon="information-circle-outline" text="Barang diurutkan dari yang terdekat dengan lokasimu. Di halaman Cari, pakai filter “Tersedia di tanggalmu” untuk menyembunyikan barang yang sudah disewa." />
          </View>
        </View>
      </ScrollView>
      <BottomBar>
        <Btn title="Terapkan" style={{ flex: 1 }} onPress={apply} />
      </BottomBar>
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: { flexDirection: 'row', alignItems: 'center', height: 50, borderRadius: R.md, backgroundColor: C.white, borderWidth: 1.5, borderColor: C.line, paddingHorizontal: 14 },
  input: { flex: 1, marginLeft: 8, fontSize: 15, color: C.ink, height: 48 },
  current: { flexDirection: 'row', alignItems: 'center', marginTop: 12, padding: 14, borderRadius: R.lg, backgroundColor: C.white, borderWidth: 1, borderColor: C.line },
  currentIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: C.selectedBg, alignItems: 'center', justifyContent: 'center' },
  list: { marginTop: 12, borderRadius: R.lg, backgroundColor: C.white, borderWidth: 1, borderColor: C.line, overflow: 'hidden' },
  areaRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: C.line, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: C.primary },
  day: { width: 58, height: 72, borderRadius: R.md, borderWidth: 1, borderColor: C.line, backgroundColor: C.white, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  stepper: { backgroundColor: C.white, borderRadius: R.lg, borderWidth: 1, borderColor: C.line, padding: 10 },
  stepBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.selectedBg, alignItems: 'center', justifyContent: 'center' },
});
