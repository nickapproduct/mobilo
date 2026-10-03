import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Screen, Title } from '../lib/ui';
import { tariffs } from '../lib/api';
import { spacing, theme } from '../theme';

export function TariffsScreen() {
  const [rows, setRows] = useState<{ name: string; price: number; data: string }[] | null>(null);
  useEffect(() => {
    void tariffs().then(setRows);
  }, []);
  return (
    <Screen>
      <Title>Tariffs</Title>
      {rows === null ? (
        <ActivityIndicator style={{ marginTop: spacing(4) }} color={theme.brand} />
      ) : (
        rows.map((t) => (
          <View key={t.name} style={styles.row}>
            <View>
              <Text style={styles.name}>{t.name}</Text>
              <Text style={styles.data}>{t.data}</Text>
            </View>
            <Text style={styles.price}>{t.price} ₾/mo</Text>
          </View>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    marginTop: spacing(2),
    padding: spacing(2),
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.line,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: { fontSize: 17, fontWeight: '700', color: theme.ink },
  data: { fontSize: 15, color: theme.body, marginTop: 2 },
  price: { fontSize: 16, fontWeight: '600', color: theme.brand },
});
