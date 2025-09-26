import React from "react";
import { StyleSheet, ScrollView, View } from "react-native";
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
        style={[styles.bulletItem, { color: textColor + "90" }]}
      >
        • {item}
      </ThemedText>
    ));
  };

  return (
    <>
      <Stack.Screen options={{ title: "Privacy Policy", headerShown: true }} />
      <ScrollView style={[styles.container, { backgroundColor }]}>
        <ThemedView style={styles.header}>
          <ThemedText style={styles.title}>{privacyData.title}</ThemedText>
          <ThemedText style={[styles.effectiveDate, { color: textColor + "60" }]}>
            Effective Date: {privacyData.effectiveDate}
          </ThemedText>
        </ThemedView>

        {privacyData.sections.map((section, index) => (
          <ThemedView
            key={index}
            style={[styles.section, { borderColor: borderColor + "20" }]}
          >
            <ThemedText style={[styles.sectionTitle, { color: tintColor }]}>
              {section.title}
            </ThemedText>

            {section.content && (
              <ThemedText style={[styles.content, { color: textColor + "90" }]}>
                {section.content}
              </ThemedText>
            )}

            {section.items && (
              <View style={styles.itemsContainer}>
                {renderItems(section.items)}
              </View>
            )}

            {section.subsections &&
              section.subsections.map((subsection, subIndex) => (
                <View key={subIndex} style={styles.subsection}>
                  <ThemedText style={styles.subsectionTitle}>
                    {subsection.title}
                  </ThemedText>
                  {renderItems(subsection.items)}
                </View>
              ))}

            {section.note && (
              <ThemedText style={[styles.note, { color: textColor + "70" }]}>
                {section.note}
              </ThemedText>
            )}
          </ThemedView>
        ))}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  effectiveDate: {
    fontSize: 14,
    fontStyle: "italic",
  },
  section: {
    margin: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  content: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  itemsContainer: {
    marginTop: 8,
  },
  bulletItem: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 6,
    paddingLeft: 8,
  },
  subsection: {
    marginTop: 16,
    marginBottom: 8,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  note: {
    fontSize: 13,
    fontStyle: "italic",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  bottomSpacing: {
    height: 40,
  },
});