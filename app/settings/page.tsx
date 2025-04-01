'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/utils/supabase-hooks';
import { supabase } from '@/utils/supabase';
import { useAuthGuard } from '@/hooks/useAuthGuard';

export default function Settings() {
  const { user } = useAuth();
  const router = useRouter();
  const { fetchProfile, updateProfile } = useProfile();
  const { isLoading: isAuthChecking } = useAuthGuard();

  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [settings, setSettings] = useState({
    username: '',
    fullName: '',
    avatarUrl: '',
    theme: 'system',
    showCompletedGames: true,
    defaultView: 'grid',
    defaultSort: 'title-asc',
    exportData: false,
    receiveNotifications: true,
    showReleaseNotifications: true,
    showProgressReminders: false,
    progressReminderDays: 7,
  });

  // Fetch user profile settings
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        router.push('/login');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { data, error } = await fetchProfile();

        if (error) {
          throw error;
        }

        if (data) {
          setSettings({
            username: data.username || '',
            fullName: data.full_name || '',
            avatarUrl: data.avatar_url || '',
            theme: data.theme_preference || 'system',
            showCompletedGames: data.show_completed_games === false ? false : true,
            defaultView: data.default_view || 'grid',
            defaultSort: data.default_sort || 'title-asc',
            exportData: false,
            receiveNotifications: true,
            showReleaseNotifications: true,
            showProgressReminders: false,
            progressReminderDays: 7,
          });
        }
      } catch (error: any) {
        console.error('Error loading profile:', error);
        setError(error.message || 'Failed to load profile settings');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, router, fetchProfile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
  };
  
  const handleSave = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setSaveLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Update profile in Supabase
      const { error } = await updateProfile({
        username: settings.username,
        full_name: settings.fullName,
        avatar_url: settings.avatarUrl,
        theme_preference: settings.theme as 'light' | 'dark' | 'system',
        show_completed_games: settings.showCompletedGames,
        default_view: settings.defaultView as 'grid' | 'list',
        default_sort: settings.defaultSort
      });

      if (error) {
        throw error;
      }

      setSuccessMessage('Settings saved successfully!');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error: any) {
      console.error('Error saving settings:', error);
      setError(error.message || 'Failed to save settings');
    } finally {
      setSaveLoading(false);
    }
  };
  
  const handleResetSettings = () => {
    if (confirm('Are you sure you want to reset all settings to default values?')) {
      setSettings({
        username: user?.email?.split('@')[0] || '',
        fullName: '',
        avatarUrl: '',
        theme: 'system',
        showCompletedGames: true,
        defaultView: 'grid',
        defaultSort: 'title-asc',
        exportData: false,
        receiveNotifications: true,
        showReleaseNotifications: true,
        showProgressReminders: false,
        progressReminderDays: 7,
      });
    }
  };

  // Loading state for both auth check and profile data loading
  if (isAuthChecking || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="mt-4">Loading your settings...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}
      
      {/* Success message */}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6" role="alert">
          <p>{successMessage}</p>
        </div>
      )}
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="space-y-6">
          {/* Profile Settings */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Profile</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium mb-1">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={settings.username}
                  onChange={handleInputChange}
                  className="w-full max-w-md rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={settings.fullName}
                  onChange={handleInputChange}
                  className="w-full max-w-md rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div>
                <label htmlFor="avatarUrl" className="block text-sm font-medium mb-1">Avatar URL</label>
                <input
                  type="text"
                  id="avatarUrl"
                  name="avatarUrl"
                  value={settings.avatarUrl}
                  onChange={handleInputChange}
                  className="w-full max-w-md rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                {settings.avatarUrl && (
                  <div className="mt-2">
                    <img 
                      src={settings.avatarUrl} 
                      alt="Avatar Preview" 
                      className="h-16 w-16 rounded-full object-cover" 
                      onError={(e) => (e.target as HTMLImageElement).src = 'https://placehold.co/100x100/gray/white?text=User'}
                    />
                  </div>
                )}
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  id="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full max-w-md rounded-md border-gray-300 bg-gray-100 shadow-sm dark:bg-gray-600 dark:border-gray-700 dark:text-gray-300"
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Email cannot be changed
                </p>
              </div>
            </div>
          </section>
          
          {/* Appearance */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Appearance</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="theme" className="block text-sm font-medium mb-1">Theme</label>
                <select
                  id="theme"
                  name="theme"
                  value={settings.theme}
                  onChange={handleInputChange}
                  className="w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System Default</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showCompletedGames"
                  name="showCompletedGames"
                  checked={settings.showCompletedGames}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600"
                />
                <label htmlFor="showCompletedGames" className="ml-2 text-sm">
                  Show completed games in main library view
                </label>
              </div>
              
              <div>
                <label htmlFor="defaultView" className="block text-sm font-medium mb-1">Default Library View</label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="defaultView"
                      value="grid"
                      checked={settings.defaultView === 'grid'}
                      onChange={handleInputChange}
                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600"
                    />
                    <span className="ml-2">Grid</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="defaultView"
                      value="list"
                      checked={settings.defaultView === 'list'}
                      onChange={handleInputChange}
                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600"
                    />
                    <span className="ml-2">List</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label htmlFor="defaultSort" className="block text-sm font-medium mb-1">Default Sort</label>
                <select
                  id="defaultSort"
                  name="defaultSort"
                  value={settings.defaultSort}
                  onChange={handleInputChange}
                  className="w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="title-asc">Title (A-Z)</option>
                  <option value="title-desc">Title (Z-A)</option>
                  <option value="releaseDate-desc">Release Date (Newest)</option>
                  <option value="releaseDate-asc">Release Date (Oldest)</option>
                  <option value="addedDate-desc">Date Added (Newest)</option>
                  <option value="addedDate-asc">Date Added (Oldest)</option>
                  <option value="rating-desc">Rating (Highest)</option>
                  <option value="rating-asc">Rating (Lowest)</option>
                </select>
              </div>
            </div>
          </section>
          
          {/* API & Data Management */}
          <section>
            <h2 className="text-xl font-semibold mb-4">API & Data Management</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="apiKey" className="block text-sm font-medium mb-1">IGDB API Key</label>
                <input
                  type="password"
                  id="apiKey"
                  name="apiKey"
                  value={process.env.NEXT_PUBLIC_IGDB_CLIENT_ID || '*****'}
                  disabled
                  className="w-full max-w-md rounded-md border-gray-300 bg-gray-100 shadow-sm dark:bg-gray-600 dark:border-gray-700 dark:text-gray-300"
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  API key is set in the application environment variables
                </p>
              </div>
              
              <div>
                <button
                  type="button"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors mr-2"
                  onClick={() => alert('Import functionality not implemented yet')}
                >
                  Import Data
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                  onClick={() => alert('Export functionality not implemented yet')}
                >
                  Export Data
                </button>
              </div>
              
              <div className="pt-4">
                <button
                  type="button"
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  onClick={() => {
                    if (confirm('Are you sure? This will delete ALL your game data and cannot be undone.')) {
                      alert('Delete functionality not implemented yet');
                    }
                  }}
                >
                  Clear All Data
                </button>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  This will delete all your game data and cannot be undone.
                </p>
              </div>
            </div>
          </section>
          
          {/* Notifications */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Notifications</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="receiveNotifications"
                  name="receiveNotifications"
                  checked={settings.receiveNotifications}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600"
                />
                <label htmlFor="receiveNotifications" className="ml-2 text-sm">
                  Enable notifications
                </label>
              </div>
              
              {settings.receiveNotifications && (
                <>
                  <div className="flex items-center ml-6">
                    <input
                      type="checkbox"
                      id="showReleaseNotifications"
                      name="showReleaseNotifications"
                      checked={settings.showReleaseNotifications}
                      onChange={handleInputChange}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600"
                    />
                    <label htmlFor="showReleaseNotifications" className="ml-2 text-sm">
                      Show notifications for game releases
                    </label>
                  </div>
                  
                  <div className="flex items-center ml-6">
                    <input
                      type="checkbox"
                      id="showProgressReminders"
                      name="showProgressReminders"
                      checked={settings.showProgressReminders}
                      onChange={handleInputChange}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600"
                    />
                    <label htmlFor="showProgressReminders" className="ml-2 text-sm">
                      Remind me about games I haven't played in a while
                    </label>
                  </div>
                  
                  {settings.showProgressReminders && (
                    <div className="ml-6">
                      <label htmlFor="progressReminderDays" className="block text-sm font-medium mb-1">
                        Remind me after
                      </label>
                      <div className="flex items-center">
                        <input
                          type="number"
                          id="progressReminderDays"
                          name="progressReminderDays"
                          min="1"
                          value={settings.progressReminderDays}
                          onChange={handleInputChange}
                          className="w-16 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                        <span className="ml-2">days of inactivity</span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
          
          <div className="pt-6 flex justify-between">
            <button
              type="button"
              onClick={handleResetSettings}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Reset to Defaults
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saveLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-green-400"
            >
              {saveLoading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}