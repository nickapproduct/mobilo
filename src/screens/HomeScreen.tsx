import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../lib/ui';
import { spacing, theme } from '../theme';
import type { Nav } from '../navigation';

function Icon({ glyph, onPress }: { glyph: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.icon}>
      <Text style={styles.glyph}>{glyph}</Text>
    </Pressable>
  );
}

export function HomeScreen({ navigation, route }: Nav<'Home'>) {
  const { account } = route.params;
  return (
    <Screen>
      <View style={styles.bar}>
        <Text style={styles.msisdn}>{account.msisdn}</Text>
        <View style={styles.icons}>
          <Icon glyph="⟳" onPress={() => undefined} />
          <Icon glyph="☰" onPress={() => undefined} />
        </View>
      </View>

      <View style={styles.balance}>
        <Text style={styles.balanceLabel}>Balance</Text>
        <Text style={styles.balanceValue}>{account.balance.toFixed(2)} ₾</Text>
        <Pressable style={styles.topUp} onPress={() => navigation.navigate('TopUp')}>
          <Text style={styles.topUpText}>Top up</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{account.tariff}</Text>
        <Text style={styles.cardBody}>{account.dataLeftGb} GB left this month</Text>
      </View>

      <Pressable style={styles.row} onPress={() => navigation.navigate('Tariffs')}>
        <Text style={styles.rowText}>Change tariff</Text>
        <Text style={styles.chevron}>›</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing(2) },
  msisdn: { fontSize: 16, fontWeight: '600', color: theme.ink },
  icons: { flexDirection: 'row', gap: spacing(1) },
  icon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  glyph: { fontSize: 20, color: theme.body },
  balance: { marginTop: spacing(3), padding: spacing(3), borderRadius: 16, backgroundColor: theme.brand },
  balanceLabel: { color: '#C7D7F5', fontSize: 14 },
  balanceValue: { color: '#fff', fontSize: 40, fontWeight: '800', marginTop: spacing(0.5) },
  topUp: {
    marginTop: spacing(2),
    height: 44,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topUpText: { color: theme.brand, fontWeight: '700', fontSize: 16 },
  card: {
    marginTop: spacing(2),
    padding: spacing(2.5),
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.line,
  },
  cardTitle: { fontSize: 18, fontWeight: '700', color: theme.ink },
  cardBody: { fontSize: 15, color: theme.body, marginTop: spacing(0.5) },
  row: {
    marginTop: spacing(2),
    height: 56,
    paddingHorizontal: spacing(2),
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.line,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowText: { fontSize: 16, color: theme.ink },
  chevron: { fontSize: 22, color: theme.muted },
});
