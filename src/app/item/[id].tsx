import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Badge, BottomBar, Btn, Header, IconBtn, Row, Screen, SectionTitle, Stars } from '../../components/ui';
import { gallery, ownerOf } from '../../data';
import { DEPOSIT_NEW, DEPOSIT_TRUSTED, useStore } from '../../store';
import { C, R, cardWhite, imgFill, selected } from '../../theme';
import { addDays, fmtDay, roundTo, rp, startOfToday } from '../../utils';

export default function ItemDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { items, favorites, toggleFav, threads, user } = useStore();
  const item = items.find((i) => i.id === id);
  const [photo, setPhoto] = useState(0);
  const [tier, setTier] = useState(1);
  if (!item) return null;

  const owner = item.ownerId === 'me' ? { name: user.name || 'Kamu', rating: 0, rentals: 0, area: 'Bandung', responseTime: '-', online: true } : ownerOf(item);
  const pics = gallery(item);
  const fav = favorites.includes(item.id);
  const agreed = threads[item.id]?.agreedPrice;
  const today = startOfToday();
  const tiers = [
    { label: 'PER JAM', price: roundTo(item.pricePerDay / 5, 5000), unit: 'per jam', days: 1 },
    { label: 'HARIAN', price: item.pricePerDay, unit: 'per hari', days: 1 },
    { label: 'MINGGUAN', price: roundTo(item.pricePerDay * 7 * 0.8, 10000), unit: 'per minggu', days: 7 },
  ];
  const media = pics.slice(1, 4);

  return (
    <Screen>
      <Header title="Detail barang" right={<IconBtn name={fav ? 'heart' : 'heart-outline'} color={fav ? C.error : C.ink} onPress={() => toggleFav(item.id)} />} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={[cardWhite, { padding: 10 }]}>
          <View style={styles.mainImg}>
            <Image source={pics[photo]} style={imgFill} resizeMode="cover" />
            <Row style={{ position: 'absolute', top: 12, left: 12, gap: 6 }}>
              {item.distanceKm ? <Badge tone="orange" label={`${String(item.distanceKm).replace('.', ',')} KM`} /> : null}
              {item.bookedOffsets.includes(0) ? <Badge tone="dark" label="DISEWA HARI INI" /> : <Badge tone="success" label="TERSEDIA" />}
            </Row>
          </View>
          {pics.length > 1 ? (
            <Row style={{ gap: 8, marginTop: 10 }}>
              {pics.map((p, i) => (
                <Pressable key={i} onPress={() => setPhoto(i)} style={[styles.thumb, photo === i && { borderColor: C.primary }]}>
                  <Image source={p} style={imgFill} />
                </Pressable>
              ))}
            </Row>
          ) : null}
        </View>

        <Text style={styles.name}>{item.name}</Text>
        <Row style={{ marginTop: 6, gap: 8 }}>
          {item.rating ? <Stars value={item.rating} /> : null}
          <Text style={{ color: C.muted }}>·   {item.reviews} ulasan   ·   {item.category}</Text>
        </Row>

        <View style={[cardWhite, { padding: 16, marginTop: 16 }]}>
          <Row>
            <View style={styles.ownerAvatar}>
              <Ionicons name="storefront" size={20} color="#fff" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Row style={{ gap: 6 }}>
                <Text style={{ fontWeight: '700', fontSize: 16, color: C.ink }}>{owner.name}</Text>
                <Ionicons name="checkmark-circle" size={16} color={C.primary} />
              </Row>
              <Row style={{ gap: 6, marginTop: 2 }}>
                {owner.rating ? <Stars value={owner.rating} size={13} /> : null}
                <Text style={{ color: C.muted, fontSize: 12 }}>
                  ·  {owner.rentals} sewa · {owner.area.split(',')[0]}
                </Text>
              </Row>
            </View>
            {item.ownerId !== 'me' ? (
              <Pressable style={styles.chatBtn} onPress={() => router.push(`/chat/${item.id}`)}>
                <Ionicons name="chatbubble-outline" size={18} color={C.ink} />
              </Pressable>
            ) : null}
          </Row>
          <Text style={{ color: C.muted, marginTop: 10, fontSize: 13 }}>Identitas penyedia terverifikasi KTP · Balas chat {owner.responseTime}</Text>
        </View>

        <Pressable style={[cardWhite, styles.escrow]} onPress={() => router.push('/sop')}>
          <View style={styles.escrowIcon}>
            <Ionicons name="shield-checkmark-outline" size={18} color={C.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ fontWeight: '700', color: C.ink }}>Escrow SewaTech</Text>
            <Text style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>
              Deposit {rp(item.appraisal * DEPOSIT_TRUSTED)}–{rp(item.appraisal * DEPOSIT_NEW)} · tanpa titip KTP
            </Text>
          </View>
          <Badge tone="successSoft" label="AMAN" />
        </Pressable>

        <SectionTitle title="Pilih tarif" />
        <Row style={{ gap: 8 }}>
          {tiers.map((t, i) => (
            <Pressable key={t.label} onPress={() => setTier(i)} style={[styles.tier, tier === i && selected]}>
              <Text style={[styles.tierLabel, tier === i && { color: C.primary }]}>{t.label}</Text>
              <View>
                <Text style={[styles.tierPrice, tier === i && { color: C.primary }]}>{rp(t.price)}</Text>
                <Text style={{ fontSize: 11, color: tier === i ? C.primary : C.muted }}>{t.unit}</Text>
              </View>
            </Pressable>
          ))}
        </Row>
        {tier === 2 ? <Text style={styles.hint}>Hemat 20% untuk sewa 7 hari.</Text> : null}
        {tier === 0 ? <Text style={styles.hint}>Sewa per jam minimal 3 jam, khusus serah terima langsung.</Text> : null}

        <SectionTitle title="Spesifikasi" />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10 }}>
          {item.specs.map((sp) => (
            <View key={sp.label + sp.value} style={[cardWhite, styles.spec]}>
              <Ionicons name={sp.icon as any} size={18} color={C.primary} />
              <Text style={{ color: C.muted, fontSize: 11, marginTop: 6 }}>{sp.label}</Text>
              <Text style={{ fontWeight: '700', color: C.ink, marginTop: 2, fontSize: 13 }} numberOfLines={1}>
                {sp.value}
              </Text>
            </View>
          ))}
        </View>

        <SectionTitle title="Kondisi awal" />
        <View style={[cardWhite, { padding: 16 }]}>
          <Row style={{ marginBottom: 10, gap: 6 }}>
            <Ionicons name="camera-outline" size={16} color={C.muted} />
            <Text style={{ color: C.muted, fontSize: 11 }}>Foto & video dari penyedia · acuan saat pengembalian</Text>
          </Row>
          {media.length ? (
            <Row style={{ gap: 8, marginBottom: 10 }}>
              {media.map((m, i) => (
                <Image key={i} source={m} style={styles.media} />
              ))}
              <View style={styles.media}>
                <Image source={pics[0]} style={imgFill} />
                <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(7,14,82,0.45)' }]} />
                <View style={styles.play}>
                  <Ionicons name="play" size={14} color={C.primary} />
                </View>
                <Text style={styles.dur}>0:24</Text>
              </View>
            </Row>
          ) : null}
          <Text style={{ color: C.text, lineHeight: 21 }}>{item.condition}</Text>
          <Text style={{ color: C.muted, fontSize: 12, marginTop: 10 }}>Nilai taksir (dasar deposit): {rp(item.appraisal)}</Text>
        </View>

        <SectionTitle title="Jadwal ketersediaan" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {Array.from({ length: 14 }).map((_, n) => {
            const d = fmtDay(addDays(today, n));
            const booked = item.bookedOffsets.includes(n);
            return (
              <View key={n} style={[styles.day, booked && styles.dayBooked]}>
                <Text style={{ fontSize: 11, color: booked ? C.faint : C.muted }}>{d.dow}</Text>
                <Text style={{ fontSize: 17, fontWeight: '800', color: booked ? C.faint : C.ink, marginTop: 2, textDecorationLine: booked ? 'line-through' : 'none' }}>{d.date}</Text>
                <View style={{ width: 6, height: 6, borderRadius: 3, marginTop: 4, backgroundColor: booked ? C.error : C.primary }} />
              </View>
            );
          })}
        </ScrollView>
        <Row style={{ gap: 14, marginTop: 8 }}>
          <Legend color={C.primary} label="Tersedia" />
          <Legend color={C.error} label="Sudah disewa" />
        </Row>

        <SectionTitle title="Ketentuan sewa" />
        {item.terms.map((t) => (
          <Row key={t} style={{ alignItems: 'flex-start', marginBottom: 8 }}>
            <Ionicons name="checkmark-circle" size={16} color={C.success} style={{ marginTop: 2 }} />
            <Text style={{ marginLeft: 8, color: C.text, flex: 1, lineHeight: 20 }}>{t}</Text>
          </Row>
        ))}
      </ScrollView>

      {item.ownerId !== 'me' ? (
        <BottomBar>
          <View style={{ flex: 1 }}>
            <Text style={{ color: C.muted, fontSize: 12 }}>{agreed ? 'Harga hasil nego' : 'Harga'}</Text>
            <Text style={{ fontSize: 18, fontWeight: '800', color: C.ink }}>{rp(agreed ?? item.pricePerDay)}</Text>
            <Text style={{ fontSize: 11, color: C.muted }}>per hari</Text>
          </View>
          <Btn title="Nego" variant="outline" icon="chatbubble-outline" style={{ paddingHorizontal: 14 }} onPress={() => router.push(`/chat/${item.id}`)} />
          <Btn title="Sewa" icon="arrow-forward" style={{ paddingHorizontal: 16 }} onPress={() => router.push({ pathname: '/book/[id]', params: { id: item.id, days: String(tiers[tier].days) } })} />
        </BottomBar>
      ) : null}
    </Screen>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <Row style={{ gap: 6 }}>
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
      <Text style={{ fontSize: 12, color: C.muted }}>{label}</Text>
    </Row>
  );
}

const styles = StyleSheet.create({
  mainImg: { height: 280, borderRadius: R.md, overflow: 'hidden', backgroundColor: C.card },
  thumb: { flex: 1, height: 64, borderRadius: R.sm, overflow: 'hidden', borderWidth: 2, borderColor: 'transparent', backgroundColor: C.card },
  name: { fontSize: 20, fontWeight: '800', color: C.ink, marginTop: 16, letterSpacing: -0.3 },
  ownerAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  chatBtn: { width: 40, height: 40, borderRadius: R.sm, borderWidth: 1, borderColor: C.line, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  escrow: { marginTop: 12, flexDirection: 'row', alignItems: 'center', padding: 14 },
  escrowIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.primarySoft, alignItems: 'center', justifyContent: 'center' },
  tier: { flex: 1, borderWidth: 1, borderColor: C.line, borderRadius: R.sm, padding: 10, height: 86, justifyContent: 'space-between', backgroundColor: '#fff' },
  tierLabel: { fontSize: 11, color: C.muted, letterSpacing: 0.5 },
  tierPrice: { fontSize: 15, fontWeight: '800', color: C.ink },
  hint: { color: C.primary, fontSize: 12, marginTop: 8 },
  spec: { width: '31.5%', padding: 12, borderRadius: R.md },
  media: { width: 66, height: 66, borderRadius: 12, overflow: 'hidden', backgroundColor: C.card },
  play: { position: 'absolute', left: 20, top: 16, width: 26, height: 26, borderRadius: 13, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', paddingLeft: 2 },
  dur: { position: 'absolute', right: 6, bottom: 4, color: '#fff', fontSize: 10, fontWeight: '700' },
  day: { width: 50, alignItems: 'center', paddingVertical: 10, borderRadius: R.md, borderWidth: 1, borderColor: C.line, marginRight: 7, backgroundColor: '#fff' },
  dayBooked: { backgroundColor: '#ECEEF3', borderColor: '#ECEEF3' },
});
