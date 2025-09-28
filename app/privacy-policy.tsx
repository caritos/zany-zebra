import React from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter, Stack } from 'expo-router';
import privacyPolicyData from '@/assets/data/privacy-policy.json';

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  const renderContent = (content: string) => {
    // Simple markdown-like parsing for bold text
    const parts = content.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <ThemedText key={index} style={styles.boldText}>
            {part.slice(2, -2)}
          </ThemedText>
        );
      }
      return part;
    });
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ThemedView style={styles.container}>
        <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ThemedText style={styles.backButtonText}>← Back</ThemedText>
        </TouchableOpacity>
        <ThemedText type="title" style={styles.headerTitle}>
          {privacyPolicyData.title}
        </ThemedText>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <ThemedView style={styles.content}>
          <ThemedText style={styles.effectiveDate}>
            Effective Date: {privacyPolicyData.effectiveDate}
          </ThemedText>

          {privacyPolicyData.sections.map((section: any, sectionIndex: number) => (
            <View key={sectionIndex} style={styles.section}>
              <ThemedText style={styles.sectionTitle}>{section.title}</ThemedText>

              {section.content && (
                <ThemedText style={styles.sectionContent}>
                  {renderContent(section.content)}
                </ThemedText>
              )}

              {section.subsections && section.subsections.map((subsection: any, subIndex: number) => (
                <View key={subIndex} style={styles.subsection}>
                  <ThemedText style={styles.subsectionTitle}>
                    {subsection.title}
                  </ThemedText>

                  {subsection.items && (
                    <View style={styles.itemsList}>
                      {subsection.items.map((item: string, itemIndex: number) => (
                        <View key={itemIndex} style={styles.listItem}>
                          <ThemedText style={styles.bulletPoint}>•</ThemedText>
                          <ThemedText style={styles.listItemText}>
                            {renderContent(item)}
                          </ThemedText>
                        </View>
                      ))}
                    </View>
                  )}

                  {subsection.content && (
                    <ThemedText style={styles.subsectionContent}>
                      {renderContent(subsection.content)}
                    </ThemedText>
                  )}
                </View>
              ))}

              {section.items && (
                <View style={styles.itemsList}>
                  {section.items.map((item: string, itemIndex: number) => (
                    <View key={itemIndex} style={styles.listItem}>
                      <ThemedText style={styles.bulletPoint}>•</ThemedText>
                      <ThemedText style={styles.listItemText}>
                        {renderContent(item)}
                      </ThemedText>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}

          <View style={styles.contactSection}>
            <ThemedText style={styles.sectionTitle}>Contact Us</ThemedText>
            <ThemedText style={styles.contactText}>
              If you have questions about this Privacy Policy, please contact us at:
            </ThemedText>
            <ThemedText style={styles.contactEmail}>
              {privacyPolicyData.contactEmail}
            </ThemedText>
          </View>
        </ThemedView>
      </ScrollView>
    </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  headerTitle: {
    fontSize: 28,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  effectiveDate: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
  },
  sectionContent: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.8,
  },
  subsection: {
    marginTop: 15,
    marginLeft: 10,
  },
  subsectionTitle: {
    fontSize: 17,
    fontWeight: '500',
    marginBottom: 8,
  },
  subsectionContent: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.8,
  },
  itemsList: {
    marginTop: 10,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 15,
    marginRight: 10,
    opacity: 0.6,
  },
  listItemText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.8,
  },
  boldText: {
    fontWeight: '600',
  },
  contactSection: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  contactText: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.8,
    marginBottom: 10,
  },
  contactEmail: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
});