// Profile Settings Page
// Allows users to update their profile information

import { useState, useEffect } from 'react';
import { User, Mail, Phone, Building2, Save, Loader2, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ClientLayout from '../components/client/ClientLayout';
import { getCurrentUser, setCurrentUser } from '../lib/client-auth';
import { toast } from 'sonner';

export default function ProfileSettings() {
  const user = getCurrentUser();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    avatarUrl: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.full_name || '',
        email: user.email || '',
        phone: user.phone || '',
        company: user.company || '',
        avatarUrl: user.avatar_url || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/.netlify/functions/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          fullName: formData.fullName,
          phone: formData.phone,
          company: formData.company,
          avatarUrl: formData.avatarUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      // Update local storage
      const updatedUser = {
        ...user,
        full_name: formData.fullName,
        phone: formData.phone,
        company: formData.company,
        avatar_url: formData.avatarUrl,
      };
      setCurrentUser(updatedUser);

      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Update profile error:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <ClientLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <User className="h-8 w-8 text-primary" />
            Profile Settings
          </h1>
          <p className="text-neutral-400 mt-1">Manage your personal information</p>
        </div>

        {/* Avatar Section */}
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-white">Profile Picture</CardTitle>
            <CardDescription className="text-neutral-400">
              Your profile picture helps team members recognize you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={formData.avatarUrl} alt={formData.fullName} />
                <AvatarFallback className="bg-neutral-700 text-neutral-300 text-2xl">
                  {getInitials(formData.fullName || 'U')}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <Input
                  id="avatarUrl"
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  value={formData.avatarUrl}
                  onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                  className="bg-neutral-800 border-neutral-700 text-white w-80"
                />
                <p className="text-xs text-neutral-500">Enter a URL to your profile picture</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Information */}
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-white">Personal Information</CardTitle>
            <CardDescription className="text-neutral-400">
              Update your personal details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-neutral-300 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="bg-neutral-800 border-neutral-700 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-neutral-300 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    disabled
                    className="bg-neutral-800 border-neutral-700 text-neutral-400 cursor-not-allowed"
                  />
                  <p className="text-xs text-neutral-500">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-neutral-300 flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="bg-neutral-800 border-neutral-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company" className="text-neutral-300 flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Company
                  </Label>
                  <Input
                    id="company"
                    type="text"
                    placeholder="Your company name"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="bg-neutral-800 border-neutral-700 text-white"
                  />
                </div>
              </div>

              <Button type="submit" disabled={loading} className="mt-4">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-white">Account Information</CardTitle>
            <CardDescription className="text-neutral-400">
              Your account details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-neutral-800">
                <span className="text-neutral-400">User ID</span>
                <span className="text-neutral-300 font-mono">{user?.id?.slice(0, 8)}...</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-neutral-800">
                <span className="text-neutral-400">Account Created</span>
                <span className="text-neutral-300">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-neutral-400">Email Verified</span>
                <span className="text-green-400">Verified</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ClientLayout>
  );
}
