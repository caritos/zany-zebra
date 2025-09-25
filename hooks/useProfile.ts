import { useState, useEffect, useCallback } from 'react';
import { ProfileService, Profile, UpdateZipCodeResult, UpdateNicknameResult, UpdatePhoneNumberResult } from '@/services/profileService';

export interface UseProfileReturn {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  updateZipCode: (zipCode: string) => Promise<UpdateZipCodeResult>;
  updateNickname: (nickname: string) => Promise<UpdateNicknameResult>;
  updatePhoneNumber: (phoneNumber: string) => Promise<UpdatePhoneNumberResult>;
  refetch: () => void;
}

export const useProfile = (): UseProfileReturn => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const userProfile = await ProfileService.getProfile();
      setProfile(userProfile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateZipCode = useCallback(async (zipCode: string): Promise<UpdateZipCodeResult> => {
    setError(null);

    try {
      const result = await ProfileService.updateZipCode(zipCode);

      if (result.success) {
        // Update local profile state
        setProfile(prev => prev ? { ...prev, zip_code: zipCode } : null);
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update zip code';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  }, []);

  const updateNickname = useCallback(async (nickname: string): Promise<UpdateNicknameResult> => {
    setError(null);

    try {
      const result = await ProfileService.updateNickname(nickname);

      if (result.success) {
        // Update local profile state
        setProfile(prev => prev ? { ...prev, nickname: nickname.trim() || null } : null);
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update nickname';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  }, []);

  const updatePhoneNumber = useCallback(async (phoneNumber: string): Promise<UpdatePhoneNumberResult> => {
    setError(null);

    try {
      const result = await ProfileService.updatePhoneNumber(phoneNumber);

      if (result.success) {
        // Update local profile state
        setProfile(prev => prev ? { ...prev, phone_number: phoneNumber.trim() || null } : null);
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update phone number';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    updateZipCode,
    updateNickname,
    updatePhoneNumber,
    refetch: fetchProfile,
  };
};