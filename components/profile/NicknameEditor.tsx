import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Profile, UpdateNicknameResult } from '@/services/profileService';
import { globalStyles } from '@/app/styles/styles';

interface NicknameEditorProps {
  profile: Profile | null;
  updateNickname: (nickname: string) => Promise<UpdateNicknameResult>;
  loading: boolean;
}

export const NicknameEditor: React.FC<NicknameEditorProps> = ({
  profile,
  updateNickname,
  loading,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempNickname, setTempNickname] = useState(profile?.nickname || '');
  const [updating, setUpdating] = useState(false);

  const handleEdit = () => {
    setTempNickname(profile?.nickname || '');
    setIsEditing(true);
  };

  const handleCancel = () => {
    setTempNickname(profile?.nickname || '');
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (updating) return;

    const trimmedNickname = tempNickname.trim();

    // Validate nickname length
    if (trimmedNickname && trimmedNickname.length > 50) {
      Alert.alert('Error', 'Nickname must be 50 characters or less');
      return;
    }

    setUpdating(true);

    try {
      const result = await updateNickname(trimmedNickname);

      if (result.success) {
        Alert.alert('Success', 'Nickname updated successfully');
        setIsEditing(false);
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update nickname');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View style={globalStyles.infoRow}>
        <Text style={globalStyles.infoLabel}>Nickname</Text>
        <ActivityIndicator size="small" />
      </View>
    );
  }

  return (
    <View style={globalStyles.infoRow}>
      <Text style={globalStyles.infoLabel}>Nickname</Text>

      {isEditing ? (
        <View style={globalStyles.editContainer}>
          <TextInput
            style={globalStyles.fieldInput}
            value={tempNickname}
            onChangeText={setTempNickname}
            placeholder="Enter nickname (optional)"
            autoFocus
            maxLength={50}
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
            {profile?.nickname || 'Not set'}
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