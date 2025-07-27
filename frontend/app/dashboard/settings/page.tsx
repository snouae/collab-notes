'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import {
  UserIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  CameraIcon,
  ShieldCheckIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/components/providers/AuthProvider';
import { useSettingsStore } from '@/store/useSettingsStore';

interface UserSettings {
  name: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { updateProfile, updatePassword, updatePreferences, deleteAccount, isLoading } = useSettingsStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isImageUploading, setIsImageUploading] = useState(false);

  const [settings, setSettings] = useState<UserSettings>({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) {
      setSettings(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
      }));
      if (user.profile_picture) {
        setProfileImage(user.profile_picture);
      }
    }
  }, [user]);

  const tabs = [
    { id: 'profile', label: 'Profil', icon: UserIcon },
    { id: 'security', label: 'Sécurité', icon: ShieldCheckIcon },
  ];

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('L\'image doit faire moins de 5MB');
      return;
    }

    setIsImageUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
        setIsImageUploading(false);
        toast.success('Image de profil mise à jour');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setIsImageUploading(false);
      toast.error('Erreur lors du téléchargement de l\'image');
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await updateProfile({
        name: settings.name,
        email: settings.email,
        profile_picture: profileImage || undefined,
      }) as any;
      
      if (result?.user && updateUser) {
        updateUser(result.user);
      }
    } catch (error) {
      // Error is already handled in the store
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (settings.newPassword !== settings.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (settings.newPassword.length < 6) {
      toast.error('Le nouveau mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      await updatePassword({
        current_password: settings.currentPassword,
        new_password: settings.newPassword,
      });
      
      setSettings(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (error) {
      // Error is already handled in the store
    }
  };

  const handleDeleteAccount = () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
      const password = prompt('Veuillez entrer votre mot de passe pour confirmer la suppression :');
      if (password) {
        deleteAccount(password);
      }
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <h1 className="heading-1 mb-2">Paramètres</h1>
          <p className="text-muted-foreground">
            Gérez votre profil, vos préférences et vos paramètres de sécurité
          </p>
        </div>

        {/* Settings Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="card sticky top-8">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-primary text-primary-foreground shadow-md'
                          : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <div className="card">
                  <h2 className="heading-3 mb-6">Informations du profil</h2>
                  
                  {/* Profile Picture */}
                  <div className="flex items-center gap-6 mb-8">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                        {profileImage ? (
                          <Image
                            src={profileImage}
                            alt="Profile"
                            width={96}
                            height={96}
                            className="w-24 h-24 rounded-full object-cover"
                          />
                        ) : (
                          getInitials(settings.name || 'U')
                        )}
                      </div>
                      <label className="absolute -bottom-2 -right-2 p-2 bg-primary text-white rounded-full cursor-pointer hover:bg-primary/90 transition-colors shadow-lg">
                        <CameraIcon className="h-4 w-4" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={isImageUploading}
                        />
                      </label>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{settings.name || 'Utilisateur'}</h3>
                      <p className="text-muted-foreground">{settings.email}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Membre depuis {user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : 'récemment'}
                      </p>
                    </div>
                  </div>

                  {/* Profile Form */}
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-2">
                          Nom complet
                        </label>
                        <input
                          type="text"
                          id="name"
                          value={settings.name}
                          onChange={(e) => setSettings(prev => ({ ...prev, name: e.target.value }))}
                          className="input-primary w-full"
                          placeholder="Votre nom complet"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-2">
                          Adresse email
                        </label>
                        <input
                          type="email"
                          id="email"
                          value={settings.email}
                          onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
                          className="input-primary w-full"
                          placeholder="votre@email.com"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <motion.button
                        type="submit"
                        disabled={isLoading}
                        className="button-primary"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Mise à jour...
                          </div>
                        ) : (
                          'Mettre à jour le profil'
                        )}
                      </motion.button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <div className="card">
                  <h2 className="heading-3 mb-6">Sécurité du compte</h2>
                  
                  <form onSubmit={handlePasswordUpdate} className="space-y-6">
                    <div>
                      <label htmlFor="currentPassword" className="block text-sm font-medium mb-2">
                        Mot de passe actuel
                      </label>
                      <div className="relative">
                        <LockClosedIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          id="currentPassword"
                          value={settings.currentPassword}
                          onChange={(e) => setSettings(prev => ({ ...prev, currentPassword: e.target.value }))}
                          className="input-primary pl-10 pr-10"
                          placeholder="Votre mot de passe actuel"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showCurrentPassword ? (
                            <EyeSlashIcon className="h-5 w-5" />
                          ) : (
                            <EyeIcon className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium mb-2">
                          Nouveau mot de passe
                        </label>
                        <div className="relative">
                          <LockClosedIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            id="newPassword"
                            value={settings.newPassword}
                            onChange={(e) => setSettings(prev => ({ ...prev, newPassword: e.target.value }))}
                            className="input-primary pl-10 pr-10"
                            placeholder="Nouveau mot de passe"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showNewPassword ? (
                              <EyeSlashIcon className="h-5 w-5" />
                            ) : (
                              <EyeIcon className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                          Confirmer le mot de passe
                        </label>
                        <div className="relative">
                          <LockClosedIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            id="confirmPassword"
                            value={settings.confirmPassword}
                            onChange={(e) => setSettings(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            className="input-primary pl-10 pr-10"
                            placeholder="Confirmer le mot de passe"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showConfirmPassword ? (
                              <EyeSlashIcon className="h-5 w-5" />
                            ) : (
                              <EyeIcon className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <motion.button
                        type="submit"
                        disabled={isLoading}
                        className="button-primary"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Mise à jour...
                          </div>
                        ) : (
                          'Changer le mot de passe'
                        )}
                      </motion.button>
                    </div>
                  </form>
                </div>

                {/* Danger Zone */}
                <div className="card border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20">
                  <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-4">
                    Zone dangereuse
                  </h3>
                  <p className="text-red-600 dark:text-red-300 mb-4">
                    Ces actions sont irréversibles. Veuillez réfléchir avant de continuer.
                  </p>
                  <button
                    onClick={handleDeleteAccount}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <TrashIcon className="h-4 w-4" />
                    Supprimer mon compte
                  </button>
                </div>
              </motion.div>
            )}


          </div>
        </div>
      </motion.div>
    </div>
  );
} 