// app/_layout.tsx  ← VERSÃO SIMPLES E QUE FUNCIONA 100%
import { Stack } from 'expo-router';
import { FiltroProvider } from './context/FiltroContext';

export default function RootLayout() {
  return (
    <FiltroProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
      </Stack>
    </FiltroProvider>
  );
}