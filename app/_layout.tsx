import { supabase } from "@/utils/supabase";
import { Session } from "@supabase/supabase-js";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [initialize, setInitialize] = useState<boolean>(false);

  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setInitialize(true);
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, [initialize]);

  useEffect(() => {
    if (!initialize) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!inAuthGroup && session) {
      router.replace("/(auth)");
    } else if (!session) {
      router.replace("/");
    }
  }, [initialize, session, segments]);

  return (
    <>
      <Stack>
        <Stack.Screen
          name="(auth)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}
