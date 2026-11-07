import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, font, space } from '../theme';

export function Screen({ children, scroll = true }: { children: ReactNode; scroll?: boolean }) {
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      {scroll ? (
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, { flex: 1 }]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function H1({ children }: { children: ReactNode }) {
  return <Text style={styles.h1} accessibilityRole="header">{children}</Text>;
}

export function H2({ children }: { children: ReactNode }) {
  return <Text style={styles.h2} accessibilityRole="header">{children}</Text>;
}

export function Body({ children, muted }: { children: ReactNode; muted?: boolean }) {
  return <Text style={[styles.body, muted && { color: colors.muted }]}>{children}</Text>;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}) {
  const bg = variant === 'primary' ? colors.primary : variant === 'danger' ? colors.danger : colors.card;
  const fg = variant === 'secondary' ? colors.primary : colors.primaryText;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, opacity: disabled ? 0.5 : pressed ? 0.8 : 1 },
        variant === 'secondary' && { borderWidth: 2, borderColor: colors.primary },
      ]}
    >
      <Text style={[styles.buttonText, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

export function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <Pressable style={styles.row} onPress={() => onChange(!value)} accessibilityRole="switch" accessibilityState={{ checked: value }}>
      <Text style={[styles.body, { flex: 1 }]}>{label}</Text>
      <Switch value={value} onValueChange={onChange} />
    </Pressable>
  );
}

export function Counter({ label, value, onChange, min = 0 }: { label: string; value: number; onChange: (v: number) => void; min?: number }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.body, { flex: 1 }]}>{label}</Text>
      <Pressable style={styles.counterBtn} onPress={() => onChange(Math.max(min, value - 1))} accessibilityLabel={`${label} minus`}>
        <Text style={styles.counterBtnText}>−</Text>
      </Pressable>
      <Text style={styles.counterValue}>{value}</Text>
      <Pressable style={styles.counterBtn} onPress={() => onChange(value + 1)} accessibilityLabel={`${label} plus`}>
        <Text style={styles.counterBtnText}>+</Text>
      </Pressable>
    </View>
  );
}

export function Choice<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.choiceWrap}>
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            style={[styles.chip, selected && styles.chipSelected]}
          >
            <Text style={[styles.chipText, selected && { color: colors.primaryText }]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Banner({ tone, children }: { tone: 'danger' | 'warn' | 'ok'; children: ReactNode }) {
  const map = {
    danger: [colors.dangerBg, colors.danger],
    warn: [colors.warnBg, colors.warn],
    ok: [colors.okBg, colors.ok],
  } as const;
  const [bg, fg] = map[tone];
  return (
    <View style={[styles.banner, { backgroundColor: bg, borderColor: fg }]}>
      {typeof children === 'string' ? <Text style={[styles.body, { color: fg }]}>{children}</Text> : children}
    </View>
  );
}

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg, gap: space.md, paddingBottom: space.xl * 2 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: space.lg,
    gap: space.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  h1: { fontSize: font.xl, fontWeight: '700', color: colors.text },
  h2: { fontSize: font.lg, fontWeight: '700', color: colors.text },
  body: { fontSize: font.md, color: colors.text, lineHeight: 22 },
  button: { paddingVertical: 14, paddingHorizontal: space.lg, borderRadius: 10, alignItems: 'center', minHeight: 48 },
  buttonText: { fontSize: font.md, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: space.sm, gap: space.sm, minHeight: 48 },
  counterBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBtnText: { fontSize: font.lg, color: colors.primary, fontWeight: '700' },
  counterValue: { fontSize: font.lg, minWidth: 28, textAlign: 'center', fontWeight: '700' },
  choiceWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
    minHeight: 44,
    justifyContent: 'center',
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: font.md, color: colors.text },
  banner: { borderRadius: 10, padding: space.md, borderWidth: 1 },
});
