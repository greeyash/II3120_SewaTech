import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Chip, Grid, IconBtn, ItemCard, Logo, Notice, Row, Screen, SectionTitle } from '../../components/ui';
import { CATEGORIES } from '../../data';
import { useStore } from '../../store';
import { C, R, shadow } from '../../theme';
import { addDays, fmtDate, startOfToday } from '../../utils';

export default function Home() {
  const { items, user, threads, searchPrefs } = useStore();
  const [cat, setCat] = useState('Semua');
  const live = items.filter((i) => i.status !== 'kurasi' && i.ownerId !== 'me');
  const filtered = cat === 'Semua' ? live : live.filter((i) => i.category === cat);
  const nearby = [...filtered].sort((a, b) => a.distanceKm - b.distanceKm).slice(0, 6);
  const fresh = filtered.filter((i) => i.isNew).slice(0, 4);
  const unread = Object.values(threads).some((t) => t.unread);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: 20 }}>
          <Row style={{ justifyContent: 'space-between', height: 56 }}>
            <Logo />
            <Row>
              <IconBtn name="notifications-outline" badge={unread} onPress={() => router.push('/chats')} />
              <Pressable onPress={() => router.push('/profile')} style={styles.avatar}>
                <Text style={{ color: C.ink, fontWeight: '800' }}>{(user.name || 'S')[0].toUpperCase()}</Text>
              </Pressable>
            </Row>
          </Row>

          <Text style={styles.greet}>Halo, {user.name || 'Sobat'} 👋</Text>
          <Text style={styles.hero}>Sewa gadget{'\n'}tanpa ribet.</Text>

          {user.verification !== 'verified' ? (
            <Pressable onPress={() => router.push('/verify')} style={{ marginTop: 14 }}>
              <Notice
                tone="warning"
                icon="shield-half-outline"
                text={user.verification === 'pending' ? 'Identitasmu sedang diverifikasi…' : 'Verifikasi KTP dulu supaya bisa menyewa & menyewakan. Ketuk di sini.'}
              />
            </Pressable>
          ) : null}

          <View style={styles.searchCard}>
            <Pressable style={[styles.searchRow, { borderBottomWidth: 1, borderBottomColor: C.line }]} onPress={() => router.push('/location')}>
              <Ionicons name="location-outline" size={20} color={C.muted} />
              <View style={{ marginLeft: 10, flex: 1 }}>
                <Text style={styles.searchLabel}>Lokasi kamu</Text>
                <Text style={styles.searchValue}>{searchPrefs.area}, Bandung</Text>
              </View>
            </Pressable>
            <Pressable style={styles.searchRow} onPress={() => router.push('/location?focus=date')}>
              <Ionicons name="calendar-outline" size={20} color={C.muted} />
              <View style={{ marginLeft: 10, flex: 1 }}>
                <Text style={styles.searchLabel}>Mulai sewa</Text>
                <Text style={styles.searchValue}>{fmtDate(addDays(startOfToday(), searchPrefs.startOffset))} · {searchPrefs.days} hari</Text>
              </View>
            </Pressable>
            <Pressable style={styles.go} onPress={() => router.push('/location')}>
              <Ionicons name="arrow-forward" size={22} color="#fff" />
            </Pressable>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20 }}>
          {CATEGORIES.map((c) => (
            <Chip key={c.key} label={c.key} active={cat === c.key} onPress={() => setCat(c.key)} />
          ))}
        </ScrollView>

        <View style={{ paddingHorizontal: 20 }}>
          <Pressable style={styles.promo} onPress={() => router.push('/sop')}>
            <View style={styles.pill}>
              <Ionicons name="shield-checkmark" size={12} color={C.ink} />
              <Text style={{ color: C.ink, fontSize: 10, fontWeight: '800', marginLeft: 4 }}>ESCROW</Text>
            </View>
            <Text style={styles.promoSmall}>TRANSAKSI AMAN</Text>
            <Text style={styles.promoBig}>Dana ditahan{'\n'}sampai barang{'\n'}kembali.</Text>
            <Text style={styles.promoText}>Tanpa titip KTP asli. Deposit dikembalikan otomatis.</Text>
            <View style={styles.ring} />
            <View style={styles.shield}>
              <Ionicons name="shield-checkmark-outline" size={40} color={C.primary} />
            </View>
          </Pressable>

          <SectionTitle title="Terdekat" action="LIHAT SEMUA" onAction={() => router.push('/search')} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
          {nearby.map((i) => (
            <ItemCard key={i.id} item={i} width={240} big />
          ))}
        </ScrollView>

        {fresh.length ? (
          <View style={{ paddingHorizontal: 20 }}>
            <SectionTitle title="Baru" action="LIHAT SEMUA" onAction={() => router.push('/search')} />
            <Grid items={fresh} />
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: C.orange, alignItems: 'center', justifyContent: 'center', marginLeft: 6 },
  greet: { color: C.muted, fontSize: 15, marginTop: 6 },
  hero: { fontSize: 34, fontWeight: '800', color: C.ink, letterSpacing: -1, lineHeight: 38, marginTop: 4 },
  searchCard: { marginTop: 18, backgroundColor: '#fff', borderRadius: R.lg, paddingHorizontal: 16, paddingVertical: 4, ...shadow },
  searchRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, marginRight: 60 },
  searchLabel: { fontSize: 12, color: C.muted },
  searchValue: { fontSize: 15, fontWeight: '700', color: C.ink, marginTop: 2 },
  go: { position: 'absolute', right: 14, top: '50%', marginTop: -24, width: 48, height: 48, borderRadius: 24, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  promo: { marginTop: 20, height: 200, borderRadius: R.lg, backgroundColor: C.primarySoft, overflow: 'hidden', padding: 18 },
  pill: { position: 'absolute', top: 16, right: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: C.orange, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  promoSmall: { color: C.ink, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  promoBig: { color: C.ink, fontSize: 24, fontWeight: '800', lineHeight: 27, marginTop: 6, letterSpacing: -0.5 },
  promoText: { color: C.ink, fontSize: 11, marginTop: 6, maxWidth: 180 },
  ring: { position: 'absolute', right: 8, bottom: 8, width: 112, height: 112, borderRadius: 56, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.8)', borderStyle: 'dashed' },
  shield: { position: 'absolute', right: 22, bottom: 22, width: 84, height: 84, borderRadius: 42, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', ...shadow, shadowOpacity: 0.15 },
});
