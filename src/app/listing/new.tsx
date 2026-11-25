import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BottomBar, Btn, Chip, Field, Header, Notice, Screen } from '../../components/ui';
import { Category, CATEGORIES, SOP } from '../../data';
import { pickPhoto } from '../../photo';
import { useStore } from '../../store';
import { C, R, imgFill } from '../../theme';
import { rp } from '../../utils';

export default function NewListing() {
  const { addListing } = useStore();
  const [photos, setPhotos] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [cat, setCat] = useState<Category>('Kamera');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState('');
  const [appraisal, setAppraisal] = useState('');
  const [done, setDone] = useState(false);
  const p = parseInt(price.replace(/\D/g, ''), 10) || 0;
  const a = parseInt(appraisal.replace(/\D/g, ''), 10) || 0;
  const valid = photos.length > 0 && name.trim().length > 2 && desc.trim().length > 5 && p > 0 && a > 0;

  if (done)
    return (
      <Screen>
        <Header title="Listing terkirim" onBack={() => router.replace('/profile')} />
        <View style={{ flex: 1, alignItems: 'center', padding: 28, paddingTop: 60 }}>
          <View style={styles.big}>
            <Ionicons name="hourglass" size={40} color="#B45309" />
          </View>
          <Text style={{ fontSize: 22, fontWeight: '800', color: C.ink, marginTop: 18 }}>Sedang dikurasi admin</Text>
          <Text style={{ color: C.muted, textAlign: 'center', marginTop: 8, lineHeight: 21 }}>
            Admin mengecek kelengkapan info, memastikan barang termasuk elektronik, dan menilai kewajaran nilai taksir. Listing akan tayang otomatis setelah lolos kurasi.
          </Text>
        </View>
        <BottomBar>
          <Btn title="Lihat di profil" style={{ flex: 1 }} onPress={() => router.replace('/profile')} />
        </BottomBar>
      </Screen>
    );

  return (
    <Screen>
      <Header title="Sewakan barang" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>Foto barang</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            {photos.map((u) => (
              <View key={u} style={styles.photo}>
                <Image source={{ uri: u }} style={imgFill} />
                <Pressable style={styles.rm} onPress={() => setPhotos(photos.filter((x) => x !== u))}>
                  <Ionicons name="close" size={14} color="#fff" />
                </Pressable>
              </View>
            ))}
            {photos.length < 5 ? (
              <Pressable
                style={[styles.photo, styles.add]}
                onPress={async () => {
                  const u = await pickPhoto('library');
                  if (u) setPhotos([...photos, u]);
                }}>
                <Ionicons name="camera" size={24} color={C.muted} />
                <Text style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{photos.length}/5</Text>
              </Pressable>
            ) : null}
          </ScrollView>

          <Field label="Nama barang" value={name} onChangeText={setName} placeholder="cth. Fujifilm X-T30 + lensa kit" />

          <Text style={styles.label}>Kategori</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: 8, marginBottom: 16 }}>
            {CATEGORIES.filter((c) => c.key !== 'Semua').map((c) => (
              <Chip key={c.key} label={c.key} icon={c.icon as any} active={cat === c.key} onPress={() => setCat(c.key as Category)} />
            ))}
          </View>

          <Field label="Deskripsi & kondisi" value={desc} onChangeText={setDesc} placeholder="Kelengkapan, minus, kondisi fisik…" multiline />
          <Field label="Harga sewa per hari (Rp)" value={p ? rp(p).slice(2) : ''} onChangeText={setPrice} placeholder="100.000" keyboardType="number-pad" />
          <Field label="Nilai taksir barang (Rp)" value={a ? rp(a).slice(2) : ''} onChangeText={setAppraisal} placeholder="8.000.000" keyboardType="number-pad" />
          {a ? (
            <Text style={{ color: C.muted, fontSize: 12, marginTop: -6, marginBottom: 14 }}>
              Deposit penyewa: {rp(a * 0.2)} (terpercaya) – {rp(a * 0.3)} (baru)
            </Text>
          ) : null}

          <Text style={styles.label}>Ketentuan sewa (otomatis)</Text>
          <View style={styles.box}>
            {SOP.slice(2, 5).map((t) => (
              <Text key={t} style={{ color: C.text, fontSize: 13, lineHeight: 19, marginBottom: 6 }}>
                • {t}
              </Text>
            ))}
          </View>
          <View style={{ marginTop: 14 }}>
            <Notice tone="warning" icon="information-circle-outline" text="Hanya barang elektronik yang diterima. Setiap listing dikurasi admin sebelum tayang di katalog." />
          </View>
        </ScrollView>
        <BottomBar>
          <Btn
            title="Kirim untuk dikurasi"
            style={{ flex: 1 }}
            disabled={!valid}
            onPress={() => {
              addListing({
                name: name.trim(),
                category: cat,
                pricePerDay: p,
                appraisal: a,
                shortName: name.trim(),
                image: { uri: photos[0] },
                localPhotos: photos,
                specs: [
                  { icon: 'pricetag', label: 'Kategori', value: cat },
                  { icon: 'calendar', label: 'Min. sewa', value: '1 hari' },
                  { icon: 'shield-checkmark', label: 'Penyedia', value: 'Terverifikasi' },
                ],
                condition: desc.trim(),
                terms: SOP.slice(2, 5),
              });
              setDone(true);
            }}
          />
        </BottomBar>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '600', color: C.text, marginBottom: 8 },
  photo: { width: 96, height: 96, borderRadius: R.md, marginRight: 10, overflow: 'hidden', backgroundColor: C.card },
  add: { alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderStyle: 'dashed', borderColor: C.line },
  rm: { position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  box: { backgroundColor: C.card, borderRadius: R.lg, padding: 14 },
  big: { width: 90, height: 90, borderRadius: 45, backgroundColor: C.yellowSoft, alignItems: 'center', justifyContent: 'center' },
});
