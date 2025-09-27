import React from "react";
import { Tabs } from "expo-router";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useThemeColor } from "@/hooks/use-theme-color";

export default function ProfileTabLayout() {
  const tintColor = useThemeColor({}, "tint");
  const tabBarActiveTintColor = useThemeColor({}, "tabIconSelected");
  const tabBarInactiveTintColor = useThemeColor({}, "tabIconDefault");

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor,
        tabBarInactiveTintColor,
        headerShown: false,
        tabBarPosition: "top",
        tabBarStyle: {
          backgroundColor: useThemeColor({}, "background"),
          borderBottomWidth: 1,
          borderBottomColor: useThemeColor({}, "icon") + "20",
          paddingTop: 50,
          paddingBottom: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color }) => (
            <IconSymbol name="person.circle" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          tabBarIcon: ({ color }) => (
            <IconSymbol name="chart.bar" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ color }) => (
            <IconSymbol name="gearshape" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="faq"
        options={{
          href: null, // This hides it from tabs
        }}
      />
      <Tabs.Screen
        name="privacy-policy"
        options={{
          href: null, // This hides it from tabs
        }}
      />
    </Tabs>
  );
}