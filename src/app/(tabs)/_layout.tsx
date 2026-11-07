import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import type { ColorValue } from 'react-native';
import { useT } from '../../i18n/useT';
import { useProfile } from '../../store/ProfileProvider';
import { colors } from '../../theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

const icon = (name: IconName) => ({ color, size }: { color: ColorValue; size: number }) => (
  <Ionicons name={name} color={color as string} size={size} />
);

export default function TabsLayout() {
  const { profile, loading } = useProfile();
  const t = useT();
  if (!loading && !profile) return <Redirect href="/onboarding" />;
  if (!profile) return null;
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarLabelStyle: { fontSize: 13, lineHeight: 18, fontWeight: '600' },
        tabBarStyle: { height: 66, paddingTop: 6, paddingBottom: 8 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: t('tabHome'), tabBarIcon: icon('home') }} />
      <Tabs.Screen name="plan" options={{ title: t('tabPlan'), tabBarIcon: icon('list') }} />
      <Tabs.Screen name="help" options={{ title: t('tabHelp'), tabBarIcon: icon('call') }} />
      <Tabs.Screen name="profile" options={{ title: t('tabProfile'), tabBarIcon: icon('person') }} />
    </Tabs>
  );
}
