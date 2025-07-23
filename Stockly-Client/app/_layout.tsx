import { Stack } from "expo-router";

export default function RootLayout() {
  const isLoggedIn = true // para substituir com lógica de login

  return (
    <Stack screenOptions={{headerShown: false}}>
      
      <Stack.Protected guard={isLoggedIn}>
        <Stack.Screen name="(home)" />
      </Stack.Protected>
      
      <Stack.Screen name="login"  />
    </Stack>
    );
}
