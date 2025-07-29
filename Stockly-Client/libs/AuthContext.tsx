import AsyncStorage from "@react-native-async-storage/async-storage";
import { SplashScreen, useRouter } from "expo-router";
import { createContext, PropsWithChildren, useEffect, useState } from "react";
import { TestConnection } from "./Requests";

SplashScreen.preventAutoHideAsync();

type AuthState = {
  isLoggedIn: boolean;
  isReady: boolean;
  logIn: (token:string) => void;
  logOut: () => void;
};

const authStorageKey = "jwtToken";

export const AuthContext = createContext<AuthState>({
  isLoggedIn: false,
  isReady: false,
  logIn: () => {},
  logOut: () => {},
});

export function AuthProvider({ children }: PropsWithChildren) {
  const [isReady, setIsReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  const storeAuthState = async (token:string) => {
    try {
      const jsonValue = JSON.stringify(token);
      await AsyncStorage.setItem(authStorageKey, jsonValue);
    } catch (error) {
      console.log("Error saving", error);
    }
  };

  const removeAuthState = async () => {
    try{
        await AsyncStorage.removeItem(authStorageKey);
    } catch (error) {
      console.log("Error saving", error);
    }
  }

  const logIn = (token:string) => {
    setIsLoggedIn(true);
    storeAuthState(token);
    router.replace("/");
  };

  const logOut = () => {
    setIsLoggedIn(false);
    removeAuthState();
    router.replace("/login");
  };

  useEffect(() => {
    const getAuthFromStorage = async () => {
      try {
          const status = await TestConnection()
          if(status >= 200 && status < 300)
            setIsLoggedIn(true);
          else
            setIsLoggedIn(false);
      } catch (error) {
        console.log("Error fetching from storage", error);
      }
      setIsReady(true);
    };
    getAuthFromStorage();
  }, []);

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  return (
    <AuthContext.Provider
      value={{
        isReady,
        isLoggedIn,
        logIn,
        logOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}