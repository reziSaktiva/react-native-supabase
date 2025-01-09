import React from "react";
import { Session } from "@supabase/supabase-js";
import { Slot, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import { PowerSyncProvider } from "@/powersync/drizzle/PowerSyncProvider";
import { useSystem } from "@/powersync/drizzle/PowerSync";
import { StatusBar } from "expo-status-bar";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function InitialLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [initialize, setInitialize] = useState<boolean>(false);

  const segments = useSegments();
  const router = useRouter();

  const { supabaseConnector } = useSystem();
  const system = useSystem();

  useEffect(() => {
    system.init()
  }, []);

  useEffect(() => {
    const { data } = supabaseConnector.client.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setInitialize(true);
      }
    );

    return () => {
      data.subscription.unsubscribe();
    };
  }, [initialize]);

  useEffect(() => {
    if (!initialize) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (session && !inAuthGroup) {
      router.replace("/(auth)");
    } else if (!session) {
      router.replace("/");
    }
  }, [session, initialize]);

  return (
    <>
      <StatusBar style="light" />
      <Slot />
    </>
  );
}

export default function App() {
  return (
    <PowerSyncProvider>
      <InitialLayout />
    </PowerSyncProvider>
  );
}
