import { Ionicons } from '@expo/vector-icons';
import { Redirect } from 'expo-router';
import { Tabs, type BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { IconName } from '../../components/ui';
import { useStore } from '../../store';
import { C, shadow } from '../../theme';

const TABS: Record<string, { label: string; icon: IconName; iconOn: IconName }> = {
  index: { label: 'Beranda', icon: 'home-outline', iconOn: 'home' },
  search: { label: 'Cari', icon: 'search-outline', iconOn: 'search' },
  orders: { label: 'Pesanan', icon: 'receipt-outline', iconOn: 'receipt' },
  chats: { label: 'Chat', icon: 'chatbubble-outline', iconOn: 'chatbubble' },
  profile: { label: 'Akun', icon: 'person-outline', iconOn: 'person' },
};

function FloatingTabBar({ state, navigateToTab }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { threads, orders } = useStore();
  const unread = Object.values(threads).some((t) => t.unread);
  const actionNeeded = orders.some((o) => ['menunggu_bayar', 'dikirim', 'disewa', 'klaim'].includes(o.status));
  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 12) }]} pointerEvents="box-none">
      <View style={styles.bar}>
        {state.routes.map((route, i) => {
          const t = TABS[route.name];
          if (!t) return null;
          const focused = state.index === i;
          const dot = (route.name === 'chats' && unread) || (route.name === 'orders' && actionNeeded);
          return (
            <Pressable
              key={route.key}
              onPress={() => {
                if (!focused) navigateToTab(route.key);
              }}
              style={[styles.tab, focused && styles.tabOn]}>
              <Ionicons name={focused ? t.iconOn : t.icon} size={20} color={focused ? C.white : C.muted} accessibilityLabel={t.label} />
              {dot && !focused ? <View style={styles.dot} /> : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  const { loggedIn } = useStore();
  if (!loggedIn) return <Redirect href="/welcome" />;
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(p) => <FloatingTabBar {...p} />}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="search" />
      <Tabs.Screen name="orders" />
      <Tabs.Screen name="chats" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center', paddingHorizontal: 16 },
  bar: { flexDirection: 'row', backgroundColor: C.white, borderWidth: 1, borderColor: C.line, borderRadius: 999, padding: 6, gap: 2, width: '100%', maxWidth: 420, justifyContent: 'space-between', ...shadow, shadowOpacity: 0.14, shadowRadius: 24, shadowOffset: { width: 0, height: 8 } },
  tab: { height: 46, width: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  tabOn: { backgroundColor: C.primary },
  dot: { position: 'absolute', top: 9, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: C.error, borderWidth: 1.5, borderColor: C.white },
});
