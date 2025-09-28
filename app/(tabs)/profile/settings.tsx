import React, { useState } from "react";
import {
  ScrollView,
  View,
  TouchableOpacity,
  Alert,
} from "react-native";
import { globalStyles } from '@/assets/styles/styles';
const faqData = require("@/assets/data/faq.json");
const privacyData = require("@/assets/data/privacy-policy.json");
import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useThemeColor } from "@/hooks/use-theme-color";
import { supabase } from "@/lib/supabase";

export default function SettingsTab() {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "icon");
  const tintColor = useThemeColor({}, "tint");

  const [showFAQ, setShowFAQ] = useState(false);
  const [expandedFAQItems, setExpandedFAQItems] = useState<Set<string>>(new Set());
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [expandedPrivacyItems, setExpandedPrivacyItems] = useState<Set<string>>(new Set());
  const [showContactSupport, setShowContactSupport] = useState(false);

  const toggleFAQItem = (itemId: string) => {
    const newExpanded = new Set(expandedFAQItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedFAQItems(newExpanded);
  };

  const togglePrivacyItem = (itemId: string) => {
    const newExpanded = new Set(expandedPrivacyItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedPrivacyItems(newExpanded);
  };

  const handleSignOut = async () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            const { error } = await supabase.auth.signOut();
            if (error) {
              Alert.alert("Error", error.message);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <ScrollView style={[globalStyles.container, { backgroundColor }]} contentContainerStyle={globalStyles.scrollContainer}>
      <View>
        <TouchableOpacity
          style={globalStyles.menuItem}
          onPress={() => setShowFAQ(!showFAQ)}
        >
          <View style={[globalStyles.menuIcon, { backgroundColor: tintColor }]}>
            <IconSymbol name="questionmark.circle.fill" size={20} color="white" />
          </View>
          <ThemedText style={globalStyles.menuText}>FAQ / Help</ThemedText>
          <IconSymbol
            name={showFAQ ? "chevron.up" : "chevron.down"}
            size={16}
            color={borderColor + "60"}
          />
        </TouchableOpacity>

        {/* FAQ Accordion Content */}
        {showFAQ && (
          <View style={globalStyles.faqSection}>
            {faqData.categories.map((category, categoryIndex) => (
              <View key={categoryIndex} style={globalStyles.faqCategory}>
                <ThemedText style={[globalStyles.faqCategoryTitle, { color: tintColor }]}>
                  {category.name}
                </ThemedText>

                {category.questions.map((item, itemIndex) => {
                  const itemId = `${categoryIndex}-${itemIndex}`;
                  const isExpanded = expandedFAQItems.has(itemId);

                  return (
                    <View key={itemIndex} style={globalStyles.faqItem}>
                      <TouchableOpacity
                        style={globalStyles.faqQuestion}
                        onPress={() => toggleFAQItem(itemId)}
                      >
                        <ThemedText style={globalStyles.faqQuestionText}>
                          {item.question}
                        </ThemedText>
                        <IconSymbol
                          name={isExpanded ? "chevron.up" : "chevron.down"}
                          size={14}
                          color={borderColor + "80"}
                        />
                      </TouchableOpacity>

                      {isExpanded && (
                        <View style={globalStyles.faqAnswer}>
                          <ThemedText style={[globalStyles.faqAnswerText, { color: textColor + "90" }]}>
                            {item.answer}
                          </ThemedText>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={globalStyles.menuItem}
          onPress={() => setShowPrivacyPolicy(!showPrivacyPolicy)}
        >
          <View style={[globalStyles.menuIcon, { backgroundColor: tintColor }]}>
            <IconSymbol name="checkmark.shield.fill" size={20} color="white" />
          </View>
          <ThemedText style={globalStyles.menuText}>Privacy Policy</ThemedText>
          <IconSymbol
            name={showPrivacyPolicy ? "chevron.up" : "chevron.down"}
            size={16}
            color={borderColor + "60"}
          />
        </TouchableOpacity>

        {/* Privacy Policy Accordion Content */}
        {showPrivacyPolicy && (
          <View style={globalStyles.faqSection}>
            {privacyData.sections.map((section, index) => {
              const sectionId = `privacy-${index}`;
              const isExpanded = expandedPrivacyItems.has(sectionId);

              return (
                <View key={index} style={globalStyles.faqCategory}>
                  <TouchableOpacity
                    style={globalStyles.faqQuestion}
                    onPress={() => togglePrivacyItem(sectionId)}
                  >
                    <ThemedText style={[globalStyles.faqCategoryTitle, { color: tintColor }]}>
                      {section.title}
                    </ThemedText>
                    <IconSymbol
                      name={isExpanded ? "chevron.up" : "chevron.down"}
                      size={14}
                      color={borderColor + "80"}
                    />
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={globalStyles.faqAnswer}>
                      {section.content && (
                        <ThemedText style={[globalStyles.faqAnswerText, { color: textColor + "90", marginBottom: 12 }]}>
                          {section.content}
                        </ThemedText>
                      )}

                      {section.items && (
                        <View>
                          {section.items.map((item, itemIndex) => (
                            <ThemedText
                              key={itemIndex}
                              style={[globalStyles.faqAnswerText, { color: textColor + "90", marginBottom: 6, paddingLeft: 8 }]}
                            >
                              • {item}
                            </ThemedText>
                          ))}
                        </View>
                      )}

                      {section.subsections && (
                        <View>
                          {section.subsections.map((subsection, subIndex) => (
                            <View key={subIndex} style={{ marginTop: 16, marginBottom: 8 }}>
                              <ThemedText style={[globalStyles.faqQuestionText, { fontWeight: '600', marginBottom: 8 }]}>
                                {subsection.title}
                              </ThemedText>
                              {subsection.items && subsection.items.map((item, itemIndex) => (
                                <ThemedText
                                  key={itemIndex}
                                  style={[globalStyles.faqAnswerText, { color: textColor + "90", marginBottom: 6, paddingLeft: 8 }]}
                                >
                                  • {item}
                                </ThemedText>
                              ))}
                            </View>
                          ))}
                        </View>
                      )}

                      {section.note && (
                        <ThemedText style={[globalStyles.faqAnswerText, {
                          color: textColor + "70",
                          fontStyle: 'italic',
                          marginTop: 12,
                          paddingTop: 12,
                          borderTopWidth: 0.5,
                          borderTopColor: 'rgba(0,0,0,0.1)'
                        }]}>
                          {section.note}
                        </ThemedText>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        <TouchableOpacity
          style={globalStyles.menuItem}
          onPress={() => setShowContactSupport(!showContactSupport)}
        >
          <View style={[globalStyles.menuIcon, { backgroundColor: tintColor }]}>
            <IconSymbol name="envelope.fill" size={20} color="white" />
          </View>
          <ThemedText style={globalStyles.menuText}>Contact Support</ThemedText>
          <IconSymbol
            name={showContactSupport ? "chevron.up" : "chevron.down"}
            size={16}
            color={borderColor + "60"}
          />
        </TouchableOpacity>

        {/* Contact Support Accordion Content */}
        {showContactSupport && (
          <View style={globalStyles.faqSection}>
            <View style={globalStyles.faqCategory}>
              <ThemedText style={[globalStyles.faqCategoryTitle, { color: tintColor }]}>
                Get Help
              </ThemedText>

              <View style={globalStyles.faqAnswer}>
                <ThemedText style={[globalStyles.faqAnswerText, { color: textColor + "90", marginBottom: 16 }]}>
                  Need assistance with Play Serve? We&apos;re here to help! Reach out to us and we&apos;ll get back to you as soon as possible.
                </ThemedText>

                <View>
                  <ThemedText style={[globalStyles.faqAnswerText, { color: textColor + "70", textAlign: 'center' }]}>
                    📧 eladio@caritos.com
                  </ThemedText>
                  <ThemedText style={[globalStyles.faqAnswerText, { color: textColor + "60", textAlign: 'center', fontSize: 12, marginTop: 8 }]}>
                    We typically respond within 24 hours
                  </ThemedText>
                </View>
              </View>
            </View>
          </View>
        )}
      </View>

      <View style={globalStyles.actionSection}>
        <TouchableOpacity style={[globalStyles.signOutButton, { backgroundColor: tintColor }]} onPress={handleSignOut}>
          <ThemedText style={globalStyles.signOutText}>Sign Out</ThemedText>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}