import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Badge, Btn, IconName, Row, Screen, SectionTitle, Tone } from '../../components/ui';
import { cover } from '../../data';
import { DEPOSIT_NEW, DEPOSIT_TRUSTED, useStore } from '../../store';
import { C, R, cardWhite, imgFill } from '../../theme';
import { rp } from '../../utils';

const VER: Record<string, { label: string; tone: Tone; icon: IconName }> = {
  verified: { label: 'TERVERIFIKASI', tone: 'successSoft', icon: 'shield-checkmark' },
  pending: { label: 'SEDANG DIVERIFIKASI', tone: 'warning', icon: 'time' },
  rejected: { label: 'PERLU UNGGAH ULANG', tone: 'error', icon: 'alert-circle' },
  none: { label: 'BELUM VERIFIKASI', tone: 'info', icon: 'shield-outline' },
};

export default function Profile() {
  const { user, items, orders, favorites, logout, depositRateFor } = useStore();
  const mine = items.filter((i) => i.ownerId === 'me');
  const v = VER[user.verification];

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
        <Text style={styles.title}>Akun</Text>

        <View style={styles.profile}>
          <View style={styles.avatar}>
            {user.selfieUri ? (
              <Image source={{ uri: user.selfieUri }} style={imgFill} />
            ) : (
              <Text style={{ color: C.ink, fontSize: 26, fontWeight: '800' }}>{(user.name || 'S')[0].toUpperCase()}</Text>
            )}
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={{ fontSize: 20, fontWeight: '800', color: C.ink }}>{user.name || 'Pengguna'}</Text>
            <Text style={{ color: C.muted, marginTop: 2 }}>{user.email}</Text>
            <Pressable onPress={() => user.verification !== 'verified' && router.push('/verify')} style={{ marginTop: 8 }}>
              <Badge label={v.label} tone={v.tone} icon={v.icon} />
            </Pressable>
          </View>
        </View>

        <Row style={{ gap: 10, marginTop: 16 }}>
          <Stat value={String(user.completedRentals)} label="Sewa selesai" />
          <Stat value={`${Math.round(depositRateFor() * 100)}%`} label="Tarif deposit" />
          <Stat value={String(favorites.length)} label="Favorit" onPress={() => router.push('/favorites')} />
        </Row>
        <Text style={{ color: C.muted, fontSize: 12, marginTop: 8, lineHeight: 17 }}>
          Deposit dihitung dari nilai taksir barang: {DEPOSIT_NEW * 100}% untuk penyewa baru, {DEPOSIT_TRUSTED * 100}% untuk penyewa terpercaya.
        </Text>

        <SectionTitle title="Barang yang kusewakan" />
        {mine.length ? (
          mine.map((i) => (
            <Pressable key={i.id} style={styles.listing} onPress={() => i.status === 'tayang' && router.push(`/item/${i.id}`)}>
              <Image source={cover(i)} style={styles.thumb} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ fontWeight: '700', color: C.ink }} numberOfLines={1}>
                  {i.name}
                </Text>
                <Text style={{ color: C.muted, fontSize: 13, marginTop: 2 }}>{rp(i.pricePerDay)}/hari</Text>
              </View>
              {i.status === 'kurasi' ? <Badge label="DIKURASI ADMIN" tone="warning" icon="time" /> : <Badge label="TAYANG" tone="successSoft" icon="checkmark" />}
            </Pressable>
          ))
        ) : (
          <Text style={{ color: C.muted, lineHeight: 20 }}>Belum ada barang yang kamu sewakan. Gadget nganggur bisa jadi penghasilan tambahan.</Text>
        )}
        <Btn title="Sewakan barang" icon="add" style={{ marginTop: 12 }} onPress={() => router.push(user.verification === 'verified' ? '/listing/new' : '/verify')} />

        <SectionTitle title="Lainnya" />
        <View style={styles.menu}>
          <MenuItem icon="shield-checkmark-outline" label="Verifikasi identitas" onPress={() => router.push('/verify')} />
          <MenuItem icon="receipt-outline" label={`Pesanan saya (${orders.length})`} onPress={() => router.push('/orders')} />
          <MenuItem icon="heart-outline" label={`Favorit saya (${favorites.length})`} onPress={() => router.push('/favorites')} />
          <MenuItem icon="information-circle-outline" label="SOP & ketentuan sewa" onPress={() => router.push('/sop')} />
          <MenuItem
            icon="log-out-outline"
            label="Keluar"
            danger
            last
            onPress={() => {
              logout();
              router.replace('/welcome');
            }}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

function Stat({ value, label, onPress }: { value: string; label: string; onPress?: () => void }) {
  return (
    <Pressable style={styles.stat} onPress={onPress} disabled={!onPress}>
      <Row style={{ justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 20, fontWeight: '800', color: C.ink }}>{value}</Text>
        {onPress ? <Ionicons name="chevron-forward" size={16} color={C.ink} /> : null}
      </Row>
      <Text style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{label}</Text>
    </Pressable>
  );
}

function MenuItem({ icon, label, onPress, danger, last }: { icon: IconName; label: string; onPress: () => void; danger?: boolean; last?: boolean }) {
  return (
    <Pressable onPress={onPress} style={[styles.menuItem, !last && { borderBottomWidth: 1, borderBottomColor: C.line }]}>
      <Ionicons name={icon} size={20} color={danger ? C.error : C.ink} />
      <Text style={{ flex: 1, marginLeft: 12, fontWeight: '600', color: danger ? C.error : C.ink }}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={C.faint} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: '800', color: C.ink, letterSpacing: -0.6 },
  profile: { flexDirection: 'row', alignItems: 'center', marginTop: 18 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: C.orange, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  stat: { flex: 1, backgroundColor: C.card, borderRadius: R.md, padding: 14 },
  listing: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  thumb: { width: 52, height: 52, borderRadius: R.sm, backgroundColor: C.card },
  menu: { ...cardWhite, shadowOpacity: 0, elevation: 0, paddingHorizontal: 16 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16 },
});
