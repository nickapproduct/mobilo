import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Body, Button, Screen, Title } from '../lib/ui';
import { spacing, theme } from '../theme';
import type { Nav } from '../navigation';

export function WelcomeScreen({ navigation }: Nav<'Welcome'>) {
  useEffect(() => {
    void Notifications.requestPermissionsAsync();
  }, []);

  return (
    <Screen>
      <View style={styles.mark}>
        <Text style={styles.markText}>Mobilo</Text>
      </View>
      <Title>Your mobile, in one place</Title>
      <Body>Balance, tariff and top-ups. Sign in with your number to get started.</Body>
      <View style={styles.spacer} />
      <Button label="Sign in" onPress={() => navigation.navigate('SignIn')} />
      <Button label="Become a subscriber" tone="quiet" onPress={() => navigation.navigate('SignIn')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  mark: { marginTop: spacing(6), marginBottom: spacing(4) },
  markText: { fontSize: 32, fontWeight: '800', color: theme.brand, letterSpacing: -0.5 },
  spacer: { flex: 1 },
});
