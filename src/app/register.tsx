import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text } from 'react-native';
import { BottomBar, Btn, Field, Header, Notice, Screen } from '../components/ui';
import { useStore } from '../store';
import { C } from '../theme';

export default function Register() {
  const { login } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [pass, setPass] = useState('');
  const valid = name.trim().length > 1 && /\S+@\S+\.\S+/.test(email) && phone.replace(/\D/g, '').length >= 10 && pass.length >= 6;

  return (
    <Screen>
      <Header title="Daftar" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
          <Text style={{ fontSize: 26, fontWeight: '800', color: C.ink, letterSpacing: -0.5 }}>Buat akun</Text>
          <Text style={{ color: C.muted, marginTop: 6, marginBottom: 20, lineHeight: 20 }}>
            Satu akun untuk menyewa dan menyewakan. Setelah ini kamu akan diminta verifikasi KTP & foto diri.
          </Text>
          <Field label="Nama lengkap (sesuai KTP)" value={name} onChangeText={setName} placeholder="Nama lengkap" />
          <Field label="Email" value={email} onChangeText={setEmail} placeholder="nama@email.com" keyboardType="email-address" autoCapitalize="none" />
          <Field label="No. HP" value={phone} onChangeText={setPhone} placeholder="08xxxxxxxxxx" keyboardType="phone-pad" />
          <Field label="Kata sandi" value={pass} onChangeText={setPass} placeholder="Minimal 6 karakter" secureTextEntry />
          <Notice icon="lock-closed" text="Satu NIK hanya bisa dipakai untuk satu akun. Data KTP dienkripsi dan tidak dibagikan ke pengguna lain." />
        </ScrollView>
        <BottomBar>
          <Btn
            title="Buat akun & lanjut verifikasi"
            style={{ flex: 1 }}
            disabled={!valid}
            onPress={() => {
              login(false, { name: name.trim(), email: email.trim(), phone });
              router.replace('/verify');
            }}
          />
        </BottomBar>
      </KeyboardAvoidingView>
    </Screen>
  );
}
