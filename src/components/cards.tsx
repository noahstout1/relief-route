import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState, type ComponentProps } from 'react';
import { Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Decision } from '../engine/planEngine';
import type { RankedShelter } from '../engine/shelterFinder';
import type { StringKey } from '../i18n';
import { colors, font, space } from '../theme';
import type { Agency, EmergencyNumbers, GuidanceAction, HazardType, LatLon, ReliefProgram } from '../types';
import { Body, Card, H2 } from './ui';

type T = (key: StringKey, vars?: Record<string, string | number>) => string;
type IconName = ComponentProps<typeof Ionicons>['name'];

export const HAZARD_ICON: Record<HazardType, IconName> = {
  cyclone: 'thunderstorm',
  flood: 'water',
  earthquake: 'pulse',
  landslide: 'trending-down',
  tsunami: 'boat',
};

export function callNumber(phone: string) {
  Linking.openURL(`tel:${phone.replace(/[^\d+]/g, '')}`).catch(() => {});
}

export function openDirections(to: LatLon & { name?: string }) {
  const { lat, lon } = to;
  const label = encodeURIComponent(to.name ?? 'Shelter');
  const url =
    Platform.OS === 'android'
      ? `geo:${lat},${lon}?q=${lat},${lon}(${label})`
      : Platform.OS === 'ios'
        ? `maps:?daddr=${lat},${lon}&q=${label}`
        : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
  Linking.openURL(url).catch(() => Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`));
}

export function ActionButton({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s.actionBtn, pressed && { opacity: 0.7 }]} accessibilityRole="button" accessibilityLabel={label}>
      <Ionicons name={icon} size={18} color={colors.primary} />
      <Text style={s.actionText}>{label}</Text>
    </Pressable>
  );
}

const DECISION_STYLE = {
  evacuate: { bg: colors.danger, icon: 'walk' as IconName },
  get_ready: { bg: colors.warn, icon: 'alert-circle' as IconName },
  stay: { bg: colors.ok, icon: 'home' as IconName },
};

export function DecisionCard({ decision, t }: { decision: Decision; t: T }) {
  const st = DECISION_STYLE[decision.level];
  return (
    <View style={[s.decision, { backgroundColor: st.bg }]} accessibilityRole="summary">
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
        <Ionicons name={st.icon} size={36} color="#fff" />
        <Text style={s.decisionTitle}>{t(`dec_${decision.level}` as StringKey)}</Text>
      </View>
      <Text style={s.decisionWhy}>{t('whyThis')}:</Text>
      {decision.reasons.map((r) => (
        <Text key={r} style={s.decisionReason}>
          • {r}
        </Text>
      ))}
    </View>
  );
}

export function ShelterCard({ item, t, rank }: { item: RankedShelter; t: T; rank?: number }) {
  const { shelter, distanceKm, missing } = item;
  return (
    <Card>
      <View style={{ flexDirection: 'row', gap: space.sm, alignItems: 'flex-start' }}>
        {rank !== undefined && <Text style={s.rank}>{rank + 1}</Text>}
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={s.title}>{shelter.name}</Text>
          <Body muted>
            {t('kmAway', { km: distanceKm < 10 ? distanceKm.toFixed(1) : Math.round(distanceKm) })}
            {shelter.capacity ? ` · ${shelter.capacity} ppl` : ''}
          </Body>
          <View style={s.tags}>
            {shelter.features.map((f) => (
              <Text key={f} style={s.tag}>
                {f.replace('_', ' ')}
              </Text>
            ))}
          </View>
          {missing.length > 0 && <Text style={s.missing}>{t('missing', { list: missing.join(', ') })}</Text>}
        </View>
      </View>
      <View style={s.actionsRow}>
        <ActionButton icon="navigate" label={t('directions')} onPress={() => openDirections(shelter)} />
        {shelter.phone && <ActionButton icon="call" label={t('call')} onPress={() => callNumber(shelter.phone!)} />}
      </View>
    </Card>
  );
}

export function AgencyCard({ agency, t }: { agency: Agency; t: T }) {
  return (
    <Card>
      <Text style={s.title}>
        {agency.name}
        {agency.shortName ? ` (${agency.shortName})` : ''}
      </Text>
      <Body muted>{agency.description}</Body>
      <View style={s.actionsRow}>
        {agency.phone && <ActionButton icon="call" label={`${t('call')} ${agency.phone}`} onPress={() => callNumber(agency.phone!)} />}
        {agency.website && <ActionButton icon="globe" label={t('website')} onPress={() => Linking.openURL(agency.website!)} />}
      </View>
    </Card>
  );
}

export function ProgramCard({ program, t }: { program: ReliefProgram; t: T }) {
  return (
    <Card>
      <Text style={s.title}>{program.name}</Text>
      <Body muted>{program.provider}</Body>
      <Body>{program.description}</Body>
      <Text style={s.label}>{t('howToApply')}</Text>
      <Body>{program.howToApply}</Body>
      <View style={s.actionsRow}>
        {program.phone && <ActionButton icon="call" label={t('call')} onPress={() => callNumber(program.phone!)} />}
        {program.website && <ActionButton icon="globe" label={t('website')} onPress={() => Linking.openURL(program.website!)} />}
      </View>
    </Card>
  );
}

/** Checklist whose ticked state persists on the device, keyed by `storageKey`. */
export function Checklist({ storageKey, items }: { storageKey: string; items: { id: string; title: string; detail?: string }[] }) {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const key = `reliefroute.check.${storageKey}`;

  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(key)
      .then((raw) => alive && setDone(raw ? JSON.parse(raw) : {}))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [key]);

  const toggle = (id: string) => {
    const next = { ...done, [id]: !done[id] };
    setDone(next);
    AsyncStorage.setItem(key, JSON.stringify(next)).catch(() => {});
  };

  return (
    <View style={{ gap: space.sm }}>
      {items.map((it) => (
        <Pressable
          key={it.id}
          onPress={() => toggle(it.id)}
          style={s.checkRow}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: !!done[it.id] }}
        >
          <Ionicons name={done[it.id] ? 'checkbox' : 'square-outline'} size={26} color={done[it.id] ? colors.ok : colors.muted} />
          <View style={{ flex: 1 }}>
            <Text style={[s.checkTitle, done[it.id] && s.checkDone]}>{it.title}</Text>
            {it.detail && <Body muted>{it.detail}</Body>}
          </View>
        </Pressable>
      ))}
    </View>
  );
}

export function ActionsSection({ title, actions, storageKey }: { title: string; actions: GuidanceAction[]; storageKey: string }) {
  return (
    <Card>
      <H2>{title}</H2>
      <Checklist storageKey={storageKey} items={actions} />
    </Card>
  );
}

const NUMBER_LABEL: Record<keyof EmergencyNumbers, string> = {
  general: 'Emergency',
  police: 'Police',
  ambulance: 'Ambulance',
  fire: 'Fire',
  disaster: 'Disaster info',
};

export function EmergencyNumbersRow({ numbers }: { numbers: EmergencyNumbers }) {
  return (
    <View style={n.numbers}>
      {(Object.keys(numbers) as (keyof EmergencyNumbers)[]).map((k) => (
        <Pressable
          key={k}
          onPress={() => callNumber(numbers[k]!)}
          style={({ pressed }) => [n.number, pressed && { opacity: 0.8 }]}
          accessibilityRole="button"
          accessibilityLabel={`Call ${NUMBER_LABEL[k]} ${numbers[k]}`}
        >
          <Ionicons name="call" size={20} color="#fff" />
          <View>
            <Text style={n.numberValue}>{numbers[k]}</Text>
            <Text style={n.numberLabel}>{NUMBER_LABEL[k]}</Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

const n = StyleSheet.create({
  numbers: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  number: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: colors.danger,
    borderRadius: 12,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    minWidth: 140,
    flexGrow: 1,
  },
  numberValue: { color: '#fff', fontSize: font.xl, fontWeight: '800' },
  numberLabel: { color: '#fff', fontSize: font.sm, fontWeight: '600' },
});

const s = StyleSheet.create({
  decision: { borderRadius: 14, padding: space.lg, gap: space.xs },
  decisionTitle: { color: '#fff', fontSize: font.xxl, fontWeight: '800', flexShrink: 1 },
  decisionWhy: { color: '#fff', fontWeight: '700', marginTop: space.sm, fontSize: font.md },
  decisionReason: { color: '#fff', fontSize: font.md, lineHeight: 22 },
  title: { fontSize: font.md + 1, fontWeight: '700', color: colors.text },
  label: { fontSize: font.sm, fontWeight: '700', color: colors.muted, textTransform: 'uppercase', marginTop: space.xs },
  rank: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 30,
    fontWeight: '800',
    overflow: 'hidden',
  },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { backgroundColor: colors.bg, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, fontSize: 13, color: colors.muted, overflow: 'hidden' },
  missing: { color: colors.warn, fontWeight: '600' },
  actionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.xs },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 44,
  },
  actionText: { color: colors.primary, fontWeight: '700', fontSize: font.md },
  checkRow: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start', paddingVertical: 4 },
  checkTitle: { fontSize: font.md, fontWeight: '600', color: colors.text },
  checkDone: { textDecorationLine: 'line-through', color: colors.muted },
});
