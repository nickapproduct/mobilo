import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Body, Button, Screen, Title } from '../lib/ui';
import { topUp } from '../lib/api';
import { spacing, theme } from '../theme';
import type { Nav } from '../navigation';

const AMOUNTS = [5, 10, 20, 50];

export function TopUpScreen({ navigation }: Nav<'TopUp'>) {
  const [amount, setAmount] = useState(10);
  const [card, setCard] = useState('');
  const [busy, setBusy] = useState(false);

  const pay = async () => {
    setBusy(true);
    const result = await topUp(amount, card);
    setBusy(false);
    if (result.ok) {
      navigation.goBack();
    }
  };

  return (
    <Screen>
      <Title>Top up</Title>
      <Body>The money reaches your balance straight away.</Body>

      <View style={styles.amounts}>
        {AMOUNTS.map((a) => {
          const on = a === amount;
          return (
            <Text
              key={a}
              onPress={() => setAmount(a)}
              style={[styles.amount, on && styles.amountOn]}
            >
              {a} ₾
            </Text>
          );
        })}
      </View>

      <TextInput
        style={styles.input}
        value={card}
        onChangeText={setCard}
        placeholder="Card number"
        keyboardType="number-pad"
      />

      <Button label={`Pay ${amount} ₾`} onPress={() => void pay()} busy={busy} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  amounts: { flexDirection: 'row', gap: spacing(1), marginTop: spacing(3) },
  amount: {
    flex: 1,
    textAlign: 'center',
    paddingVertical: spacing(1.5),
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.line,
    fontSize: 16,
    color: theme.ink,
    overflow: 'hidden',
  },
  amountOn: { borderColor: theme.brand, color: theme.brand, fontWeight: '700' },
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
});
