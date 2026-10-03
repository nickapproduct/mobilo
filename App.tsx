import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { HomeScreen } from './src/screens/HomeScreen';
import { OtpScreen } from './src/screens/OtpScreen';
import { SignInScreen } from './src/screens/SignInScreen';
import { TariffsScreen } from './src/screens/TariffsScreen';
import { TopUpScreen } from './src/screens/TopUpScreen';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import type { Stack as Routes } from './src/navigation';
import { theme } from './src/theme';

const Stack = createNativeStackNavigator<Routes>();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator
        screenOptions={{
          headerTintColor: theme.ink,
          headerShadowVisible: false,
          headerTitleStyle: { fontSize: 17 },
        }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SignIn" component={SignInScreen} options={{ title: 'Sign in' }} />
        <Stack.Screen name="Otp" component={OtpScreen} options={{ title: 'Code' }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="TopUp" component={TopUpScreen} options={{ title: 'Top up' }} />
        <Stack.Screen name="Tariffs" component={TariffsScreen} options={{ title: 'Tariffs' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
