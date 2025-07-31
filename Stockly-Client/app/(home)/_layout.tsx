import { AuthContext } from "@/libs/AuthContext";
import { Redirect, Stack } from "expo-router";
import { useContext } from "react";

export default function HomeLayout() {
  const authState = useContext(AuthContext)
  
  if(!authState.isReady){
    return null;
  }

  if(!authState.isLoggedIn){
    return <Redirect href="/login"/>;
  }
  
  return (
    <Stack screenOptions={{headerShown: false}}>
      
        <Stack.Screen name="index"/>
      
    </Stack>
    );
}
