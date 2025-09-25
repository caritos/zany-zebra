import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Profile, UpdateNicknameResult } from '@/services/profileService';

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
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Nickname</Text>
        <ActivityIndicator size="small" />
      </View>
    );
  }

  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>Nickname</Text>

      {isEditing ? (
        <View style={styles.editContainer}>
          <TextInput
            style={styles.input}
            value={tempNickname}
            onChangeText={setTempNickname}
            placeholder="Enter nickname (optional)"
            autoFocus
            maxLength={50}
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
              disabled={updating}
            >
              {updating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.displayContainer}>
          <Text style={styles.infoValue}>
            {profile?.nickname || 'Not set'}
          </Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEdit}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
  input: {
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
});