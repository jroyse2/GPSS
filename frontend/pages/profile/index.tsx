import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import MainLayout from '@/components/layout/MainLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/utils/api';
import { UserCircleIcon, EnvelopeIcon, KeyIcon } from '@heroicons/react/24/outline';

interface ProfileFormData {
  username: string;
  email: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profileLoading, setProfileLoading] = useState<boolean>(false);
  const [passwordLoading, setPasswordLoading] = useState<boolean>(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Profile form
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    defaultValues: {
      username: user?.user_metadata?.username || '',
      email: user?.email || '',
    },
  });

  // Password form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    watch: watchPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>();

  const newPassword = watchPassword('newPassword');

  // Update profile
  const onProfileSubmit = async (data: ProfileFormData) => {
    try {
      setProfileLoading(true);
      setProfileSuccess(null);
      setProfileError(null);

      await apiClient.put('/users/profile', {
        username: data.username,
        email: data.email,
      });

      setProfileSuccess('Profile updated successfully');
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      setProfileError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  // Change password
  const onPasswordSubmit = async (data: PasswordFormData) => {
    try {
      setPasswordLoading(true);
      setPasswordSuccess(null);
      setPasswordError(null);

      await apiClient.put('/users/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      setPasswordSuccess('Password changed successfully');
      resetPassword();
    } catch (error: any) {
      console.error('Failed to change password:', error);
      setPasswordError(error.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <MainLayout title="Profile | Capstone Portal">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile information */}
          <div className="lg:col-span-2">
            <Card title="Profile Information">
              <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
                {/* Username */}
                <Input
                  label="Username"
                  leftIcon={<UserCircleIcon className="h-5 w-5 text-gray-400" />}
                  error={profileErrors.username?.message}
                  {...registerProfile('username', {
                    required: 'Username is required',
                    minLength: {
                      value: 3,
                      message: 'Username must be at least 3 characters',
                    },
                  })}
                />

                {/* Email */}
                <Input
                  label="Email Address"
                  type="email"
                  leftIcon={<EnvelopeIcon className="h-5 w-5 text-gray-400" />}
                  error={profileErrors.email?.message}
                  {...registerProfile('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                />

                {/* Success message */}
                {profileSuccess && (
                  <div className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 p-3 rounded-md text-sm">
                    {profileSuccess}
                  </div>
                )}

                {/* Error message */}
                {profileError && (
                  <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 p-3 rounded-md text-sm">
                    {profileError}
                  </div>
                )}

                {/* Submit button */}
                <div>
                  <Button type="submit" isLoading={profileLoading}>
                    Update Profile
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* Account information */}
          <div>
            <Card title="Account Information">
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Role</div>
                  <div className="mt-1 text-sm text-gray-900 dark:text-white capitalize">
                    {user?.user_metadata?.role || 'user'}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Account ID
                  </div>
                  <div className="mt-1 text-sm text-gray-900 dark:text-white">
                    {user?.id || 'N/A'}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Change password */}
          <div className="lg:col-span-2">
            <Card title="Change Password">
              <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6">
                {/* Current password */}
                <Input
                  label="Current Password"
                  type="password"
                  leftIcon={<KeyIcon className="h-5 w-5 text-gray-400" />}
                  error={passwordErrors.currentPassword?.message}
                  {...registerPassword('currentPassword', {
                    required: 'Current password is required',
                  })}
                />

                {/* New password */}
                <Input
                  label="New Password"
                  type="password"
                  leftIcon={<KeyIcon className="h-5 w-5 text-gray-400" />}
                  error={passwordErrors.newPassword?.message}
                  {...registerPassword('newPassword', {
                    required: 'New password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                      message:
                        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
                    },
                  })}
                />

                {/* Confirm password */}
                <Input
                  label="Confirm New Password"
                  type="password"
                  leftIcon={<KeyIcon className="h-5 w-5 text-gray-400" />}
                  error={passwordErrors.confirmPassword?.message}
                  {...registerPassword('confirmPassword', {
                    required: 'Please confirm your new password',
                    validate: (value) => value === newPassword || 'Passwords do not match',
                  })}
                />

                {/* Success message */}
                {passwordSuccess && (
                  <div className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 p-3 rounded-md text-sm">
                    {passwordSuccess}
                  </div>
                )}

                {/* Error message */}
                {passwordError && (
                  <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 p-3 rounded-md text-sm">
                    {passwordError}
                  </div>
                )}

                {/* Submit button */}
                <div>
                  <Button type="submit" isLoading={passwordLoading}>
                    Change Password
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;