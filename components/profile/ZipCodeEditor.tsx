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
import { globalStyles } from '@/app/styles/styles';

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
    } catch {
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
      <View style={globalStyles.infoRow}>
        <Text style={globalStyles.infoLabel}>Zip Code</Text>
        <View style={globalStyles.zipCodeContainer}>
          <Text style={globalStyles.infoValue}>
            {profile?.zip_code || 'Not set'}
          </Text>
          <TouchableOpacity
            style={globalStyles.editButton}
            onPress={() => setIsEditing(true)}
            disabled={loading}
          >
            <Text style={globalStyles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={isEditing}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCancel}
      >
        <View style={globalStyles.modalOverlay}>
          <View style={globalStyles.modalContent}>
            <Text style={globalStyles.modalTitle}>Update Zip Code</Text>
            <Text style={globalStyles.modalSubtitle}>
              This helps us find tennis clubs near you
            </Text>

            <TextInput
              style={globalStyles.fieldInput}
              value={zipCodeValue}
              onChangeText={setZipCodeValue}
              placeholder="Enter your zip code"
              keyboardType="numeric"
              maxLength={10}
              autoFocus
            />

            <View style={globalStyles.buttonContainer}>
              <TouchableOpacity
                style={[globalStyles.button, globalStyles.cancelButton]}
                onPress={handleCancel}
                disabled={updating}
              >
                <Text style={globalStyles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[globalStyles.button, globalStyles.saveButton]}
                onPress={handleSave}
                disabled={updating || !zipCodeValue.trim()}
              >
                {updating ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={globalStyles.saveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};