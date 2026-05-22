"use client";

// @memorylane/web - Settings Page
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/stores/auth-store';

export default function SettingsPage() {
  const { user } = useAuth();
  const refreshProfile = useAuthStore((s) => s.refreshProfile);
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      const result = await authApi.updateProfile({ full_name: fullName });
      if (result.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully' });
        refreshProfile();
      } else {
        setMessage({ type: 'error', text: 'Failed to update profile' });
      }
    } catch {
      setMessage({ type: 'error', text: 'An error occurred' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    const { logout } = useAuthStore.getState();
    await logout();
    window.location.href = '/login';
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-primary-800">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account settings</p>
      </div>

      {/* Profile */}
      <Card padding="md" className="mb-6">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <Input
            label="Email"
            value={user?.email || ''}
            disabled
          />
          {message && (
            <div className={`p-3 rounded-xl text-sm ${
              message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {message.text}
            </div>
          )}
          <Button onClick={handleSave} isLoading={isSaving}>
            Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card padding="md" className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="danger" onClick={handleLogout}>
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
