import { useState } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';
import { Body, Button, Screen, Title } from '../lib/ui';
import { verifyOtp } from '../lib/api';
import { spacing, theme } from '../theme';
import type { Nav } from '../navigation';

export function OtpScreen({ navigation }: Nav<'Otp'>) {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState('');

  const check = async () => {
    setBusy(true);
    setProblem('');
    try {
      const account = await verifyOtp(code);
      navigation.reset({ index: 0, routes: [{ name: 'Home', params: { account } }] });
    } catch {
      setProblem('Error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <Title>Enter the code</Title>
      <Body>Six digits, just sent to your phone. Use 0000 on this build.</Body>
      <TextInput
        style={styles.input}
        value={code}
        onChangeText={setCode}
        keyboardType="number-pad"
        maxLength={6}
        autoFocus
      />
      {problem ? <Text style={styles.problem}>{problem}</Text> : null}
      <Button label="Continue" onPress={() => void check()} busy={busy} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: theme.line,
    borderRadius: 12,
    paddingHorizontal: spacing(2),
    fontSize: 24,
    letterSpacing: 8,
    color: theme.ink,
    marginTop: spacing(2),
  },
  problem: { marginTop: spacing(1), color: theme.danger, fontSize: 15 },
});
