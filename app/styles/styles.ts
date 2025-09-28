import { StyleSheet } from 'react-native';

export const globalStyles = StyleSheet.create({
  // Layout containers
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },

  // Common layout patterns
  centeredItem: {
    alignItems: 'center',
  },
  rowSpaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowSpaceAround: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  rowWithGap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  // Common text styles
  largeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  labelWithMargin: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  bodyText: {
    fontSize: 16,
  },
  smallText: {
    fontSize: 14,
  },
  tinyText: {
    fontSize: 12,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    textAlign: 'center',
  },
  centeredText: {
    textAlign: 'center',
  },

  // Common value styles
  largeValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  mediumValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  smallValue: {
    fontSize: 15,
    fontWeight: '600',
  },

  // Profile specific styles
  profileHeader: {
    padding: 20,
    paddingTop: 20,
    alignItems: 'center',
  },
  inputContainer: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 56,
    justifyContent: 'center',
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  fieldValue: {
    fontSize: 16,
    flex: 1,
  },
  editingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
  },

  // Stats specific styles
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  statsErrorText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  section: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  paddedBottom: {
    paddingBottom: 20,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 15,
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 13,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },

  // Aliases for backward compatibility during migration
  profileHeaderTitle: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  metricLabel: {
    fontSize: 15,
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '600',
  },

  // Settings specific styles
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  menuIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  actionSection: {
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  signOutButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  signOutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  // FAQ specific styles
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  questionContainer: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  question: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
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

  // Privacy Policy specific styles
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
    fontWeight: '600',
    marginBottom: 8,
  },
  note: {
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },

  // Common styles
  bottomSpacing: {
    height: 40,
  },
});