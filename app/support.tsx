import React from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter, Stack } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function SupportScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const openLink = (url: string) => {
    Linking.openURL(url);
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
            Play Serve Support
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Welcome to Play Serve support! We're here to help you connect with tennis players and build your tennis community.
          </ThemedText>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <ThemedView style={styles.content}>

            {/* Quick Help Section */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Quick Help</ThemedText>

              <View style={styles.subsection}>
                <ThemedText style={styles.subsectionTitle}>Getting Started</ThemedText>
                <View style={styles.list}>
                  <ThemedText style={styles.listItem}>• Download via iOS App Store</ThemedText>
                  <ThemedText style={styles.listItem}>• Create account with email</ThemedText>
                  <ThemedText style={styles.listItem}>• Find and join local tennis clubs</ThemedText>
                  <ThemedText style={styles.listItem}>• Browse players and send match invitations</ThemedText>
                </View>
              </View>

              <View style={styles.subsection}>
                <ThemedText style={styles.subsectionTitle}>Common Questions</ThemedText>

                <View style={styles.questionBlock}>
                  <ThemedText style={styles.questionLabel}>Location feature:</ThemedText>
                  <ThemedText style={styles.questionAnswer}>
                    Use the location feature to discover clubs in your area. Make sure location permissions are enabled.
                  </ThemedText>
                </View>

                <View style={styles.questionBlock}>
                  <ThemedText style={styles.questionLabel}>Match scoring:</ThemedText>
                  <ThemedText style={styles.questionAnswer}>
                    Supports standard tennis scoring via "Record Match" feature
                  </ThemedText>
                </View>

                <View style={styles.questionBlock}>
                  <ThemedText style={styles.questionLabel}>Rankings:</ThemedText>
                  <ThemedText style={styles.questionAnswer}>
                    Points-based system within individual clubs
                  </ThemedText>
                </View>

                <View style={styles.questionBlock}>
                  <ThemedText style={styles.questionLabel}>Cross-club matches:</ThemedText>
                  <ThemedText style={styles.questionAnswer}>
                    Currently limited to within-club competition
                  </ThemedText>
                </View>
              </View>
            </View>

            {/* Contact Support Section */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Contact Support</ThemedText>

              <View style={styles.subsection}>
                <ThemedText style={styles.subsectionTitle}>Report Issues or Request Features</ThemedText>

                <View style={styles.contactInfo}>
                  <ThemedText style={styles.contactLabel}>Email:</ThemedText>
                  <TouchableOpacity onPress={() => openLink('mailto:support@caritos.com')}>
                    <ThemedText style={styles.link}>support@caritos.com</ThemedText>
                  </TouchableOpacity>
                </View>

                <View style={styles.contactInfo}>
                  <ThemedText style={styles.contactLabel}>GitHub Issues:</ThemedText>
                  <TouchableOpacity onPress={() => openLink('https://github.com/caritos/tennis/issues')}>
                    <ThemedText style={styles.link}>github.com/caritos/tennis/issues</ThemedText>
                  </TouchableOpacity>
                </View>

                <ThemedText style={styles.responseTime}>
                  Response timeframe: 24-48 hours
                </ThemedText>
              </View>

              <View style={styles.subsection}>
                <ThemedText style={styles.subsectionTitle}>Required Information</ThemedText>
                <View style={styles.list}>
                  <ThemedText style={styles.listItem}>• iOS version</ThemedText>
                  <ThemedText style={styles.listItem}>• App version (in Settings)</ThemedText>
                  <ThemedText style={styles.listItem}>• Step-by-step problem description</ThemedText>
                  <ThemedText style={styles.listItem}>• Screenshots (optional)</ThemedText>
                </View>
              </View>
            </View>

            {/* Additional Resources Section */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Additional Resources</ThemedText>

              <View style={styles.resourceLinks}>
                <TouchableOpacity
                  style={[styles.resourceButton, isDark ? styles.resourceButtonDark : styles.resourceButtonLight]}
                  onPress={() => router.push('/faq')}
                >
                  <ThemedText style={styles.resourceButtonText}>FAQ</ThemedText>
                  <ThemedText style={styles.resourceArrow}>→</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.resourceButton, isDark ? styles.resourceButtonDark : styles.resourceButtonLight]}
                  onPress={() => router.push('/privacy-policy')}
                >
                  <ThemedText style={styles.resourceButtonText}>Privacy Policy</ThemedText>
                  <ThemedText style={styles.resourceArrow}>→</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.resourceButton, isDark ? styles.resourceButtonDark : styles.resourceButtonLight]}
                  onPress={() => router.push('/terms-of-service')}
                >
                  <ThemedText style={styles.resourceButtonText}>Terms of Service</ThemedText>
                  <ThemedText style={styles.resourceArrow}>→</ThemedText>
                </TouchableOpacity>
              </View>
            </View>

            {/* App Information Section */}
            <View style={[styles.section, styles.appInfoSection]}>
              <ThemedText style={styles.sectionTitle}>App Information</ThemedText>
              <View style={styles.appInfoGrid}>
                <View style={styles.appInfoItem}>
                  <ThemedText style={styles.appInfoLabel}>Version:</ThemedText>
                  <ThemedText style={styles.appInfoValue}>1.0.1</ThemedText>
                </View>
                <View style={styles.appInfoItem}>
                  <ThemedText style={styles.appInfoLabel}>Minimum iOS:</ThemedText>
                  <ThemedText style={styles.appInfoValue}>15.0</ThemedText>
                </View>
                <View style={styles.appInfoItem}>
                  <ThemedText style={styles.appInfoLabel}>Developer:</ThemedText>
                  <ThemedText style={styles.appInfoValue}>Caritos</ThemedText>
                </View>
                <View style={styles.appInfoItem}>
                  <ThemedText style={styles.appInfoLabel}>Category:</ThemedText>
                  <ThemedText style={styles.appInfoValue}>Sports & Social</ThemedText>
                </View>
              </View>
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
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 8,
    lineHeight: 22,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  subsection: {
    marginBottom: 24,
  },
  subsectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  list: {
    gap: 8,
  },
  listItem: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.85,
  },
  questionBlock: {
    marginBottom: 16,
  },
  questionLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  questionAnswer: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.85,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  contactLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginRight: 8,
  },
  link: {
    fontSize: 15,
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  responseTime: {
    fontSize: 14,
    opacity: 0.7,
    fontStyle: 'italic',
    marginTop: 8,
  },
  resourceLinks: {
    gap: 12,
  },
  resourceButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  resourceButtonLight: {
    backgroundColor: '#F9F9F9',
    borderColor: '#E0E0E0',
  },
  resourceButtonDark: {
    backgroundColor: '#1A1A1A',
    borderColor: '#333',
  },
  resourceButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  resourceArrow: {
    fontSize: 18,
    opacity: 0.6,
  },
  appInfoSection: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.2)',
    paddingTop: 24,
  },
  appInfoGrid: {
    gap: 16,
  },
  appInfoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appInfoLabel: {
    fontSize: 15,
    opacity: 0.7,
  },
  appInfoValue: {
    fontSize: 15,
    fontWeight: '600',
  },
});
