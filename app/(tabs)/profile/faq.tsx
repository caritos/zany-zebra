import React, { useState } from "react";
import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Stack } from "expo-router";
import faqData from "@/docs/faq.json";

export default function FAQScreen() {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "icon");
  const tintColor = useThemeColor({}, "tint");

  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <>
      <Stack.Screen options={{ title: "FAQ / Help", headerShown: true }} />
      <ScrollView style={[styles.container, { backgroundColor }]}>
        {faqData.categories.map((category, categoryIndex) => (
          <ThemedView
            key={categoryIndex}
            style={[styles.category, { borderColor: borderColor + "20" }]}
          >
            <ThemedText style={[styles.categoryTitle, { color: tintColor }]}>
              {category.name}
            </ThemedText>

            {category.questions.map((item, itemIndex) => {
              const itemId = `${categoryIndex}-${itemIndex}`;
              const isExpanded = expandedItems.has(itemId);

              return (
                <View key={itemIndex} style={styles.questionContainer}>
                  <TouchableOpacity
                    style={styles.questionHeader}
                    onPress={() => toggleExpanded(itemId)}
                  >
                    <ThemedText style={styles.question}>
                      {item.question}
                    </ThemedText>
                    <IconSymbol
                      name={isExpanded ? "chevron.up" : "chevron.down"}
                      size={16}
                      color={borderColor + "80"}
                    />
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.answerContainer}>
                      <ThemedText style={[styles.answer, { color: textColor + "90" }]}>
                        {item.answer}
                      </ThemedText>
                    </View>
                  )}
                </View>
              );
            })}
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
  category: {
    margin: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  questionContainer: {
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  questionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  question: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    marginRight: 12,
  },
  answerContainer: {
    paddingBottom: 16,
    paddingRight: 28,
  },
  answer: {
    fontSize: 14,
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 40,
  },
});