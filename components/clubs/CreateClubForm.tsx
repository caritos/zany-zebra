import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useCreateClub, useGeocodingZip } from '@/hooks/useClubs';
import { CreateClubRequest } from '@/types/clubs';

interface CreateClubFormProps {
  onSuccess?: (clubId: number) => void;
  onCancel?: () => void;
}

export const CreateClubForm: React.FC<CreateClubFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    zipCode: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { createClub, loading: createLoading, error: createError } = useCreateClub();
  const { geocodeZip, loading: geocodeLoading } = useGeocodingZip();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Club name is required';
    }

    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'Zip code is required';
    } else if (!/^\d{5}(-\d{4})?$/.test(formData.zipCode.trim())) {
      newErrors.zipCode = 'Please enter a valid zip code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      // First geocode the zip code
      const geoData = await geocodeZip(formData.zipCode.trim());

      // Create the club request
      const clubRequest: CreateClubRequest = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        zip_code: formData.zipCode.trim(),
        city: geoData.city,
        state: geoData.state,
        latitude: geoData.latitude,
        longitude: geoData.longitude,
      };

      const result = await createClub(clubRequest);

      if (result.success && result.club_id) {
        Alert.alert('Success', 'Club created successfully!', [
          {
            text: 'OK',
            onPress: () => onSuccess?.(result.club_id!),
          },
        ]);
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to create club'
      );
    }
  };

  const isLoading = createLoading || geocodeLoading;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <Text style={styles.title}>Create New Tennis Club</Text>
          <Text style={styles.subtitle}>
            Start a tennis community in your area
          </Text>

          {/* Club Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Club Name *</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              value={formData.name}
              onChangeText={(text) => {
                setFormData({ ...formData, name: text });
                if (errors.name) {
                  setErrors({ ...errors, name: '' });
                }
              }}
              placeholder="e.g., Central Park Tennis Club"
              maxLength={100}
              autoCapitalize="words"
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              placeholder="Tell players about your club..."
              multiline
              numberOfLines={3}
              maxLength={500}
              textAlignVertical="top"
            />
          </View>

          {/* Zip Code */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Zip Code *</Text>
            <TextInput
              style={[styles.input, errors.zipCode && styles.inputError]}
              value={formData.zipCode}
              onChangeText={(text) => {
                setFormData({ ...formData, zipCode: text });
                if (errors.zipCode) {
                  setErrors({ ...errors, zipCode: '' });
                }
              }}
              placeholder="12345"
              keyboardType="numeric"
              maxLength={10}
            />
            {errors.zipCode && (
              <Text style={styles.errorText}>{errors.zipCode}</Text>
            )}
            <Text style={styles.helpText}>
              We&apos;ll use this to set your club&apos;s location and find nearby players.
              Multiple clubs can exist in the same zip code.
            </Text>
          </View>

          {/* Error Message */}
          {createError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{createError}</Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={onCancel}
              disabled={isLoading}
            >
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>Create Club</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  form: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center' as const,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center' as const,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#dc3545',
  },
  textArea: {
    height: 80,
    paddingTop: 16,
  },
  errorText: {
    color: '#dc3545',
    fontSize: 14,
    marginTop: 6,
  },
  helpText: {
    color: '#666',
    fontSize: 14,
    marginTop: 6,
  },
  errorContainer: {
    backgroundColor: '#ffeaea',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row' as const,
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  secondaryButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600' as const,
  },
};