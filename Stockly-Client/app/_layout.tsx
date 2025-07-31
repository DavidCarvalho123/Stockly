import { AuthProvider } from "@/libs/AuthContext";
import { Stack } from "expo-router";

export default function RootLayout() {
  
  return (
    <AuthProvider>
      <Stack screenOptions={{headerShown: false}}>
          <Stack.Screen name="(home)" />
          <Stack.Screen name="login"  />
      </Stack>
    </AuthProvider>
    );
}
