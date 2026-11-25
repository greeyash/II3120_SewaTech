import { ScrollView, Text, View } from 'react-native';
import { Header, Row, Screen, SectionTitle } from '../components/ui';
import { SOP } from '../data';
import { C, R } from '../theme';

const ESCROW = [
  ['Bayar', 'Dana sewa + deposit masuk ke rekening bersama SewaTech, bukan langsung ke penyedia.'],
  ['Serah terima', 'Penyedia memotret kondisi awal. Kamu konfirmasi saat barang diterima.'],
  ['Kembali', 'Penyedia memeriksa barang dibandingkan foto kondisi awal.'],
  ['Cair', 'Kondisi sesuai → deposit kembali ke kamu, dana sewa ke penyedia. Tidak sesuai → klaim & mediasi.'],
];

export default function SopPage() {
  return (
    <Screen>
      <Header title="SOP & ketentuan" />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
        <SectionTitle title="Cara kerja escrow" />
        {ESCROW.map(([t, d], i) => (
          <Row key={t} style={{ alignItems: 'flex-start', marginBottom: 14 }}>
            <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#fff', fontWeight: '800' }}>{i + 1}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ fontWeight: '700', color: C.ink }}>{t}</Text>
              <Text style={{ color: C.muted, marginTop: 2, lineHeight: 19 }}>{d}</Text>
            </View>
          </Row>
        ))}
        <SectionTitle title="SOP sewa" />
        <View style={{ backgroundColor: C.card, borderRadius: R.lg, padding: 16 }}>
          {SOP.map((t, i) => (
            <Text key={i} style={{ color: C.text, lineHeight: 21, marginBottom: 8 }}>
              {i + 1}. {t}
            </Text>
          ))}
        </View>
        <SectionTitle title="Deposit" />
        <Text style={{ color: C.text, lineHeight: 21 }}>
          Deposit = nilai taksir barang × tarif: 30% untuk penyewa baru dan 20% untuk penyewa terpercaya. Tidak ada biaya layanan — yang dibayar hanya sewa + deposit. SewaTech tidak menyediakan proteksi, jadi deposit menjadi jaminan utama; kerugian di atas deposit menjadi tanggung jawab penyewa.
        </Text>
      </ScrollView>
    </Screen>
  );
}
