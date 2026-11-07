import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';
import { ContactsStep, HomeStep, HouseholdStep, WhereStep } from '../../components/ProfileForm';
import { Body, Button, H1, H2, Screen } from '../../components/ui';
import { useT } from '../../i18n/useT';
import { useProfile, useRequiredProfile } from '../../store/ProfileProvider';

export default function ProfileScreen() {
  const profile = useRequiredProfile();
  const { saveProfile, clearProfile } = useProfile();
  const [draft, setDraft] = useState(profile);
  const t = useT(draft.language);
  useEffect(() => setDraft(profile), [profile]);

  const dirty = JSON.stringify(draft) !== JSON.stringify(profile);

  const reset = () => {
    const go = async () => {
      await clearProfile();
      router.replace('/onboarding');
    };
    if (Platform.OS === 'web') {
      // eslint-disable-next-line no-alert
      if (globalThis.confirm?.(t('resetConfirm'))) go();
    } else {
      Alert.alert(t('resetProfile'), t('resetConfirm'), [
        { text: t('no'), style: 'cancel' },
        { text: t('yes'), style: 'destructive', onPress: go },
      ]);
    }
  };

  const props = { draft, setDraft, t };
  return (
    <Screen>
      <H1>{t('editProfile')}</H1>
      <Body muted>{t('privacyNote')}</Body>
      <WhereStep {...props} />
      <H2>{t('stepHousehold')}</H2>
      <HouseholdStep {...props} />
      <H2>{t('stepHome')}</H2>
      <HomeStep {...props} />
      <H2>{t('stepContacts')}</H2>
      <ContactsStep {...props} />
      <Button label={t('save')} onPress={() => saveProfile(draft)} disabled={!dirty} />
      <Button label={t('resetProfile')} variant="danger" onPress={reset} />
    </Screen>
  );
}
