import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Image, KeyboardAvoidingView, type ScrollViewInstance, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Btn, Header, Row, Screen } from '../../components/ui';
import { cover, ownerOf } from '../../data';
import { Message, useStore } from '../../store';
import { C, R } from '../../theme';
import { fmtTime, roundTo, rp } from '../../utils';

export default function Chat() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { items, threads, sendText, sendOffer, respondCounter, markRead } = useStore();
  const insets = useSafeAreaInsets();
  const item = items.find((i) => i.id === id)!;
  const thread = threads[id] ?? { itemId: id, messages: [] };
  const [text, setText] = useState('');
  const [offerMode, setOfferMode] = useState(false);
  const [offer, setOffer] = useState('');
  const scroll = useRef<ScrollViewInstance>(null);

  useEffect(() => {
    markRead(id);
    setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 50);
  }, [thread.messages.length]);

  if (!item) return null;
  const owner = ownerOf(item);
  const pendingMine = thread.messages.some((m) => m.from === 'me' && m.kind === 'offer' && m.offerStatus === 'pending');
  const offerNum = parseInt(offer.replace(/\D/g, ''), 10) || 0;

  const submitOffer = () => {
    if (!offerNum) return;
    sendOffer(item.id, offerNum);
    setOffer('');
    setOfferMode(false);
  };

  return (
    <Screen>
      <Header>
        <Row style={{ flex: 1, gap: 10 }}>
          <View style={styles.avatar}>
            <Ionicons name="storefront" size={18} color="#fff" />
            <View style={[styles.onlineDot, { backgroundColor: owner.online ? C.success : C.faint }]} />
          </View>
          <View>
            <Text style={{ fontWeight: '700', fontSize: 15, color: C.ink }}>{owner.name}</Text>
            <Text style={{ fontSize: 11, color: owner.online ? C.success : C.muted }}>{owner.online ? `Online · balas ${owner.responseTime}` : 'Aktif 1 jam lalu'}</Text>
          </View>
        </Row>
      </Header>
      <Pressable style={styles.itemBar} onPress={() => router.push(`/item/${item.id}`)}>
        <Image source={cover(item)} style={styles.itemThumb} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={{ fontWeight: '700', color: C.ink }} numberOfLines={1}>
            {item.shortName}
          </Text>
          <Text style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>
            Harga awal {rp(item.pricePerDay)}/hari
            {thread.agreedPrice ? <Text style={{ color: C.success, fontWeight: '700' }}>  ·  Deal {rp(thread.agreedPrice)}</Text> : null}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={C.faint} />
      </Pressable>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView ref={scroll} contentContainerStyle={{ padding: 16, gap: 10 }}>
          <Text style={styles.sysNote}>Diskusi & tawaran di sini tercatat sebagai bukti kesepakatan. Jangan bertransaksi di luar SewaTech.</Text>
          {thread.messages.map((m) => (
            <Bubble key={m.id} m={m} onRespond={(acc) => respondCounter(item.id, m.id, acc)} />
          ))}
          {thread.agreedPrice ? (
            <View style={styles.dealCard}>
              <Ionicons name="checkmark-circle" size={28} color={C.success} />
              <Text style={{ fontWeight: '800', fontSize: 16, color: C.ink, marginTop: 6 }}>Harga disepakati {rp(thread.agreedPrice)}/hari</Text>
              <Text style={{ color: C.muted, fontSize: 12, marginTop: 4, textAlign: 'center' }}>Lanjutkan ke pemesanan untuk cek jadwal dan menyetujui SOP sewa.</Text>
              <Btn
                title="Lanjut pesan"
                icon="arrow-forward"
                style={{ marginTop: 12, alignSelf: 'stretch' }}
                onPress={() => router.push({ pathname: '/book/[id]', params: { id: item.id } })}
              />
            </View>
          ) : null}
        </ScrollView>

        {offerMode ? (
          <View style={[styles.offerPanel, { paddingBottom: Math.max(insets.bottom, 12) }]}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Text style={{ fontWeight: '700', color: C.ink, fontSize: 16 }}>Ajukan tawaran</Text>
              <Pressable onPress={() => setOfferMode(false)}>
                <Ionicons name="close" size={22} color={C.muted} />
              </Pressable>
            </Row>
            <Row style={styles.offerInput}>
              <Text style={{ fontWeight: '800', fontSize: 22, color: C.muted }}>Rp</Text>
              <TextInput
                value={offerNum ? rp(offerNum).slice(2) : ''}
                onChangeText={setOffer}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor={C.faint}
                style={{ flex: 1, fontSize: 26, fontWeight: '800', marginLeft: 8, color: C.ink }}
                autoFocus
              />
              <Text style={{ color: C.muted }}>/hari</Text>
            </Row>
            <Row style={{ gap: 8, marginTop: 10 }}>
              {[0.75, 0.85, 0.9].map((r) => {
                const v = roundTo(item.pricePerDay * r, 10000);
                return (
                  <Pressable key={r} style={styles.quick} onPress={() => setOffer(String(v))}>
                    <Text style={{ fontWeight: '700', color: C.ink }}>{rp(v)}</Text>
                    <Text style={{ fontSize: 11, color: C.muted }}>-{Math.round((1 - r) * 100)}%</Text>
                  </Pressable>
                );
              })}
            </Row>
            <Btn title="Kirim tawaran" onPress={submitOffer} disabled={!offerNum} style={{ marginTop: 14 }} />
          </View>
        ) : (
          <Row style={[styles.composer, { paddingBottom: Math.max(insets.bottom, 10) }]}>
            <Pressable
              style={[styles.offerBtn, (pendingMine || !!thread.agreedPrice) && { opacity: 0.4 }]}
              onPress={() => !pendingMine && !thread.agreedPrice && setOfferMode(true)}>
              <Ionicons name="pricetag" size={16} color="#fff" />
              <Text style={{ color: '#fff', fontWeight: '700', marginLeft: 6, fontSize: 13 }}>Tawar</Text>
            </Pressable>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Tulis pesan…"
              placeholderTextColor={C.faint}
              style={styles.textInput}
              onSubmitEditing={() => {
                if (text.trim()) {
                  sendText(item.id, text.trim());
                  setText('');
                }
              }}
            />
            <Pressable
              style={styles.send}
              onPress={() => {
                if (text.trim()) {
                  sendText(item.id, text.trim());
                  setText('');
                }
              }}>
              <Ionicons name="send" size={18} color="#fff" />
            </Pressable>
          </Row>
        )}
      </KeyboardAvoidingView>
    </Screen>
  );
}

function Bubble({ m, onRespond }: { m: Message; onRespond: (accept: boolean) => void }) {
  if (m.from === 'system')
    return (
      <View style={styles.sys}>
        <Ionicons name="checkmark-done" size={14} color={C.success} />
        <Text style={{ color: C.success, fontSize: 12, fontWeight: '600', marginLeft: 6, flexShrink: 1 }}>{m.text}</Text>
      </View>
    );
  const mine = m.from === 'me';
  if (m.kind === 'offer') {
    const st = {
      pending: { t: mine ? 'Menunggu respon penyedia…' : 'Kontra-penawaran dari penyedia', c: C.warningInk },
      accepted: { t: 'Diterima', c: C.success },
      rejected: { t: 'Ditolak', c: C.error },
      countered: { t: '', c: C.muted },
    }[m.offerStatus ?? 'pending'];
    return (
      <View style={[styles.offerCard, mine ? styles.offerMine : styles.offerTheirs]}>
        <Row style={{ gap: 6 }}>
          <Ionicons name="pricetag-outline" size={12} color={C.muted} />
          <Text style={{ color: C.muted, fontSize: 10, letterSpacing: 0.4 }}>{mine ? 'TAWARANMU' : 'KONTRA-PENAWARAN'}</Text>
        </Row>
        <Text style={{ fontSize: 18, fontWeight: '800', color: C.ink, marginTop: 2 }}>
          {rp(m.price ?? 0)}
          <Text style={{ fontSize: 12, color: C.muted, fontWeight: '400' }}>/hari</Text>
        </Text>
        {st.t ? <Text style={{ color: st.c, fontSize: 11, fontWeight: '700', marginTop: 2 }}>{st.t}</Text> : null}
        {!mine && m.offerStatus === 'pending' ? (
          <Row style={{ gap: 8, marginTop: 8 }}>
            <Btn title="Tolak" variant="outline" small style={{ flex: 1 }} onPress={() => onRespond(false)} />
            <Btn title="Terima" small style={{ flex: 1 }} onPress={() => onRespond(true)} />
          </Row>
        ) : null}
      </View>
    );
  }
  return (
    <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
      <Text style={{ color: mine ? '#fff' : C.ink, lineHeight: 20 }}>{m.text}</Text>
      <Text style={{ color: mine ? 'rgba(255,255,255,0.7)' : C.faint, fontSize: 10, marginTop: 4, alignSelf: 'flex-end' }}>{fmtTime(new Date(m.at))}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  onlineDot: { position: 'absolute', right: -1, bottom: -1, width: 11, height: 11, borderRadius: 6, borderWidth: 2, borderColor: '#fff' },
  itemBar: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, padding: 10, borderRadius: R.md, backgroundColor: C.card },
  itemThumb: { width: 44, height: 44, borderRadius: R.sm },
  sysNote: { textAlign: 'center', color: C.faint, fontSize: 11, marginHorizontal: 20, marginBottom: 4 },
  bubble: { maxWidth: '78%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18 },
  mine: { alignSelf: 'flex-end', backgroundColor: C.primary, borderBottomRightRadius: 4 },
  theirs: { alignSelf: 'flex-start', backgroundColor: C.card, borderBottomLeftRadius: 4 },
  sys: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center', backgroundColor: C.successSoft, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, maxWidth: '92%' },
  offerCard: { width: 220, borderWidth: 1.5, borderRadius: 16, padding: 12 },
  offerMine: { alignSelf: 'flex-end', backgroundColor: 'rgba(147,178,248,0.18)', borderColor: C.primarySoft },
  offerTheirs: { alignSelf: 'flex-start', backgroundColor: 'rgba(251,237,176,0.35)', borderColor: 'rgba(241,185,76,0.7)' },
  dealCard: { alignItems: 'center', padding: 18, borderRadius: R.lg, backgroundColor: C.card, marginTop: 6 },
  composer: { paddingHorizontal: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: C.line, gap: 8, backgroundColor: '#fff' },
  offerBtn: { flexDirection: 'row', alignItems: 'center', height: 44, paddingHorizontal: 14, borderRadius: 22, backgroundColor: C.primary },
  textInput: { flex: 1, height: 44, borderRadius: 22, backgroundColor: '#fff', borderWidth: 1.5, borderColor: C.line, paddingHorizontal: 16, fontSize: 15, color: C.ink },
  send: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  offerPanel: { padding: 16, borderTopWidth: 1, borderTopColor: C.line, backgroundColor: '#fff' },
  offerInput: { marginTop: 12, backgroundColor: '#fff', borderWidth: 1.5, borderColor: C.line, borderRadius: R.md, paddingHorizontal: 16, height: 64 },
  quick: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: R.sm, borderWidth: 1, borderColor: C.line },
});
