import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BottomBar, Btn, Header, IconName, Notice, Row, Screen } from '../components/ui';
import { pickPhoto } from '../photo';
import { useStore } from '../store';
import { C, R, imgFill } from '../theme';

export default function Verify() {
  const { user, submitVerification } = useStore();
  const [ktp, setKtp] = useState<string | null>(user.ktpUri ?? null);
  const [selfie, setSelfie] = useState<string | null>(user.selfieUri ?? null);
  const [rejectSim, setRejectSim] = useState(false);
  const status = user.verification;

  const goHome = () => (router.canGoBack() ? router.back() : router.replace('/'));

  if (status === 'pending' || status === 'verified') {
    const ok = status === 'verified';
    return (
      <Screen>
        <Header title="Verifikasi identitas" onBack={goHome} />
        <View style={{ flex: 1, alignItems: 'center', padding: 28, paddingTop: 60 }}>
          <View style={[styles.bigIcon, { backgroundColor: ok ? C.primarySoft : C.yellowSoft }]}>
            {ok ? <Ionicons name="shield-checkmark" size={44} color={C.primaryDark} /> : <ActivityIndicator size="large" color="#B45309" />}
          </View>
          <Text style={styles.h1}>{ok ? 'Akun terverifikasi!' : 'Memverifikasi dokumen…'}</Text>
          <Text style={styles.p}>
            {ok
              ? 'Identitasmu sudah sah. Sekarang kamu bisa menyewa dan menyewakan barang di SewaTech. Penyedia & penyewa lain akan melihat badge terverifikasi di profilmu.'
              : 'Sistem sedang mencocokkan foto KTP dengan foto diri, mengecek NIK belum terdaftar di akun lain, dan tidak masuk daftar hitam.'}
          </Text>
          {!ok ? (
            <View style={{ marginTop: 20, alignSelf: 'stretch', gap: 8 }}>
              <CheckLine icon="scan" text="Membaca data NIK dari KTP" />
              <CheckLine icon="happy" text="Mencocokkan wajah dengan foto diri" />
              <CheckLine icon="people" text="Cek 1 NIK = 1 akun & daftar hitam" />
            </View>
          ) : null}
        </View>
        {ok ? (
          <BottomBar>
            <Btn title="Mulai jelajah" style={{ flex: 1 }} onPress={() => router.replace('/')} />
          </BottomBar>
        ) : null}
      </Screen>
    );
  }

  return (
    <Screen>
      <Header title="Verifikasi identitas" onBack={goHome} />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Row style={{ gap: 6, marginBottom: 10 }}>
          <View style={styles.stepBar} />
          <View style={styles.stepBar} />
          <Text style={{ color: C.muted, fontSize: 12, fontWeight: '600', marginLeft: 4 }}>Langkah 2 dari 2 · Verifikasi identitas</Text>
        </Row>
        <Text style={styles.title}>Unggah KTP & foto diri</Text>
        <Text style={{ color: C.muted, marginTop: 6, lineHeight: 20 }}>Pengganti titip KTP asli. Cukup sekali, dan lawan transaksimu tahu kamu sudah terverifikasi.</Text>

        {status === 'rejected' ? (
          <View style={{ marginTop: 16 }}>
            <Notice tone="error" icon="alert-circle-outline" text={`Dokumen ditolak: ${user.rejectReason}`} />
          </View>
        ) : null}

        <UploadBox
          label="1. Foto KTP"
          tips={['Kartu utuh', 'Tidak buram', 'Tanpa pantulan']}
          hint="Pastikan NIK & nama terbaca, tidak silau, tidak terpotong."
          icon="card"
          uri={ktp}
          wide
          onPick={async () => setKtp((await pickPhoto('camera')) ?? ktp)}
        />
        <UploadBox
          label="2. Foto diri (selfie)"
          hint="Wajah terlihat jelas tanpa masker & kacamata hitam."
          icon="happy"
          uri={selfie}
          onPick={async () => setSelfie((await pickPhoto('camera')) ?? selfie)}
        />

        <View style={{ marginTop: 18 }}>
          <Notice icon="lock-closed-outline" text="Data KTP dienkripsi dan hanya dipakai untuk verifikasi & penyelesaian sengketa. Satu NIK hanya untuk satu akun." />
        </View>

        <Pressable onPress={() => setRejectSim(!rejectSim)} style={styles.sim}>
          <View style={[styles.check, rejectSim && { backgroundColor: C.red, borderColor: C.red }]}>{rejectSim ? <Ionicons name="checkmark" size={14} color="#fff" /> : null}</View>
          <Text style={{ marginLeft: 10, color: C.muted, fontSize: 12, flex: 1 }}>Simulasi: dokumen tidak valid (untuk demo alur penolakan)</Text>
        </Pressable>
      </ScrollView>
      <BottomBar>
        <Btn title="Kirim untuk verifikasi" style={{ flex: 1 }} disabled={!ktp || !selfie} onPress={() => submitVerification(ktp!, selfie!, rejectSim)} />
      </BottomBar>
    </Screen>
  );
}

function UploadBox({ label, hint, icon, uri, onPick, wide, tips }: { label: string; hint: string; icon: IconName; uri: string | null; onPick: () => void; wide?: boolean; tips?: string[] }) {
  return (
    <View style={{ marginTop: 20 }}>
      <Text style={{ fontWeight: '700', color: C.ink, fontSize: 15 }}>{label}</Text>
      <Text style={{ color: C.muted, fontSize: 12, marginTop: 2, marginBottom: tips ? 4 : 10 }}>{hint}</Text>
      {tips ? (
        <Row style={{ gap: 10, marginBottom: 10 }}>
          {tips.map((t) => (
            <Row key={t} style={{ gap: 3 }}>
              <Ionicons name="checkmark" size={12} color={C.success} />
              <Text style={{ color: C.success, fontSize: 12, fontWeight: '600' }}>{t}</Text>
            </Row>
          ))}
        </Row>
      ) : null}
      <Pressable onPress={onPick} style={[styles.upload, { height: wide ? 180 : 150 }, uri && { borderStyle: 'solid', borderColor: C.primary }]}>
        {uri ? (
          <>
            <Image source={{ uri }} style={imgFill} resizeMode="cover" />
            <View style={styles.retake}>
              <Ionicons name="refresh" size={14} color="#fff" />
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12, marginLeft: 4 }}>Ganti</Text>
            </View>
          </>
        ) : (
          <>
            <Ionicons name={icon} size={36} color={C.primary} />
            <Text style={{ color: C.primary, marginTop: 8, fontWeight: '600' }}>Ketuk untuk ambil / pilih foto</Text>
          </>
        )}
      </Pressable>
    </View>
  );
}

function CheckLine({ icon, text }: { icon: IconName; text: string }) {
  return (
    <Row style={{ backgroundColor: C.card, padding: 12, borderRadius: R.md }}>
      <Ionicons name={icon} size={18} color={C.muted} />
      <Text style={{ marginLeft: 10, color: C.text, flex: 1 }}>{text}</Text>
      <ActivityIndicator size="small" color={C.faint} />
    </Row>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '800', color: C.ink, letterSpacing: -0.5 },
  stepBar: { width: 28, height: 4, borderRadius: 2, backgroundColor: C.primary },
  upload: { borderRadius: R.lg, borderWidth: 2, borderStyle: 'dashed', borderColor: C.primarySoft, backgroundColor: C.infoSoft, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  retake: { position: 'absolute', right: 10, bottom: 10, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  sim: { flexDirection: 'row', alignItems: 'center', marginTop: 16, padding: 12, borderRadius: R.md, borderWidth: 1.5, borderStyle: 'dashed', borderColor: C.line },
  check: { width: 20, height: 20, borderRadius: 5, borderWidth: 2, borderColor: C.faint, alignItems: 'center', justifyContent: 'center' },
  bigIcon: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' },
  h1: { fontSize: 24, fontWeight: '800', color: C.ink, marginTop: 20, textAlign: 'center' },
  p: { color: C.muted, textAlign: 'center', marginTop: 10, lineHeight: 21 },
});
