import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Chip, EmptyState, Grid, Row, Screen } from '../../components/ui';
import { CATEGORIES, ownerOf } from '../../data';
import { useStore } from '../../store';
import { C, R, selected } from '../../theme';
import { addDays, fmtDate, startOfToday } from '../../utils';

const PRICES = [
  { label: 'Semua harga', max: Infinity },
  { label: '≤ Rp25.000', max: 25000 },
  { label: '≤ Rp50.000', max: 50000 },
  { label: '≤ Rp75.000', max: 75000 },
];
const AREAS = ['Semua lokasi', 'Coblong', 'Dago', 'Sukajadi', 'Lengkong'];
const SORTS = ['Terdekat', 'Termurah', 'Rating'];

export default function Search() {
  const { items, searchPrefs } = useStore();
  const range = Array.from({ length: searchPrefs.days }, (_, k) => searchPrefs.startOffset + k);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('Semua');
  const [price, setPrice] = useState(0);
  const [area, setArea] = useState(AREAS[0]);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sort, setSort] = useState(SORTS[0]);
  const [showFilter, setShowFilter] = useState(false);

  let res = items.filter((i) => i.status !== 'kurasi' && i.ownerId !== 'me');
  if (q.trim()) res = res.filter((i) => (i.name + ' ' + i.category).toLowerCase().includes(q.trim().toLowerCase()));
  if (cat !== 'Semua') res = res.filter((i) => i.category === cat);
  res = res.filter((i) => i.pricePerDay <= PRICES[price].max);
  if (area !== AREAS[0]) res = res.filter((i) => ownerOf(i).area.startsWith(area));
  if (availableOnly) res = res.filter((i) => !range.some((n) => i.bookedOffsets.includes(n)));
  res = [...res].sort((a, b) => (sort === 'Termurah' ? a.pricePerDay - b.pricePerDay : sort === 'Rating' ? b.rating - a.rating : a.distanceKm - b.distanceKm));
  const activeFilters = (price ? 1 : 0) + (area !== AREAS[0] ? 1 : 0) + (availableOnly ? 1 : 0);

  return (
    <Screen>
      <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
        <Text style={styles.title}>Cari barang</Text>
        <Pressable style={styles.where} onPress={() => router.push('/location')}>
          <Ionicons name="location" size={14} color={C.primary} />
          <Text style={styles.whereText} numberOfLines={1}>
            {searchPrefs.area} · {fmtDate(addDays(startOfToday(), searchPrefs.startOffset))} · {searchPrefs.days} hari
          </Text>
          <Text style={{ color: C.primary, fontSize: 12, fontWeight: '700' }}>Ubah</Text>
        </Pressable>
        <Row style={{ marginTop: 14, gap: 10 }}>
          <View style={styles.search}>
            <Ionicons name="search" size={18} color={C.muted} />
            <TextInput value={q} onChangeText={setQ} placeholder="Kamera, laptop, PS5…" placeholderTextColor={C.faint} style={styles.input} returnKeyType="search" />
            {q ? (
              <Pressable onPress={() => setQ('')}>
                <Ionicons name="close-circle" size={18} color={C.faint} />
              </Pressable>
            ) : null}
          </View>
          <Pressable style={styles.filterBtn} onPress={() => setShowFilter(!showFilter)}>
            <Ionicons name="options" size={20} color="#fff" />
            {activeFilters ? (
              <View style={styles.count}>
                <Text style={{ color: C.ink, fontSize: 10, fontWeight: '800' }}>{activeFilters}</Text>
              </View>
            ) : null}
          </Pressable>
        </Row>
      </View>

      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 14 }}>
          {CATEGORIES.map((c) => (
            <Chip key={c.key} label={c.key} active={cat === c.key} onPress={() => setCat(c.key)} />
          ))}
        </ScrollView>
      </View>

      {showFilter ? (
        <View style={styles.filterPanel}>
          <Text style={styles.fLabel}>Lokasi</Text>
          <Wrap>{AREAS.map((a) => <Chip key={a} label={a} active={area === a} onPress={() => setArea(a)} />)}</Wrap>
          <Text style={styles.fLabel}>Harga per hari</Text>
          <Wrap>{PRICES.map((p, i) => <Chip key={p.label} label={p.label} active={price === i} onPress={() => setPrice(i)} />)}</Wrap>
          <Text style={styles.fLabel}>Ketersediaan</Text>
          <Wrap>
            <Chip label="Tersedia di tanggalmu" icon="checkmark-circle" active={availableOnly} onPress={() => setAvailableOnly(!availableOnly)} />
          </Wrap>
        </View>
      ) : null}

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
        <Row style={{ justifyContent: 'space-between', marginBottom: 14 }}>
          <Text style={{ color: C.muted }}>{res.length} barang</Text>
          <Row style={{ gap: 6 }}>
            {SORTS.map((s) => (
              <Pressable key={s} onPress={() => setSort(s)} style={[styles.sort, sort === s && selected]}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: sort === s ? C.primary : C.text }}>{s}</Text>
              </Pressable>
            ))}
          </Row>
        </Row>
        {res.length ? (
          <Grid items={res} />
        ) : (
          <EmptyState
            icon="search"
            title="Belum ketemu nih"
            text="Coba ubah kata kunci atau longgarkan filter lokasi, harga, dan ketersediaan."
            action="Reset pencarian"
            onAction={() => {
              setQ('');
              setCat('Semua');
              setPrice(0);
              setArea(AREAS[0]);
              setAvailableOnly(false);
            }}
          />
        )}
      </ScrollView>
    </Screen>
  );
}

function Wrap({ children }: { children: React.ReactNode }) {
  return <View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: 8, marginBottom: 12 }}>{children}</View>;
}

const styles = StyleSheet.create({
  where: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: C.selectedBg },
  whereText: { color: C.ink, fontSize: 12, fontWeight: '600', flexShrink: 1 },
  title: { fontSize: 28, fontWeight: '800', color: C.ink, letterSpacing: -0.6 },
  search: { flex: 1, flexDirection: 'row', alignItems: 'center', height: 50, borderRadius: R.md, backgroundColor: C.white, borderWidth: 1.5, borderColor: C.line, paddingHorizontal: 14 },
  input: { flex: 1, marginLeft: 8, fontSize: 15, color: C.ink, height: 48 },
  filterBtn: { width: 50, height: 50, borderRadius: R.md, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  count: { position: 'absolute', top: 6, right: 6, backgroundColor: C.orange, width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  filterPanel: { marginHorizontal: 20, marginBottom: 14, padding: 16, borderRadius: R.lg, backgroundColor: C.white, borderWidth: 1, borderColor: C.line },
  fLabel: { fontWeight: '700', color: C.ink, marginBottom: 8, marginTop: 4 },
  sort: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: C.white, borderWidth: 1, borderColor: C.line },
});
