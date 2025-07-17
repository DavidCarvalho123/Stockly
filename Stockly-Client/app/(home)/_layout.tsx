import { Stack } from "expo-router";

export default function HomeLayout() {
  const isLoggedIn = true // para substituir com lógica de login

  return (
    <Stack screenOptions={{headerShown: false}}>
      <Stack.Protected guard={isLoggedIn}>
        <Stack.Screen name="index"/>
      </Stack.Protected>
    </Stack>
    );
}
