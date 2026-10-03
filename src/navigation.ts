import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Account } from './lib/api';

export type Stack = {
  Welcome: undefined;
  SignIn: undefined;
  Otp: undefined;
  Home: { account: Account };
  TopUp: undefined;
  Tariffs: undefined;
};

export type Nav<K extends keyof Stack> = NativeStackScreenProps<Stack, K>;
