import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { BottomBar, Btn, Chip, Field, Header, Screen } from '../../components/ui';
import { cover, ownerOf } from '../../data';
import { useStore } from '../../store';
import { C, R } from '../../theme';

const TAGS = ['Barang sesuai deskripsi', 'Penyedia ramah', 'Responsif', 'Serah terima tepat waktu', 'Kondisi bersih'];
const LABEL = ['', 'Buruk', 'Kurang', 'Cukup', 'Bagus', 'Luar biasa!'];

export default function Review() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { orders, items, submitReview } = useStore();
  const o = orders.find((x) => x.id === id);
  const [stars, setStars] = useState(5);
  const [tags, setTags] = useState<string[]>([]);
  const [text, setText] = useState('');
  if (!o) return null;
  const item = items.find((i) => i.id === o.itemId)!;

  return (
    <Screen>
      <Header title="Beri penilaian" />
      <ScrollView contentContainerStyle={{ padding: 20, alignItems: 'stretch' }}>
        <View style={{ alignItems: 'center' }}>
          <Image source={cover(item)} style={{ width: 88, height: 88, borderRadius: R.lg }} />
          <Text style={{ fontWeight: '800', fontSize: 18, color: C.ink, marginTop: 12, textAlign: 'center' }}>{item.shortName}</Text>
          <Text style={{ color: C.muted, marginTop: 2 }}>Disewa dari {ownerOf(item).name}</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 20 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Pressable key={n} onPress={() => setStars(n)} hitSlop={4}>
                <Ionicons name={n <= stars ? 'star' : 'star-outline'} size={40} color={n <= stars ? C.orange : C.line} />
              </Pressable>
            ))}
          </View>
          <Text style={{ fontWeight: '700', color: C.ink, marginTop: 8 }}>{LABEL[stars]}</Text>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: 8, marginTop: 24, justifyContent: 'center' }}>
          {TAGS.map((t) => (
            <Chip key={t} label={t} active={tags.includes(t)} onPress={() => setTags(tags.includes(t) ? tags.filter((x) => x !== t) : [...tags, t])} />
          ))}
        </View>
        <View style={{ marginTop: 20 }}>
          <Field label="Ulasan (opsional)" value={text} onChangeText={setText} placeholder="Ceritakan pengalaman sewamu…" multiline />
        </View>
        <Text style={{ color: C.muted, fontSize: 12, textAlign: 'center' }}>Penilaian bersifat dua arah: penyedia juga menilai kamu sebagai penyewa.</Text>
      </ScrollView>
      <BottomBar>
        <Btn
          title="Kirim penilaian"
          style={{ flex: 1 }}
          onPress={() => {
            submitReview(o.id, stars, [tags.join(' · '), text].filter(Boolean).join('\n'));
            router.back();
          }}
        />
      </BottomBar>
    </Screen>
  );
}
