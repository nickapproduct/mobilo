import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { spacing, theme } from '../theme';

export function Button({
  label,
  onPress,
  tone = 'primary',
  busy = false,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  tone?: 'primary' | 'quiet';
  busy?: boolean;
  disabled?: boolean;
}) {
  const primary = tone === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || busy}
      style={({ pressed }) => [
        styles.button,
        primary ? styles.primary : styles.quiet,
        (pressed || busy) && { opacity: 0.75 },
        (disabled || busy) && !primary && { opacity: 0.5 },
      ]}
    >
      {busy ? (
        <ActivityIndicator color={primary ? '#fff' : theme.brand} />
      ) : (
        <Text style={[styles.label, primary ? styles.labelPrimary : styles.labelQuiet]}>{label}</Text>
      )}
    </Pressable>
  );
}

export function Screen({ children }: { children: ReactNode }) {
  return <View style={styles.screen}>{children}</View>;
}

export function Title({ children }: { children: ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function Body({ children }: { children: ReactNode }) {
  return <Text style={styles.body}>{children}</Text>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff', padding: spacing(3) },
  title: { fontSize: 26, fontWeight: '700', color: theme.ink, marginBottom: spacing(1) },
  body: { fontSize: 16, lineHeight: 24, color: theme.body },
  button: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing(2),
  },
  primary: { backgroundColor: theme.brand },
  quiet: { backgroundColor: '#fff', borderWidth: 1, borderColor: theme.line },
  label: { fontSize: 16, fontWeight: '600' },
  labelPrimary: { color: '#fff' },
  labelQuiet: { color: theme.ink },
});
