import { router } from 'expo-router';
import { ScrollView, Text } from 'react-native';
import { EmptyState, Grid, Header, Screen } from '../components/ui';
import { useStore } from '../store';
import { C } from '../theme';

/** Daftar barang yang ditandai hati (dibuka dari Akun). */
export default function Favorites() {
  const { items, favorites } = useStore();
  const list = favorites.map((id) => items.find((i) => i.id === id)).filter((i) => !!i);

  return (
    <Screen>
      <Header title="Favorit" />
      {list.length ? (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
          <Text style={{ color: C.muted, marginTop: 4, marginBottom: 14 }}>
            {list.length} barang disimpan
          </Text>
          <Grid items={list} />
        </ScrollView>
      ) : (
        <EmptyState
          icon="heart-outline"
          title="Belum ada favorit"
          text="Ketuk ikon hati di barang yang kamu suka supaya gampang dicari lagi nanti."
          action="Cari barang"
          onAction={() => router.push('/search')}
        />
      )}
    </Screen>
  );
}
