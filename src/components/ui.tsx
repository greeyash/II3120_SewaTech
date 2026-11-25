import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cover, Item } from '../data';
import { useStore } from '../store';
import { C, R, cardWhite, imgFill, selected, shadow } from '../theme';
import { rp } from '../utils';

export type IconName = React.ComponentProps<typeof Ionicons>['name'];

export function Logo({ size = 22 }: { size?: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text style={{ fontSize: size, fontWeight: '800', color: C.ink, letterSpacing: -0.5 }}>Sewa</Text>
      <View style={{ backgroundColor: C.orange, paddingHorizontal: 6, marginLeft: 3 }}>
        <Text style={{ fontSize: size, fontWeight: '800', color: C.ink, letterSpacing: -0.5 }}>Tech</Text>
      </View>
    </View>
  );
}

export function Screen({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const insets = useSafeAreaInsets();
  return <View style={[{ flex: 1, backgroundColor: C.bg, paddingTop: insets.top }, style]}>{children}</View>;
}

export function Header({ title, right, onBack, children }: { title?: string; right?: React.ReactNode; onBack?: () => void; children?: React.ReactNode }) {
  return (
    <View style={s.header}>
      <IconBtn name="arrow-back" onPress={onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/')))} />
      {children ?? (
        <Text style={s.headerTitle} numberOfLines={1}>
          {title}
        </Text>
      )}
      <View style={{ minWidth: 40, alignItems: 'flex-end' }}>{right}</View>
    </View>
  );
}

export function IconBtn({ name, onPress, color = C.ink, bg, badge }: { name: IconName; onPress?: () => void; color?: string; bg?: string; badge?: boolean }) {
  return (
    <Pressable onPress={onPress} hitSlop={8} style={[s.iconBtn, bg ? { backgroundColor: bg } : null]}>
      <Ionicons name={name} size={22} color={color} />
      {badge ? <View style={s.dot} /> : null}
    </Pressable>
  );
}

/**
 * Tombol. primary = satu aksi utama (Bleu océan), outline = aksi sekunder,
 * danger = aksi berisiko (outline merah), ghost = teks saja.
 */
export function Btn({
  title,
  onPress,
  variant = 'primary',
  icon,
  disabled,
  loading,
  style,
  small,
}: {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'dark' | 'outline' | 'ghost' | 'danger';
  icon?: IconName;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  small?: boolean;
}) {
  const v = variant === 'dark' ? 'primary' : variant;
  const bg = disabled ? C.disabled : { primary: C.primary, outline: C.white, ghost: 'transparent', danger: C.white }[v];
  const fg = disabled ? C.faint : { primary: C.white, outline: C.ink, ghost: C.primary, danger: C.error }[v];
  const border = v === 'outline' ? C.line : v === 'danger' ? C.error : null;
  return (
    <Pressable
      onPress={disabled || loading ? undefined : onPress}
      style={({ pressed }) => [
        s.btn,
        small && { height: 38, paddingHorizontal: 14, borderRadius: 10 },
        { backgroundColor: bg, opacity: pressed ? 0.85 : 1 },
        border && !disabled ? { borderWidth: 1.5, borderColor: border } : null,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={small ? 16 : 18} color={fg} style={{ marginRight: 8 }} /> : null}
          <Text style={[s.btnText, { color: fg }, small && { fontSize: 13 }]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

export function Chip({ label, active, onPress, icon }: { label: string; active?: boolean; onPress?: () => void; icon?: IconName }) {
  return (
    <Pressable onPress={onPress} style={[s.chip, active && selected]}>
      {icon ? <Ionicons name={icon} size={14} color={active ? C.primary : C.text} style={{ marginRight: 6 }} /> : null}
      <Text style={[s.chipText, active && { color: C.primary }]}>{label}</Text>
    </Pressable>
  );
}

export type Tone = 'success' | 'successSoft' | 'warning' | 'error' | 'info' | 'orange' | 'dark';
const TONES: Record<Tone, [string, string]> = {
  success: [C.success, C.white],
  successSoft: [C.successSoft, C.success],
  warning: [C.warningSoft, C.warningInk],
  error: [C.errorSoft, C.error],
  info: [C.infoSoft, C.infoInk],
  orange: [C.orange, C.ink],
  dark: [C.ink, C.white],
};

export function Badge({ label, tone = 'success', icon, small }: { label: string; tone?: Tone; icon?: IconName; small?: boolean }) {
  const [bg, color] = TONES[tone];
  return (
    <View style={[s.badge, { backgroundColor: bg }, small && { paddingHorizontal: 6, paddingVertical: 3, borderRadius: 5 }]}>
      {icon ? <Ionicons name={icon} size={11} color={color} style={{ marginRight: 4 }} /> : null}
      <Text style={[s.badgeText, { color }, small && { fontSize: 9 }]}>{label}</Text>
    </View>
  );
}

export function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={s.sectionRow}>
      <Text style={s.sectionTitle}>{title}</Text>
      {action ? (
        <Pressable onPress={onAction}>
          <Text style={s.sectionAction}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/** Kartu ringkasan berwarna Butter yellow. */
export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[s.card, style]}>{children}</View>;
}

/** Kartu putih dengan border + bayangan lembut. */
export function WhiteCard({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[cardWhite, { padding: 16 }, style]}>{children}</View>;
}

export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={s.label}>{label}</Text>
      <TextInput placeholderTextColor={C.faint} {...props} style={[s.input, props.multiline && { height: 96, paddingTop: 12, textAlignVertical: 'top' }, props.style]} />
    </View>
  );
}

export function Row({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center' }, style]}>{children}</View>;
}

export function KV({ k, v, bold, color }: { k: string; v: string; bold?: boolean; color?: string }) {
  return (
    <Row style={{ justifyContent: 'space-between', paddingVertical: 5 }}>
      <Text style={{ color: bold ? C.ink : C.muted, fontWeight: bold ? '700' : '400', fontSize: bold ? 15 : 14 }}>{k}</Text>
      <Text style={{ color: color ?? C.ink, fontWeight: bold ? '800' : '600', fontSize: bold ? 16 : 14 }}>{v}</Text>
    </Row>
  );
}

export function Divider() {
  return <View style={{ height: 1, backgroundColor: C.line, marginVertical: 6 }} />;
}

export function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <Row>
      <Ionicons name="star" size={size} color={C.orange} />
      <Text style={{ marginLeft: 4, fontWeight: '600', color: C.text, fontSize: size - 1 }}>{value.toFixed(1)}</Text>
    </Row>
  );
}

export function ItemCard({ item, width, big }: { item: Item; width?: number; big?: boolean }) {
  const { favorites, toggleFav } = useStore();
  const fav = favorites.includes(item.id);
  const free = !item.bookedOffsets.includes(0);
  return (
    <Pressable onPress={() => router.push(`/item/${item.id}`)} style={[{ width }, big && { marginRight: 14 }]}>
      <View style={[s.itemImgWrap, big && { height: 200 }]}>
        <Image source={cover(item)} style={imgFill} resizeMode="cover" />
        <View style={{ position: 'absolute', top: 8, left: 8, flexDirection: 'row', gap: 4 }}>
          {big ? <Badge small tone="orange" label={`${item.distanceKm.toString().replace('.', ',')} KM`} /> : null}
          {free ? <Badge small tone="success" label="TERSEDIA" /> : <Badge small tone="dark" label="DISEWA HARI INI" />}
        </View>
        <Pressable onPress={() => toggleFav(item.id)} style={s.fav} hitSlop={6}>
          <Ionicons name={fav ? 'heart' : 'heart-outline'} size={16} color={fav ? C.error : C.ink} />
        </Pressable>
      </View>
      <Text style={s.itemName} numberOfLines={1}>
        {item.name}
      </Text>
      <Row style={{ justifyContent: 'space-between', marginTop: 2 }}>
        <Text style={s.itemPrice}>
          {rp(item.pricePerDay)}
          <Text style={{ color: C.muted, fontWeight: '400', fontSize: 11 }}>/hari</Text>
        </Text>
        {item.rating ? <Stars value={item.rating} size={12} /> : null}
      </Row>
    </Pressable>
  );
}

export function Grid({ items }: { items: Item[] }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 18 }}>
      {items.map((i) => (
        <View key={i.id} style={{ width: '48%' }}>
          <ItemCard item={i} />
        </View>
      ))}
    </View>
  );
}

export function EmptyState({ icon, title, text, action, onAction }: { icon: IconName; title: string; text: string; action?: string; onAction?: () => void }) {
  return (
    <View style={{ alignItems: 'center', padding: 32, marginTop: 40 }}>
      <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: C.selectedBg, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={icon} size={32} color={C.primary} />
      </View>
      <Text style={{ fontSize: 17, fontWeight: '700', marginTop: 16, color: C.ink }}>{title}</Text>
      <Text style={{ color: C.muted, textAlign: 'center', marginTop: 6, lineHeight: 20 }}>{text}</Text>
      {action ? <Btn title={action} onPress={onAction} style={{ marginTop: 18, paddingHorizontal: 24 }} small /> : null}
    </View>
  );
}

export function BottomBar({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  return <View style={[s.bottomBar, { paddingBottom: Math.max(insets.bottom, 14) }]}>{children}</View>;
}

type NoticeTone = 'info' | 'warning' | 'success' | 'error' | 'blue' | 'yellow' | 'green' | 'red';
export function Notice({ icon = 'information-circle-outline', text, tone = 'info' }: { icon?: IconName; text: string; tone?: NoticeTone }) {
  const key = ({ blue: 'info', yellow: 'warning', green: 'success', red: 'error' } as Record<string, string>)[tone] ?? tone;
  const t = {
    info: [C.infoSoft, C.infoInk, C.info],
    warning: [C.warningSoft, C.warningInk, C.warning],
    success: [C.successSoft, C.success, C.success],
    error: [C.errorSoft, C.error, C.error],
  }[key as 'info']!;
  return (
    <Row style={{ backgroundColor: t[0], padding: 12, borderRadius: R.md, alignItems: 'flex-start' }}>
      <Ionicons name={icon} size={18} color={t[2]} />
      <Text style={{ color: t[1], marginLeft: 8, flex: 1, lineHeight: 19, fontSize: 13 }}>{text}</Text>
    </Row>
  );
}

export const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, height: 56, backgroundColor: C.bg },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: C.ink },
  iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  dot: { position: 'absolute', top: 8, right: 9, width: 9, height: 9, borderRadius: 5, backgroundColor: C.error, borderWidth: 1.5, borderColor: '#fff' },
  btn: { height: 52, borderRadius: R.md, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', paddingHorizontal: 18 },
  btnText: { fontSize: 15, fontWeight: '700', letterSpacing: 0.2 },
  chip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 38, borderRadius: R.pill, borderWidth: 1, borderColor: C.line, marginRight: 8, backgroundColor: C.white },
  chipText: { fontSize: 13, fontWeight: '600', color: C.text },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start' },
  badgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.4 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 12 },
  sectionTitle: { fontSize: 19, fontWeight: '800', color: C.ink, letterSpacing: -0.3 },
  sectionAction: { color: C.primary, fontWeight: '700', fontSize: 12, textDecorationLine: 'underline' },
  card: { backgroundColor: C.card, borderRadius: R.lg, padding: 16 },
  label: { fontSize: 13, fontWeight: '600', color: C.text, marginBottom: 6 },
  input: { height: 50, borderRadius: R.md, backgroundColor: C.white, borderWidth: 1.5, borderColor: C.line, paddingHorizontal: 14, fontSize: 15, color: C.ink },
  itemImgWrap: { height: 150, borderRadius: R.lg, backgroundColor: C.card, overflow: 'hidden' },
  fav: { position: 'absolute', top: 8, right: 8, width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.95)', alignItems: 'center', justifyContent: 'center' },
  itemName: { fontSize: 12, fontWeight: '600', color: C.ink, marginTop: 8 },
  itemPrice: { fontSize: 13, fontWeight: '700', color: C.ink },
  bottomBar: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 14, backgroundColor: C.white, borderTopWidth: 1, borderTopColor: C.line, ...shadow },
});
