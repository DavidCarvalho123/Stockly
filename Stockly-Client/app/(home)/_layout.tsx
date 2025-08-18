import React, { useContext, useEffect } from "react";
import { Redirect, Stack } from "expo-router";
import { Platform } from "react-native";
import { AuthContext } from "@/libs/AuthContext";
import { Colours } from "@/libs/Constants";

export default function HomeLayout() {
  const authState = useContext(AuthContext);

  // Adiciona o estilo de focus apenas no cliente (web)
  useEffect(() => {
    if (Platform.OS === "web" && typeof document !== "undefined") {
      const style = document.createElement("style");
      style.innerHTML = `
        input:focus, textarea:focus, select:focus {
          outline: none !important;
          border-color: ${Colours.stocklyBlue} !important;
          box-shadow: 0 0 0 2px ${Colours.stocklyBlue}40 !important;
        }
      `;
      document.head.appendChild(style);

      return () => {
        try {
          document.head.removeChild(style);
        } catch {}
      };
    }
  }, []);

  if (!authState.isReady) {
    return null;
  }

  if (!authState.isLoggedIn) {
    return <Redirect href="/login" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
