import React, { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter, Stack } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import faqData from '@/assets/data/faq.json';

export default function FAQScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());

  const toggleQuestion = (categoryIndex: number, questionIndex: number) => {
    const key = `${categoryIndex}-${questionIndex}`;
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedQuestions(newExpanded);
  };

  const isExpanded = (categoryIndex: number, questionIndex: number) => {
    return expandedQuestions.has(`${categoryIndex}-${questionIndex}`);
  };

  const renderContent = (content: string) => {
    // Simple markdown-like parsing for bold text and line breaks
    const lines = content.split('\n');
    return lines.map((line, lineIndex) => {
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <ThemedText key={lineIndex} style={styles.answerText}>
          {parts.map((part, partIndex) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <ThemedText key={partIndex} style={styles.boldText}>
                  {part.slice(2, -2)}
                </ThemedText>
              );
            }
            return part;
          })}
          {lineIndex < lines.length - 1 && '\n'}
        </ThemedText>
      );
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
            {faqData.title}
          </ThemedText>
          <ThemedText style={styles.description}>
            {faqData.description}
          </ThemedText>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <ThemedView style={styles.content}>
            {faqData.categories.map((category, categoryIndex) => (
              <View key={categoryIndex} style={styles.category}>
                <ThemedText style={styles.categoryTitle}>
                  {category.name}
                </ThemedText>

                {category.questions.map((item, questionIndex) => (
                  <View key={questionIndex} style={styles.questionContainer}>
                    <TouchableOpacity
                      style={[
                        styles.questionButton,
                        isDark ? styles.questionButtonDark : styles.questionButtonLight,
                      ]}
                      onPress={() => toggleQuestion(categoryIndex, questionIndex)}
                    >
                      <ThemedText style={styles.questionText}>
                        {item.question}
                      </ThemedText>
                      <ThemedText style={styles.expandIcon}>
                        {isExpanded(categoryIndex, questionIndex) ? '−' : '+'}
                      </ThemedText>
                    </TouchableOpacity>

                    {isExpanded(categoryIndex, questionIndex) && (
                      <View style={[
                        styles.answerContainer,
                        isDark ? styles.answerContainerDark : styles.answerContainerLight,
                      ]}>
                        {renderContent(item.answer)}
                      </View>
                    )}
                  </View>
                ))}
              </View>
            ))}
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
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.2)',
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 8,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  category: {
    marginBottom: 32,
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  questionContainer: {
    marginBottom: 12,
  },
  questionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  questionButtonLight: {
    backgroundColor: '#F9F9F9',
    borderColor: '#E0E0E0',
  },
  questionButtonDark: {
    backgroundColor: '#1A1A1A',
    borderColor: '#333',
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    paddingRight: 12,
  },
  expandIcon: {
    fontSize: 24,
    fontWeight: '300',
    opacity: 0.6,
  },
  answerContainer: {
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  answerContainerLight: {
    backgroundColor: '#FAFAFA',
  },
  answerContainerDark: {
    backgroundColor: '#151515',
  },
  answerText: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.85,
  },
  boldText: {
    fontWeight: '700',
  },
});
