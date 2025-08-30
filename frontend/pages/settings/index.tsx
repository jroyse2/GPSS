import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { SunIcon, MoonIcon, BellIcon, BellSlashIcon } from '@heroicons/react/24/outline';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [emailNotifications, setEmailNotifications] = useState<boolean>(true);
  const [pushNotifications, setPushNotifications] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Toggle email notifications
  const toggleEmailNotifications = () => {
    setEmailNotifications(!emailNotifications);
  };

  // Toggle push notifications
  const togglePushNotifications = () => {
    setPushNotifications(!pushNotifications);
  };

  // Save settings
  const saveSettings = async () => {
    try {
      setSaving(true);
      setSuccess(null);
      setError(null);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In a real app, this would save the settings to the backend
      // await apiClient.put('/users/settings', {
      //   darkMode,
      //   emailNotifications,
      //   pushNotifications,
      // });

      setSuccess('Settings saved successfully');
    } catch (error: any) {
      console.error('Failed to save settings:', error);
      setError(error.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainLayout title="Settings | Capstone Portal">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your application preferences
          </p>
        </div>

        {/* Appearance settings */}
        <Card title="Appearance">
          <div className="space-y-4">
            {/* Dark mode */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Dark Mode</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Toggle between light and dark theme
                </p>
              </div>
              <button
                onClick={toggleDarkMode}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  darkMode ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span className="sr-only">Toggle dark mode</span>
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    darkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
                {darkMode ? (
                  <MoonIcon className="absolute right-1 h-4 w-4 text-white" />
                ) : (
                  <SunIcon className="absolute left-1 h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>
        </Card>

        {/* Notification settings */}
        <Card title="Notifications">
          <div className="space-y-4">
            {/* Email notifications */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  Email Notifications
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Receive notifications via email
                </p>
              </div>
              <button
                onClick={toggleEmailNotifications}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  emailNotifications ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span className="sr-only">Toggle email notifications</span>
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    emailNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
                {emailNotifications ? (
                  <BellIcon className="absolute right-1 h-4 w-4 text-white" />
                ) : (
                  <BellSlashIcon className="absolute left-1 h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>

            {/* Push notifications */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  Push Notifications
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Receive notifications in the browser
                </p>
              </div>
              <button
                onClick={togglePushNotifications}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  pushNotifications ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span className="sr-only">Toggle push notifications</span>
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    pushNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
                {pushNotifications ? (
                  <BellIcon className="absolute right-1 h-4 w-4 text-white" />
                ) : (
                  <BellSlashIcon className="absolute left-1 h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>
        </Card>

        {/* Account settings */}
        <Card title="Account">
          <div className="space-y-4">
            {/* Account information */}
            <div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Username</div>
              <div className="mt-1 text-sm text-gray-900 dark:text-white">{user?.username}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</div>
              <div className="mt-1 text-sm text-gray-900 dark:text-white">{user?.email}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Role</div>
              <div className="mt-1 text-sm text-gray-900 dark:text-white capitalize">
                {user?.role}
              </div>
            </div>
          </div>
        </Card>

        {/* Save button */}
        <div className="flex justify-end">
          <Button onClick={saveSettings} isLoading={saving}>
            Save Settings
          </Button>
        </div>

        {/* Success message */}
        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 p-3 rounded-md text-sm">
            {success}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 p-3 rounded-md text-sm">
            {error}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default SettingsPage;