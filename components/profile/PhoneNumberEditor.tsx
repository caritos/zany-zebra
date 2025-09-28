import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Profile, UpdatePhoneNumberResult } from '@/services/profileService';
import { globalStyles } from '@/assets/styles/styles';

interface PhoneNumberEditorProps {
  profile: Profile | null;
  updatePhoneNumber: (phoneNumber: string) => Promise<UpdatePhoneNumberResult>;
  loading: boolean;
}

export const PhoneNumberEditor: React.FC<PhoneNumberEditorProps> = ({
  profile,
  updatePhoneNumber,
  loading,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempPhoneNumber, setTempPhoneNumber] = useState(profile?.phone_number || '');
  const [updating, setUpdating] = useState(false);

  const handleEdit = () => {
    setTempPhoneNumber(profile?.phone_number || '');
    setIsEditing(true);
  };

  const handleCancel = () => {
    setTempPhoneNumber(profile?.phone_number || '');
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (updating) return;

    const trimmedPhoneNumber = tempPhoneNumber.trim();

    // Basic phone number validation (optional)
    if (trimmedPhoneNumber && !/^[\d\s\-\+\(\)\.]*$/.test(trimmedPhoneNumber)) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    if (trimmedPhoneNumber && trimmedPhoneNumber.length > 20) {
      Alert.alert('Error', 'Phone number must be 20 characters or less');
      return;
    }

    setUpdating(true);

    try {
      const result = await updatePhoneNumber(trimmedPhoneNumber);

      if (result.success) {
        Alert.alert('Success', 'Phone number updated successfully');
        setIsEditing(false);
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update phone number');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View style={globalStyles.infoRow}>
        <Text style={globalStyles.infoLabel}>Phone Number</Text>
        <ActivityIndicator size="small" />
      </View>
    );
  }

  return (
    <View style={globalStyles.infoRow}>
      <Text style={globalStyles.infoLabel}>Phone Number</Text>

      {isEditing ? (
        <View style={globalStyles.editContainer}>
          <TextInput
            style={globalStyles.fieldInput}
            value={tempPhoneNumber}
            onChangeText={setTempPhoneNumber}
            placeholder="Enter phone number (optional)"
            autoFocus
            keyboardType="phone-pad"
            maxLength={20}
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
              disabled={updating}
            >
              {updating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={globalStyles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={globalStyles.displayContainer}>
          <Text style={globalStyles.infoValue}>
            {profile?.phone_number || 'Not set'}
          </Text>
          <TouchableOpacity
            style={globalStyles.editButton}
            onPress={handleEdit}
          >
            <Text style={globalStyles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};