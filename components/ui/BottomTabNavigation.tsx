import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';

export interface TabItem {
  key: string;
  title: string;
  icon?: string;
}

interface BottomTabNavigationProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabKey: string) => void;
  backgroundColor?: string;
  activeColor?: string;
  inactiveColor?: string;
}

export const BottomTabNavigation: React.FC<BottomTabNavigationProps> = ({
  tabs,
  activeTab,
  onTabChange,
  backgroundColor,
  activeColor,
  inactiveColor,
}) => {
  const defaultBackgroundColor = useThemeColor({}, 'background');
  const defaultActiveColor = useThemeColor({}, 'tint');
  const defaultInactiveColor = useThemeColor({}, 'tabIconDefault');
  const borderColor = useThemeColor({}, 'icon');

  const finalBackgroundColor = backgroundColor || defaultBackgroundColor;
  const finalActiveColor = activeColor || defaultActiveColor;
  const finalInactiveColor = inactiveColor || defaultInactiveColor;

  return (
    <View style={[styles.tabBar, { backgroundColor: finalBackgroundColor, borderBottomColor: borderColor + '20' }]}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              isActive && { borderBottomColor: finalActiveColor }
            ]}
            onPress={() => onTabChange(tab.key)}
          >
            {tab.icon && (
              <IconSymbol
                name={tab.icon as any}
                size={20}
                color={isActive ? finalActiveColor : finalInactiveColor}
              />
            )}
            <Text style={[
              styles.tabText,
              { color: isActive ? finalActiveColor : finalInactiveColor },
              isActive && styles.activeTabText
            ]}>
              {tab.title}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingTop: 8,
    paddingBottom: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  tabText: {
    fontSize: 16,
  },
  activeTabText: {
    fontWeight: '600',
  },
});