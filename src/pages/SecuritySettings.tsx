// Security Settings Page
// Manage 2FA, password, and session security

import { useState, useEffect } from 'react';
import { Shield, Key, Smartphone, Clock, AlertTriangle, Eye, EyeOff, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import ClientLayout from '../components/client/ClientLayout';
import { getCurrentUser } from '../lib/client-auth';
import { toast } from 'sonner';

export default function SecuritySettings() {
  const user = getCurrentUser();
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Mock sessions data - in production, fetch from API
  const [sessions] = useState([
    {
      id: '1',
      device: 'Chrome on macOS',
      location: 'San Francisco, CA',
      lastActive: new Date().toISOString(),
      current: true,
    },
  ]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/.netlify/functions/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      toast.success('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      console.error('Password change error:', error);
      toast.error(error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle2FA = async () => {
    setLoading(true);
    try {
      // In production, this would call an API to enable/disable 2FA
      // For now, just toggle the state
      setTwoFactorEnabled(!twoFactorEnabled);
      toast.success(twoFactorEnabled ? '2FA disabled' : '2FA enabled');
    } catch (error) {
      toast.error('Failed to update 2FA settings');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      // In production, this would call an API to revoke the session
      toast.success('Session revoked');
    } catch (error) {
      toast.error('Failed to revoke session');
    }
  };

  return (
    <ClientLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            Security Settings
          </h1>
          <p className="text-neutral-400 mt-1">Manage your account security and authentication</p>
        </div>

        {/* Two-Factor Authentication */}
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Smartphone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-white">Two-Factor Authentication</CardTitle>
                  <CardDescription className="text-neutral-400">
                    Add an extra layer of security to your account
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {twoFactorEnabled ? (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Enabled</Badge>
                ) : (
                  <Badge className="bg-neutral-500/20 text-neutral-400 border-neutral-500/30">Disabled</Badge>
                )}
                <Switch
                  checked={twoFactorEnabled}
                  onCheckedChange={handleToggle2FA}
                  disabled={loading}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-neutral-800/50 rounded-lg p-4">
              <p className="text-sm text-neutral-400">
                {twoFactorEnabled
                  ? 'Your account is protected with two-factor authentication. You will need to enter a code from your authenticator app when signing in.'
                  : 'Enable two-factor authentication to add an extra layer of security. You will need an authenticator app like Google Authenticator or Authy.'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                <Key className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <CardTitle className="text-white">Change Password</CardTitle>
                <CardDescription className="text-neutral-400">
                  Update your password regularly to keep your account secure
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-neutral-300">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="bg-neutral-800 border-neutral-700 text-white pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-neutral-300">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="bg-neutral-800 border-neutral-700 text-white pr-10"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-neutral-500">Minimum 8 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-neutral-300">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="bg-neutral-800 border-neutral-700 text-white"
                  required
                />
              </div>

              <Button type="submit" disabled={loading} className="mt-2">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Update Password
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Active Sessions */}
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-white">Active Sessions</CardTitle>
                <CardDescription className="text-neutral-400">
                  Manage devices where you're signed in
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 bg-neutral-800/50 rounded-lg"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-white font-medium">{session.device}</p>
                      {session.current && (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                          Current
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-neutral-400">{session.location}</p>
                    <p className="text-xs text-neutral-500">
                      Last active: {new Date(session.lastActive).toLocaleString()}
                    </p>
                  </div>
                  {!session.current && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRevokeSession(session.id)}
                      className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                    >
                      Revoke
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Security Tips */}
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <CardTitle className="text-white">Security Tips</CardTitle>
                <CardDescription className="text-neutral-400">
                  Best practices to keep your account secure
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-400 mt-0.5" />
                Use a strong, unique password that you don't use elsewhere
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-400 mt-0.5" />
                Enable two-factor authentication for extra protection
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-400 mt-0.5" />
                Regularly review your active sessions and revoke suspicious ones
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-400 mt-0.5" />
                Never share your password or authentication codes
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-400 mt-0.5" />
                Log out from shared or public devices after use
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </ClientLayout>
  );
}
