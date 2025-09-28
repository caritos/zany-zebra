import React, { useState } from "react";
import {
  ScrollView,
  View,
  TouchableOpacity,
} from "react-native";
import { globalStyles } from '../../styles/styles';
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
      <ScrollView style={[globalStyles.container, { backgroundColor }]}>
        {faqData.categories.map((category, categoryIndex) => (
          <ThemedView
            key={categoryIndex}
            style={[globalStyles.section, { borderColor: borderColor + "20" }]}
          >
            <ThemedText style={[globalStyles.categoryTitle, { color: tintColor }]}>
              {category.name}
            </ThemedText>

            {category.questions.map((item, itemIndex) => {
              const itemId = `${categoryIndex}-${itemIndex}`;
              const isExpanded = expandedItems.has(itemId);

              return (
                <View key={itemIndex} style={globalStyles.questionContainer}>
                  <TouchableOpacity
                    style={globalStyles.questionHeader}
                    onPress={() => toggleExpanded(itemId)}
                  >
                    <ThemedText style={globalStyles.question}>
                      {item.question}
                    </ThemedText>
                    <IconSymbol
                      name={isExpanded ? "chevron.up" : "chevron.down"}
                      size={16}
                      color={borderColor + "80"}
                    />
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={globalStyles.answerContainer}>
                      <ThemedText style={[globalStyles.answer, { color: textColor + "90" }]}>
                        {item.answer}
                      </ThemedText>
                    </View>
                  )}
                </View>
              );
            })}
          </ThemedView>
        ))}

        <View style={globalStyles.bottomSpacing} />
      </ScrollView>
    </>
  );
}
