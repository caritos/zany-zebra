import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { globalStyles } from '@/assets/styles/styles';

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
    <View style={[globalStyles.tabBar, { backgroundColor: finalBackgroundColor, borderBottomColor: borderColor + '20' }]}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[
              globalStyles.tab,
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
              globalStyles.tabText,
              { color: isActive ? finalActiveColor : finalInactiveColor },
              isActive && globalStyles.activeTabText
            ]}>
              {tab.title}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};