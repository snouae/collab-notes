import { create } from 'zustand';
import { toast } from 'react-hot-toast';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface UserSettings {
  name?: string;
  email?: string;
  profile_picture?: string;
  theme?: string;
  language?: string;
  email_notifications?: boolean;
  browser_notifications?: boolean;
}

interface PasswordUpdate {
  current_password: string;
  new_password: string;
}

interface SettingsState {
  isLoading: boolean;
  updateProfile: (settings: UserSettings) => Promise<void>;
  updatePassword: (passwordData: PasswordUpdate) => Promise<void>;
  updatePreferences: (settings: Partial<UserSettings>) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export const useSettingsStore = create<SettingsState>((set) => ({
  isLoading: false,

  updateProfile: async (settings: UserSettings) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update profile');
      }

      const data = await response.json();
      toast.success('Profil mis à jour avec succès');
      return data;
    } catch (error: any) {
      console.error('Profile update failed:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour du profil');
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updatePassword: async (passwordData: PasswordUpdate) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/password`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(passwordData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update password');
      }

      toast.success('Mot de passe mis à jour avec succès');
    } catch (error: any) {
      console.error('Password update failed:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour du mot de passe');
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updatePreferences: async (settings: Partial<UserSettings>) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/preferences`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update preferences');
      }

      const data = await response.json();
      toast.success('Préférences mises à jour avec succès');
      return data;
    } catch (error: any) {
      console.error('Preferences update failed:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour des préférences');
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteAccount: async (password: string) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/account`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Delete account error:', errorData);
        throw new Error(errorData.detail || 'Failed to delete account');
      }

      toast.success('Compte supprimé avec succès');
      
      try {
        localStorage.clear();
      } catch (error) {
        console.error('Failed to clear localStorage:', error);
      }
      window.location.href = '/login';
    } catch (error: any) {
      console.error('Account deletion failed:', error);
      toast.error(error.message || 'Erreur lors de la suppression du compte');
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
})); 