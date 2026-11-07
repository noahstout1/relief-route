import { useMemo, useState } from 'react';
import { AgencyCard, EmergencyNumbersRow, ShelterCard } from '../../components/cards';
import { Banner, Body, Card, H1, H2, Screen, ToggleRow } from '../../components/ui';
import { getCountry, getDistrict } from '../../data';
import { deriveFlags } from '../../engine/flags';
import { findShelters } from '../../engine/shelterFinder';
import { useT } from '../../i18n/useT';
import { useRequiredProfile } from '../../store/ProfileProvider';

export default function HelpScreen() {
  const profile = useRequiredProfile();
  const t = useT();
  const country = getCountry(profile.countryCode);
  const district = getDistrict(profile.countryCode, profile.home.districtId);
  const [suitableOnly, setSuitableOnly] = useState(false);

  const shelters = useMemo(() => {
    const origin = profile.location ?? district ?? country.districts[0];
    return findShelters(country, origin, deriveFlags(profile, district), { suitableOnly });
  }, [profile, country, district, suitableOnly]);

  return (
    <Screen>
      <H1>{t('tabHelp')}</H1>

      <H2>{t('emergencyNumbers')}</H2>
      <EmergencyNumbersRow numbers={country.emergencyNumbers} />

      <H2>{t('shelters')}</H2>
      <Card>
        <ToggleRow label={t('filterSuitable')} value={suitableOnly} onChange={setSuitableOnly} />
      </Card>
      <Banner tone="warn">{t('sampleData')}</Banner>
      {shelters.length === 0 ? (
        <Body muted>{t('noShelter')}</Body>
      ) : (
        shelters.map((r) => <ShelterCard key={r.shelter.id} item={r} t={t} />)
      )}

      <H2>{t('agencies')}</H2>
      {country.agencies.map((a) => (
        <AgencyCard key={a.id} agency={a} t={t} />
      ))}

      <Body muted>{t('dataVerified', { date: country.lastVerified })}</Body>
    </Screen>
  );
}
