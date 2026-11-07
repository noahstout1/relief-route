import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ActionsSection, Checklist, DecisionCard, HAZARD_ICON, ProgramCard, ShelterCard } from '../../components/cards';
import { Banner, Body, Card, H1, H2, Screen } from '../../components/ui';
import { GUIDANCE, getCountry } from '../../data';
import { buildPlan } from '../../engine/planEngine';
import type { StringKey } from '../../i18n';
import { useT } from '../../i18n/useT';
import { useRequiredProfile } from '../../store/ProfileProvider';
import { colors, font, space } from '../../theme';
import type { HazardType } from '../../types';

export default function PlanScreen() {
  const profile = useRequiredProfile();
  const t = useT();
  const country = getCountry(profile.countryCode);
  const params = useLocalSearchParams<{ hazard?: string }>();
  const [hazard, setHazard] = useState<HazardType>(country.hazards[0]);

  useEffect(() => {
    if (params.hazard && country.hazards.includes(params.hazard as HazardType)) setHazard(params.hazard as HazardType);
  }, [params.hazard, country]);

  useEffect(() => {
    if (!country.hazards.includes(hazard)) setHazard(country.hazards[0]);
  }, [country, hazard]);

  const plan = useMemo(() => buildPlan(profile, country, GUIDANCE, hazard), [profile, country, hazard]);
  const keyBase = `${profile.countryCode}.${hazard}`;

  return (
    <Screen>
      <H1>{t('tabPlan')}</H1>
      <Body muted>{t('chooseHazard')}</Body>
      <View style={st.hazards} accessibilityRole="tablist">
        {country.hazards.map((h) => {
          const sel = h === hazard;
          return (
            <Pressable
              key={h}
              onPress={() => setHazard(h)}
              style={[st.hazard, sel && st.hazardSel]}
              accessibilityRole="tab"
              accessibilityState={{ selected: sel }}
            >
              <Ionicons name={HAZARD_ICON[h]} size={22} color={sel ? '#fff' : colors.primary} />
              <Text style={[st.hazardText, sel && { color: '#fff' }]}>{t(`hz_${h}` as StringKey)}</Text>
            </Pressable>
          );
        })}
      </View>

      <DecisionCard decision={plan.decision} t={t} />

      <H2>{t('yourShelter')}</H2>
      {plan.shelters.length === 0 ? (
        <Banner tone="warn">{t('noShelter')}</Banner>
      ) : (
        plan.shelters.map((r, i) => <ShelterCard key={r.shelter.id} item={r} t={t} rank={i} />)
      )}
      {plan.shelters.some((r) => !r.shelter.verified) && <Banner tone="warn">{t('sampleData')}</Banner>}

      {plan.phases.map((p) => (
        <ActionsSection key={p.phase} title={t(`ph_${p.phase}` as StringKey)} actions={p.actions} storageKey={`${keyBase}.${p.phase}`} />
      ))}

      <Card>
        <H2>{t('goBag')}</H2>
        <Checklist storageKey={`${keyBase}.kit`} items={plan.kit.map((k) => ({ id: k.id, title: k.label }))} />
      </Card>

      {plan.programs.length > 0 && (
        <>
          <H2>{t('programsForYou')}</H2>
          {plan.programs.map((p) => (
            <ProgramCard key={p.id} program={p} t={t} />
          ))}
        </>
      )}
    </Screen>
  );
}

const st = StyleSheet.create({
  hazards: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  hazard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 44,
    backgroundColor: colors.card,
  },
  hazardSel: { backgroundColor: colors.primary },
  hazardText: { color: colors.primary, fontWeight: '700', fontSize: font.md },
});
