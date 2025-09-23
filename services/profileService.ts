import { supabase } from '@/lib/supabase';

export interface Profile {
  id: string;
  email: string;
  zip_code: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateZipCodeResult {
  success: boolean;
  message: string;
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
}