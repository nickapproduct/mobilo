import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Body, Button, Screen, Title } from '../lib/ui';
import { topUp, type TopUpResult } from '../lib/api';
import { spacing, theme } from '../theme';
import type { Nav } from '../navigation';

const AMOUNTS = [5, 10, 20, 50];

const NOT_CHARGED = 'You have not been charged.';

const DECLINED: Record<NonNullable<TopUpResult['declineCode']>, string> = {
  insufficient_funds: `Your bank declined this payment: not enough funds on the card. ${NOT_CHARGED} Try a smaller amount or another card.`,
  expired_card: `Your bank declined this payment: the card has expired. ${NOT_CHARGED} Try another card.`,
  do_not_honour: `Your bank declined this payment. ${NOT_CHARGED} Try another card, or contact your bank.`,
};

export function TopUpScreen({ navigation }: Nav<'TopUp'>) {
  const [amount, setAmount] = useState(10);
  const [card, setCard] = useState('');
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState('');

  const pay = async () => {
    setBusy(true);
    setProblem('');
    const result = await topUp(amount, card);
    setBusy(false);
    if (result.ok) {
      navigation.goBack();
    } else {
      setProblem(DECLINED[result.declineCode ?? 'do_not_honour']);
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
      {problem ? <Text style={styles.problem}>{problem}</Text> : null}

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
  problem: { marginTop: spacing(1), color: theme.danger, fontSize: 15 },
});
