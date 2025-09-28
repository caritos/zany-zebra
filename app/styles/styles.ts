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


  // Common styles
  bottomSpacing: {
    height: 40,
  },

  // Stats page - HIG compliant design
  statsSection: {
    marginBottom: 32,
  },
  statsSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  statsLabel: {
    fontSize: 16,
    fontWeight: '400',
  },
  statsValue: {
    fontSize: 16,
    fontWeight: '600',
  },

  // FAQ Accordion styles
  faqSection: {
    backgroundColor: 'rgba(0,0,0,0.02)',
    marginHorizontal: -20,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  faqCategory: {
    marginBottom: 20,
  },
  faqCategoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  faqItem: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  faqQuestionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    marginRight: 12,
  },
  faqAnswer: {
    paddingBottom: 12,
    paddingRight: 24,
  },
  faqAnswerText: {
    fontSize: 14,
    lineHeight: 20,
  },

  // Common profile editor styles
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  infoLabel: {
    fontSize: 14,
    opacity: 0.6,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  zipCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  displayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2,
    justifyContent: 'flex-end',
  },
  editButton: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  editButtonText: {
    color: '#007AFF',
    fontSize: 12,
    fontWeight: '600',
  },
  editContainer: {
    flex: 2,
    alignItems: 'flex-end',
  },
  fieldInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
    width: '100%',
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 60,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f1f1f1',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },

  // Collapsible styles
  collapsibleHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  collapsibleContent: {
    marginTop: 6,
    marginLeft: 24,
  },

  // Tab navigation styles
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingTop: 8,
    paddingBottom: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  tabText: {
    fontSize: 16,
  },
  activeTabText: {
    fontWeight: '600',
  },

  // ThemedText component styles
  themedTextDefault: {
    fontSize: 16,
    lineHeight: 24,
  },
  themedTextDefaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  themedTextTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  themedTextSubtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  themedTextLink: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
  },

});