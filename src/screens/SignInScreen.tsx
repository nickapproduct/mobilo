import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Body, Button, Screen, Title } from '../lib/ui';
import { requestOtp } from '../lib/api';
import { spacing, theme } from '../theme';
import type { Nav } from '../navigation';

export function SignInScreen({ navigation }: Nav<'SignIn'>) {
  const [msisdn, setMsisdn] = useState('');
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState('');

  const send = async () => {
    setBusy(true);
    setProblem('');
    try {
      await requestOtp(msisdn);
      navigation.navigate('Otp');
    } catch {
      setProblem('Error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <Title>Your number</Title>
      <Body>We will text you a code.</Body>
      <TextInput
        style={styles.input}
        value={msisdn}
        onChangeText={setMsisdn}
        placeholder="+995"
        keyboardType="phone-pad"
        autoFocus
      />
      {problem ? <Text style={styles.problem}>{problem}</Text> : null}
      <Button label="Send the code" onPress={() => void send()} busy={busy} />
      <View style={styles.spacer} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: theme.line,
    borderRadius: 12,
    paddingHorizontal: spacing(2),
    fontSize: 18,
    color: theme.ink,
    marginTop: spacing(2),
  },
  problem: { marginTop: spacing(1), color: theme.danger, fontSize: 15 },
  spacer: { flex: 1 },
});
