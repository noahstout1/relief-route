import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { ContactsStep, HomeStep, HouseholdStep, WhereStep } from '../components/ProfileForm';
import { Body, Button, H1, Screen } from '../components/ui';
import { useT } from '../i18n/useT';
import { defaultProfile, deviceDefaults } from '../store/defaults';
import { useProfile } from '../store/ProfileProvider';
import { space } from '../theme';

const STEPS = [
  { key: 'stepWhere', C: WhereStep },
  { key: 'stepHousehold', C: HouseholdStep },
  { key: 'stepHome', C: HomeStep },
  { key: 'stepContacts', C: ContactsStep },
] as const;

export default function Onboarding() {
  const { saveProfile } = useProfile();
  const [draft, setDraft] = useState(() => {
    const d = deviceDefaults();
    return defaultProfile(d.countryCode, d.language);
  });
  const [step, setStep] = useState(0);
  const t = useT(draft.language);
  const { key, C } = STEPS[step];
  const last = step === STEPS.length - 1;

  const finish = async () => {
    await saveProfile(draft);
    router.replace('/(tabs)');
  };

  return (
    <Screen>
      {step === 0 && (
        <>
          <H1>{t('appName')}</H1>
          <Body muted>{t('tagline')}</Body>
        </>
      )}
      <Body muted>
        {step + 1} / {STEPS.length}
      </Body>
      <H1>{t(key)}</H1>
      <C draft={draft} setDraft={setDraft} t={t} />
      {last && <Body muted>{t('privacyNote')}</Body>}
      <View style={{ flexDirection: 'row', gap: space.sm }}>
        {step > 0 && (
          <View style={{ flex: 1 }}>
            <Button label={t('back')} variant="secondary" onPress={() => setStep(step - 1)} />
          </View>
        )}
        <View style={{ flex: 2 }}>
          <Button label={last ? t('finish') : t('next')} onPress={last ? finish : () => setStep(step + 1)} />
        </View>
      </View>
    </Screen>
  );
}
