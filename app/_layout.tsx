import React from "react";
import { Session } from "@supabase/supabase-js";
import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import { PowerSyncProvider } from "@/powersync/drizzle/PowerSyncProvider";
import { dbPath, useSystem } from "@/powersync/drizzle/PowerSync";
import { StatusBar } from "expo-status-bar";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import * as SQLite from "expo-sqlite";

const sqlite = SQLite.openDatabaseSync("test.sqlite", {
  enableChangeListener: true,
}, dbPath);

function InitialLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [initialize, setInitialize] = useState<boolean>(false);

  const segments = useSegments();
  const router = useRouter();

  const system = useSystem();
  const { supabaseConnector } = useSystem();

  useEffect(() => {
    system.init()
  }, []);

  useDrizzleStudio(sqlite);


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
