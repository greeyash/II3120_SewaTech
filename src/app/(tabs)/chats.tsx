import { router } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Badge, EmptyState, Row, Screen } from '../../components/ui';
import { cover, ownerOf } from '../../data';
import { useStore } from '../../store';
import { C, R } from '../../theme';
import { fmtTime, rp } from '../../utils';

function when(at: number) {
  const d = new Date(at);
  const days = Math.floor((Date.now() - at) / 86400000);
  if (days < 1) return fmtTime(d);
  if (days < 2) return 'Kemarin';
  return ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'][d.getDay()];
}

export default function Chats() {
  const { threads, items } = useStore();
  const list = Object.values(threads)
    .filter((t) => t.messages.length)
    .sort((a, b) => b.messages[b.messages.length - 1].at - a.messages[a.messages.length - 1].at);

  return (
    <Screen>
      <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
        <Text style={styles.title}>Chat & Nego</Text>
        <Text style={{ color: C.muted, marginTop: 4 }}>Semua tawaran harga tercatat di platform.</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 8, paddingBottom: 120 }}>
        {list.length === 0 ? (
          <EmptyState icon="chatbubbles-outline" title="Belum ada percakapan" text="Buka detail barang lalu ketuk “Nego” untuk mulai diskusi dengan penyedia." />
        ) : (
          list.map((t, idx) => {
            const item = items.find((i) => i.id === t.itemId)!;
            const owner = ownerOf(item);
            const last = t.messages[t.messages.length - 1];
            const preview = t.agreedPrice
              ? `Deal ${rp(t.agreedPrice)}/hari (dari ${rp(item.pricePerDay)})`
              : last.kind === 'offer'
                ? `${last.from === 'me' ? 'Tawaranmu' : 'Kontra-penawaran'} ${rp(last.price ?? 0)}/hari`
                : last.text;
            return (
              <Pressable key={t.itemId} style={[styles.row, idx < list.length - 1 && { borderBottomWidth: 1, borderBottomColor: C.line }]} onPress={() => router.push(`/chat/${t.itemId}`)}>
                <Image source={cover(item)} style={styles.thumb} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Row style={{ justifyContent: 'space-between' }}>
                    <Text style={{ fontWeight: '700', color: C.ink, fontSize: 15 }}>{owner.name}</Text>
                    <Text style={{ fontSize: 12, color: t.unread ? C.primary : C.faint, fontWeight: t.unread ? '700' : '400' }}>{when(last.at)}</Text>
                  </Row>
                  <Text style={{ fontSize: 12, color: C.primary, fontWeight: '600', marginTop: 2 }} numberOfLines={1}>
                    {item.shortName}
                  </Text>
                  <Row style={{ justifyContent: 'space-between', marginTop: 2, gap: 8 }}>
                    <Text style={{ color: t.unread ? C.ink : C.muted, fontWeight: t.unread ? '600' : '400', flex: 1 }} numberOfLines={1}>
                      {preview}
                    </Text>
                    {t.unread ? (
                      <View style={styles.unread}>
                        <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>{t.unread}</Text>
                      </View>
                    ) : t.agreedPrice ? (
                      <Badge small tone="successSoft" label="DEAL" />
                    ) : null}
                  </Row>
                </View>
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: '800', color: C.ink, letterSpacing: -0.6 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  thumb: { width: 54, height: 54, borderRadius: R.md, backgroundColor: C.card },
  unread: { backgroundColor: C.primary, minWidth: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
});
