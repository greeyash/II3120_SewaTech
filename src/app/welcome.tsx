import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Btn, IconName, Logo, Row } from '../components/ui';
import { PHOTOS } from '../data';
import { useStore } from '../store';
import { C, R } from '../theme';

const POINTS: { icon: IconName; text: string }[] = [
  { icon: 'shield-checkmark', text: 'Semua pengguna terverifikasi KTP digital' },
  { icon: 'pricetags', text: 'Nego harga langsung, tercatat di aplikasi' },
  { icon: 'lock-closed', text: 'Dana & deposit ditahan escrow sampai barang kembali' },
];

export default function Welcome() {
  const insets = useSafeAreaInsets();
  const { login } = useStore();
  return (
    <View style={{ flex: 1, backgroundColor: C.bg, paddingTop: insets.top + 12, paddingBottom: Math.max(insets.bottom, 20), paddingHorizontal: 24 }}>
      <Logo size={26} />
      <View style={styles.collage}>
        <Image source={PHOTOS.camera} style={[styles.tile, { top: 0, left: 0, width: '58%', height: 176 }]} />
        <Image source={PHOTOS.console} style={[styles.tile, { top: 0, right: 0, width: '38%', height: 104 }]} />
        <Image source={PHOTOS.headphone} style={[styles.tile, { top: 116, right: 0, width: '38%', height: 134 }]} />
        <View style={[styles.tile, { top: 188, left: 0, width: '58%', height: 62, overflow: 'hidden', backgroundColor: '#B0D6F5' }]}>
          <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '45%', backgroundColor: '#FAEDB0' }} />
          <Image source={PHOTOS.laptopGray} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
        </View>
        <View style={styles.floatTag}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: C.ink }}>Canon EOS M100</Text>
          <Text style={{ fontSize: 13, fontWeight: '800', color: C.primary }}>Rp75.000/hari</Text>
        </View>
      </View>
      <Text style={styles.title}>Butuh gadget sebentar?{'\n'}Sewa aja.</Text>
      <View style={{ marginTop: 16, gap: 10 }}>
        {POINTS.map((p) => (
          <Row key={p.text}>
            <View style={styles.icon}>
              <Ionicons name={p.icon} size={16} color={C.primary} />
            </View>
            <Text style={{ color: C.text, marginLeft: 10, flex: 1 }}>{p.text}</Text>
          </Row>
        ))}
      </View>
      <View style={{ flex: 1 }} />
      <Btn title="Daftar akun baru" onPress={() => router.push('/register')} />
      <Btn
        title="Sudah punya akun? Masuk"
        variant="outline"
        style={{ marginTop: 10 }}
        onPress={() => {
          login(true);
          router.replace('/');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  collage: { height: 250, marginTop: 20 },
  tile: { position: 'absolute', borderRadius: R.lg, backgroundColor: C.card },
  floatTag: { position: 'absolute', left: 14, top: 120, backgroundColor: '#fff', padding: 10, borderRadius: R.sm, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 10, elevation: 3 },
  title: { fontSize: 30, fontWeight: '800', color: C.ink, letterSpacing: -0.8, lineHeight: 34, marginTop: 22 },
  icon: { width: 30, height: 30, borderRadius: 15, backgroundColor: C.selectedBg, alignItems: 'center', justifyContent: 'center' },
});
