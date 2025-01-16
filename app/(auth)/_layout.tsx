import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { TouchableOpacity } from "react-native";
import { useSystem } from "@/powersync/drizzle/PowerSync";

const Layout = () => {
  const { supabaseConnector, powersync } = useSystem();
  const onSignOut = async () => {
    await powersync?.disconnectAndClear();
    await supabaseConnector.client.auth.signOut();
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#fff",
          tabBarStyle: {
            backgroundColor: "#363636",
          },
          headerStyle: {
            backgroundColor: "#363636",
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            headerTitleStyle: {
              color: "#fff",
            },
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" color={color} size={size} />
            )
          }}
        />
        <Tabs.Screen
          name="logs"
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="newspaper-outline" color={color} size={size} />
            )
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            headerTitleStyle: {
              color: "#fff",
            },
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-outline" color={color} size={size} />
            )
          }}
        />
      </Tabs>
    </GestureHandlerRootView>
  );
};

export default Layout;
