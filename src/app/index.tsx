import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useProfile } from '../store/ProfileProvider';

export default function Index() {
  const { profile, loading } = useProfile();
  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  return <Redirect href={profile ? '/(tabs)' : '/onboarding'} />;
}
