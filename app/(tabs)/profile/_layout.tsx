import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomTabNavigation, TabItem } from "@/components/ui/BottomTabNavigation";
import { useThemeColor } from "@/hooks/use-theme-color";
import ProfileTab from "./index";
import StatsTab from "./stats";
import SettingsTab from "./settings";

type ProfileTabKey = 'index' | 'stats' | 'settings';

const PROFILE_TABS: TabItem[] = [
  {
    key: 'index',
    title: 'Profile',
    icon: 'person.circle'
  },
  {
    key: 'stats',
    title: 'Stats',
    icon: 'chart.bar'
  },
  {
    key: 'settings',
    title: 'Settings',
    icon: 'gearshape'
  }
];

export default function ProfileTabLayout() {
  const [activeTab, setActiveTab] = useState<ProfileTabKey>('index');
  const backgroundColor = useThemeColor({}, "background");

  const renderContent = () => {
    switch (activeTab) {
      case 'index':
        return <ProfileTab />;
      case 'stats':
        return <StatsTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <ProfileTab />;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top', 'left', 'right']}>
      <BottomTabNavigation
        tabs={PROFILE_TABS}
        activeTab={activeTab}
        onTabChange={(tabKey) => setActiveTab(tabKey as ProfileTabKey)}
      />
      <View style={styles.content}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});