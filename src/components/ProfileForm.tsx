import * as Location from 'expo-location';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { COUNTRIES, COUNTRY_LIST } from '../data';
import { nearest } from '../engine/geo';
import { LANGUAGE_NAMES, type StringKey } from '../i18n';
import { colors, font, space } from '../theme';
import type { CountryCode, HomeType, Language, Profile } from '../types';
import { Body, Button, Card, Choice, Counter, H2, ToggleRow } from './ui';

type T = (key: StringKey, vars?: Record<string, string | number>) => string;

export interface StepProps {
  draft: Profile;
  setDraft: (p: Profile) => void;
  t: T;
}

const HOME_TYPES: HomeType[] = ['concrete', 'brick', 'wood', 'mud', 'tin', 'tent'];

export function WhereStep({ draft, setDraft, t }: StepProps) {
  const country = COUNTRIES[draft.countryCode];
  const [gpsMsg, setGpsMsg] = useState<string | null>(null);

  const setCountry = (code: CountryCode) => {
    const c = COUNTRIES[code];
    const d = c.districts[0];
    const language: Language = c.languages.includes(draft.language) || draft.language === 'en' ? draft.language : 'en';
    setDraft({ ...draft, countryCode: code, language, location: undefined, home: { ...draft.home, districtId: d.id, nearCoast: d.coastal } });
  };

  const setDistrict = (id: string) => {
    const d = country.districts.find((x) => x.id === id)!;
    setDraft({ ...draft, home: { ...draft.home, districtId: id, nearCoast: d.coastal } });
  };

  const useGps = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setGpsMsg(t('gpsDenied'));
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const loc = { lat: pos.coords.latitude, lon: pos.coords.longitude };
      const d = nearest(loc, country.districts);
      setDraft({ ...draft, location: loc, home: { ...draft.home, districtId: d?.id ?? draft.home.districtId } });
      setGpsMsg(t('gpsSet'));
    } catch {
      setGpsMsg(t('gpsDenied'));
    }
  };

  const languages = Array.from(new Set<Language>([...country.languages, 'en']));

  return (
    <>
      <Card>
        <H2>{t('country')}</H2>
        <Choice
          options={COUNTRY_LIST.map((c) => ({ value: c.code, label: `${c.flag} ${c.name}` }))}
          value={draft.countryCode}
          onChange={setCountry}
        />
      </Card>
      <Card>
        <H2>{t('language')}</H2>
        <Choice
          options={languages.map((l) => ({ value: l, label: LANGUAGE_NAMES[l] }))}
          value={draft.language}
          onChange={(language) => setDraft({ ...draft, language })}
        />
      </Card>
      <Card>
        <H2>{t('district')}</H2>
        <Choice
          options={country.districts.map((d) => ({ value: d.id, label: d.name }))}
          value={draft.home.districtId}
          onChange={setDistrict}
        />
        <Button label={t('useGps')} variant="secondary" onPress={useGps} />
        {gpsMsg && <Body muted>{gpsMsg}</Body>}
      </Card>
    </>
  );
}

export function HouseholdStep({ draft, setDraft, t }: StepProps) {
  const h = draft.household;
  const set = (patch: Partial<typeof h>) => setDraft({ ...draft, household: { ...h, ...patch } });
  return (
    <>
      <Card>
        <Counter label={t('adults')} value={h.adults} onChange={(adults) => set({ adults })} />
        <Counter label={t('children')} value={h.children} onChange={(children) => set({ children })} />
        <Counter label={t('infants')} value={h.infants} onChange={(infants) => set({ infants })} />
        <Counter label={t('elderly')} value={h.elderly} onChange={(elderly) => set({ elderly })} />
      </Card>
      <Card>
        <ToggleRow label={t('pregnant')} value={h.pregnant} onChange={(pregnant) => set({ pregnant })} />
        <ToggleRow label={t('mobility')} value={h.mobilityImpaired} onChange={(mobilityImpaired) => set({ mobilityImpaired })} />
        <ToggleRow label={t('medication')} value={h.needsMedication} onChange={(needsMedication) => set({ needsMedication })} />
        <ToggleRow label={t('powerDependent')} value={h.powerDependent} onChange={(powerDependent) => set({ powerDependent })} />
        <ToggleRow label={t('pets')} value={h.pets} onChange={(pets) => set({ pets })} />
        <ToggleRow label={t('livestock')} value={h.livestock} onChange={(livestock) => set({ livestock })} />
      </Card>
    </>
  );
}

export function HomeStep({ draft, setDraft, t }: StepProps) {
  const home = draft.home;
  const set = (patch: Partial<typeof home>) => setDraft({ ...draft, home: { ...home, ...patch } });
  return (
    <>
      <Card>
        <H2>{t('homeType')}</H2>
        <Choice
          options={HOME_TYPES.map((v) => ({ value: v, label: t(`home_${v}` as StringKey) }))}
          value={home.homeType}
          onChange={(homeType) => set({ homeType })}
        />
      </Card>
      <Card>
        <Counter label={t('floors')} value={home.floors} min={1} onChange={(floors) => set({ floors })} />
        <ToggleRow label={t('nearCoast')} value={home.nearCoast} onChange={(nearCoast) => set({ nearCoast })} />
        <ToggleRow label={t('nearRiver')} value={home.nearRiver} onChange={(nearRiver) => set({ nearRiver })} />
        <ToggleRow label={t('onSlope')} value={home.onSlope} onChange={(onSlope) => set({ onSlope })} />
        <ToggleRow label={t('hasVehicle')} value={home.hasVehicle} onChange={(hasVehicle) => set({ hasVehicle })} />
      </Card>
    </>
  );
}

export function ContactsStep({ draft, setDraft, t }: StepProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const add = () => {
    if (!phone.trim()) return;
    setDraft({ ...draft, emergencyContacts: [...draft.emergencyContacts, { name: name.trim() || phone.trim(), phone: phone.trim() }] });
    setName('');
    setPhone('');
  };
  const remove = (i: number) => setDraft({ ...draft, emergencyContacts: draft.emergencyContacts.filter((_, j) => j !== i) });

  return (
    <Card>
      {draft.emergencyContacts.map((c, i) => (
        <View key={`${c.phone}-${i}`} style={s.contactRow}>
          <Body>
            {c.name} · {c.phone}
          </Body>
          <Pressable onPress={() => remove(i)} accessibilityLabel={`Remove ${c.name}`} hitSlop={12}>
            <Text style={s.remove}>✕</Text>
          </Pressable>
        </View>
      ))}
      <TextInput style={s.input} placeholder={t('contactName')} value={name} onChangeText={setName} />
      <TextInput style={s.input} placeholder={t('contactPhone')} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <Button label={t('addContact')} variant="secondary" onPress={add} disabled={!phone.trim()} />
    </Card>
  );
}

const s = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: space.md,
    fontSize: font.md,
    backgroundColor: colors.bg,
    minHeight: 48,
  },
  contactRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  remove: { fontSize: font.lg, color: colors.danger, paddingHorizontal: space.sm },
});
