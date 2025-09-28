import React from "react";
import { ScrollView, View } from "react-native";
import { globalStyles } from '../../styles/styles';
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Stack } from "expo-router";
import privacyData from "@/docs/privacy-policy.json";

export default function PrivacyPolicyScreen() {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "icon");
  const tintColor = useThemeColor({}, "tint");

  const renderItems = (items: string[] | undefined) => {
    if (!items) return null;
    return items.map((item, index) => (
      <ThemedText
        key={index}
        style={[globalStyles.bulletItem, { color: textColor + "90" }]}
      >
        • {item}
      </ThemedText>
    ));
  };

  return (
    <>
      <Stack.Screen options={{ title: "Privacy Policy", headerShown: true }} />
      <ScrollView style={[globalStyles.container, { backgroundColor }]}>
        {privacyData.sections.map((section, index) => (
          <ThemedView
            key={index}
            style={[globalStyles.section, { borderColor: borderColor + "20" }]}
          >
            <ThemedText style={[globalStyles.sectionTitle, { color: tintColor }]}>
              {section.title}
            </ThemedText>

            {section.content && (
              <ThemedText style={[globalStyles.content, { color: textColor + "90" }]}>
                {section.content}
              </ThemedText>
            )}

            {section.items && (
              <View style={globalStyles.itemsContainer}>
                {renderItems(section.items)}
              </View>
            )}

            {section.subsections &&
              section.subsections.map((subsection, subIndex) => (
                <View key={subIndex} style={globalStyles.subsection}>
                  <ThemedText style={globalStyles.subsectionTitle}>
                    {subsection.title}
                  </ThemedText>
                  {renderItems(subsection.items)}
                </View>
              ))}

            {section.note && (
              <ThemedText style={[globalStyles.note, { color: textColor + "70" }]}>
                {section.note}
              </ThemedText>
            )}
          </ThemedView>
        ))}

        <View style={globalStyles.bottomSpacing} />
      </ScrollView>
    </>
  );
}
