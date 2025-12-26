import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { PayslipProvider } from '@/src/context/PayslipContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <PayslipProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen
            name="payslip/[id]"
            options={{
              headerShown: true,
              title: 'Payslip Details',
              headerBackTitle: 'Back',
            }}
          />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </PayslipProvider>
  );
}
