import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { EmergencyNumbersRow, HAZARD_ICON } from '../../components/cards';
import { Banner, Body, Card, H1, H2, Screen } from '../../components/ui';
import { getCountry, getDistrict } from '../../data';
import type { StringKey } from '../../i18n';
import { useT } from '../../i18n/useT';
import { topAlert, type DisasterAlert } from '../../services/alertParser';
import { useAlerts } from '../../services/alerts';
import { useRequiredProfile } from '../../store/ProfileProvider';
import { colors, font, space } from '../../theme';
import type { HazardType } from '../../types';

const LEVEL_COLOR = { Red: colors.danger, Orange: colors.warn, Green: colors.ok };

function timeAgo(iso?: string): string {
  if (!iso) return '';
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 60) return `${mins} min ago`;
  if (mins < 48 * 60) return `${Math.round(mins / 60)} h ago`;
  return `${Math.round(mins / 1440)} days ago`;
}

const openPlan = (hazard: HazardType) => router.navigate({ pathname: '/plan', params: { hazard } });

function AlertRow({ a }: { a: DisasterAlert }) {
  return (
    <Pressable
      style={st.alert}
      onPress={() => (a.url ? Linking.openURL(a.url) : openPlan(a.hazard))}
      accessibilityRole="button"
      accessibilityLabel={`${a.level} alert: ${a.title}`}
    >
      <View style={[st.levelDot, { backgroundColor: LEVEL_COLOR[a.level] }]}>
        <Ionicons name={HAZARD_ICON[a.hazard]} size={18} color="#fff" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={st.alertTitle}>{a.title}</Text>
        <Body muted>
          {a.level} · {a.current ? 'active' : 'ended'} · {a.to.slice(0, 10)}
          {!a.affectsCountry ? ` · ${Math.round(a.distanceKm)} km away` : ''}
        </Body>
        {a.severity && <Body muted>{a.severity}</Body>}
      </View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const profile = useRequiredProfile();
  const t = useT();
  const country = getCountry(profile.countryCode);
  const district = getDistrict(profile.countryCode, profile.home.districtId);
  const { alerts, fetchedAt, loading, offline, refresh } = useAlerts(country);
  const top = topAlert(alerts);

  return (
    <Screen>
      <H1>
        {country.flag} {t('appName')}
      </H1>
      <Body muted>{t('greeting', { district: `${district?.name ?? ''}, ${country.name}` })}</Body>

      {top && (
        <Pressable onPress={() => openPlan(top.hazard)} accessibilityRole="button">
          <View style={[st.urgent, { backgroundColor: LEVEL_COLOR[top.level] }]}>
            <Ionicons name="warning" size={32} color="#fff" />
            <View style={{ flex: 1 }}>
              <Text style={st.urgentTitle}>{top.title}</Text>
              <Text style={st.urgentText}>{t('whatToDo')} →</Text>
            </View>
          </View>
        </Pressable>
      )}

      <H2>{t('whatToDo')}</H2>
      <View style={st.grid}>
        {country.hazards.map((h) => (
          <Pressable key={h} style={st.hazardBtn} onPress={() => openPlan(h)} accessibilityRole="button">
            <Ionicons name={HAZARD_ICON[h]} size={30} color={colors.primary} />
            <Text style={st.hazardText}>{t(`hz_${h}` as StringKey)}</Text>
          </Pressable>
        ))}
      </View>

      <H2>{t('emergencyNumbers')}</H2>
      <EmergencyNumbersRow numbers={country.emergencyNumbers} />

      <View style={st.row}>
        <H2>{t('liveAlerts')}</H2>
        <Pressable onPress={refresh} accessibilityLabel="Refresh alerts" hitSlop={12}>
          {loading ? <ActivityIndicator /> : <Ionicons name="refresh" size={24} color={colors.primary} />}
        </Pressable>
      </View>
      {offline && (
        <Banner tone="warn">{fetchedAt ? t('offlineAlerts', { time: timeAgo(fetchedAt) }) : t('alertsUnavailable')}</Banner>
      )}
      <Card>
        {alerts.length === 0 && !loading ? (
          <Body muted>{t('noAlerts', { country: country.name })}</Body>
        ) : (
          alerts.slice(0, 8).map((a) => <AlertRow key={a.id} a={a} />)
        )}
        <Body muted>Source: GDACS (Global Disaster Alert and Coordination System)</Body>
      </Card>

      {country.warningSystem && (
        <Card>
          <H2>{t('warningSystem')}</H2>
          <Body>{country.warningSystem}</Body>
        </Card>
      )}
    </Screen>
  );
}

const st = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  urgent: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.lg, borderRadius: 14 },
  urgentTitle: { color: '#fff', fontSize: font.lg, fontWeight: '800' },
  urgentText: { color: '#fff', fontSize: font.md, fontWeight: '600', marginTop: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  hazardBtn: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: space.lg,
    alignItems: 'center',
    gap: space.xs,
    minHeight: 88,
  },
  hazardText: { fontSize: font.md, fontWeight: '700', color: colors.text, textAlign: 'center' },
  alert: { flexDirection: 'row', gap: space.md, paddingVertical: space.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  levelDot: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  alertTitle: { fontSize: font.md, fontWeight: '700', color: colors.text },
});
