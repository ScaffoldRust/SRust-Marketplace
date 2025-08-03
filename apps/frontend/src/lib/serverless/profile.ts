import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/lib/types/database.types'

export type UserProfile = Database['public']['Tables']['profiles']['Row']
export type UserType = 'buyer' | 'seller' | 'both'

export const profile = {

  async getCurrentProfile(): Promise<UserProfile | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return null;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getCurrentProfile:', error);
      return null;
    }
  },

  /**
   * Get a profile by user ID
   */
  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getProfile:', error);
      return null;
    }
  },

  async createProfile(userId: string, userType: UserType, displayName?: string, email?: string): Promise<UserProfile> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          user_type: userType,
          display_name: displayName || null,
          email: email || null,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  async updateProfile(userId: string, updates: Partial<Omit<UserProfile, 'id' | 'created_at'>>): Promise<UserProfile> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  async deleteProfile(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) {
        throw error;
      }
    } catch (error) {
      throw error;
    }
  }
}

// Export class-based version for backward compatibility
export class Profile {
  static getCurrentProfile = profile.getCurrentProfile;
  static getProfile = profile.getProfile;
  static createProfile = (userId: string, email: string, fullName?: string) => 
    profile.createProfile(userId, 'buyer', fullName, email);
}