import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { UseProfileReturn } from '@/hooks/useProfile';

interface ZipCodeEditorProps {
  profile: UseProfileReturn['profile'];
  updateZipCode: UseProfileReturn['updateZipCode'];
  loading?: boolean;
}

export const ZipCodeEditor: React.FC<ZipCodeEditorProps> = ({
  profile,
  updateZipCode,
  loading = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [zipCodeValue, setZipCodeValue] = useState(profile?.zip_code || '');
  const [updating, setUpdating] = useState(false);

  const handleSave = async () => {
    if (!zipCodeValue.trim()) {
      Alert.alert('Error', 'Please enter a zip code');
      return;
    }

    setUpdating(true);

    try {
      const result = await updateZipCode(zipCodeValue.trim());

      if (result.success) {
        setIsEditing(false);
        Alert.alert('Success', result.message);
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update zip code');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    setZipCodeValue(profile?.zip_code || '');
    setIsEditing(false);
  };

  return (
    <>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Zip Code</Text>
        <View style={styles.zipCodeContainer}>
          <Text style={styles.infoValue}>
            {profile?.zip_code || 'Not set'}
          </Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(true)}
            disabled={loading}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={isEditing}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Zip Code</Text>
            <Text style={styles.modalSubtitle}>
              This helps us find tennis clubs near you
            </Text>

            <TextInput
              style={styles.input}
              value={zipCodeValue}
              onChangeText={setZipCodeValue}
              placeholder="Enter your zip code"
              keyboardType="numeric"
              maxLength={10}
              autoFocus
            />

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
                disabled={updating}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
                disabled={updating || !zipCodeValue.trim()}
              >
                {updating ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = {
  infoRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  infoLabel: {
    fontSize: 14,
    opacity: 0.6,
    color: '#333',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#333',
  },
  zipCodeContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
  },
  editButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600' as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '90%' as const,
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#333',
    marginBottom: 8,
    textAlign: 'center' as const,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center' as const,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 24,
    backgroundColor: '#f9f9f9',
  },
  buttonContainer: {
    flexDirection: 'row' as const,
    gap: 12,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
};