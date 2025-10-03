import { supabase } from '@/lib/supabase';

export interface Profile {
  id: string;
  email: string;
  display_name: string;
  username: string;
  nickname: string | null;
  phone_number: string | null;
  zip_code: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateZipCodeResult {
  success: boolean;
  message: string;
}

export interface UpdateNicknameResult {
  success: boolean;
  message: string;
}

export interface UpdatePhoneNumberResult {
  success: boolean;
  message: string;
}

export interface DeleteAccountResult {
  success: boolean;
  message: string;
  details?: {
    matches_deleted: number;
    club_memberships_deleted: number;
    ratings_deleted: number;
  };
}

export class ProfileService {
  // Get user's profile
  static async getProfile(): Promise<Profile | null> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Profile not found
      }
      throw new Error(`Failed to fetch profile: ${error.message}`);
    }

    return data;
  }

  // Update user's zip code
  static async updateZipCode(zipCode: string): Promise<UpdateZipCodeResult> {
    const { data, error } = await supabase.rpc('update_user_zip_code', {
      new_zip_code: zipCode || null,
    });

    if (error) {
      throw new Error(`Failed to update zip code: ${error.message}`);
    }

    return data?.[0] || { success: false, message: 'Unknown error' };
  }

  // Update user's nickname
  static async updateNickname(nickname: string): Promise<UpdateNicknameResult> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({
        nickname: nickname.trim() || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update nickname: ${error.message}`);
    }

    return { success: true, message: 'Nickname updated successfully' };
  }

  // Update user's phone number
  static async updatePhoneNumber(phoneNumber: string): Promise<UpdatePhoneNumberResult> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({
        phone_number: phoneNumber.trim() || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update phone number: ${error.message}`);
    }

    return { success: true, message: 'Phone number updated successfully' };
  }

  // Get user's zip code only
  static async getZipCode(): Promise<string | null> {
    const { data, error } = await supabase.rpc('get_user_zip_code');

    if (error) {
      throw new Error(`Failed to get zip code: ${error.message}`);
    }

    return data;
  }

  // Create or update profile
  static async upsertProfile(profileData: Partial<Profile>): Promise<Profile> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        ...profileData,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id',
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update profile: ${error.message}`);
    }

    return data;
  }

  // Delete user account and all associated data
  static async deleteAccount(): Promise<DeleteAccountResult> {
    try {
      // Get the current session to include auth token
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('No active session');
      }

      // Call the Edge Function to delete the account
      // This uses the service role key server-side to properly delete auth.users
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/delete-account`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete account');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to delete account');
    }
  }
}