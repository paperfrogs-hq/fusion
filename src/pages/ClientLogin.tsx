import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Building2 } from 'lucide-react';

export default function ClientLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [show2FA, setShow2FA] = useState(false);
  const [tempSessionData, setTempSessionData] = useState<any>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberDevice: false,
    totpCode: ''
  });

  const handleChange = (field: string, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const deviceId = localStorage.getItem('fusion_device_id') || 
        crypto.randomUUID();
      localStorage.setItem('fusion_device_id', deviceId);

      const response = await fetch('/.netlify/functions/client-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          rememberDevice: formData.rememberDevice,
          deviceId,
          totpCode: show2FA ? formData.totpCode : undefined
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.requires2FA) {
          // 2FA is enabled, show 2FA input
          setShow2FA(true);
          setTempSessionData(data);
          setError('');
        } else {
          throw new Error(data.error || 'Login failed');
        }
        setLoading(false);
        return;
      }

      // Store session
      localStorage.setItem('fusion_client_token', data.sessionToken);
      localStorage.setItem('fusion_client_user', JSON.stringify(data.user));
      localStorage.setItem('fusion_client_orgs', JSON.stringify(data.organizations));

      // If user belongs to multiple orgs, show org selector
      if (data.organizations.length > 1) {
        navigate('/client/select-org');
      } else if (data.organizations.length === 1) {
        localStorage.setItem('fusion_current_org', JSON.stringify(data.organizations[0]));
        navigate('/client/dashboard');
      } else {
        throw new Error('No organization access');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/Fusion_Icon-No-BG-01.png" 
              alt="Fusion Logo" 
              className="w-20 h-20 object-contain"
            />
          </div>
          <CardTitle className="text-3xl font-bold">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to your Fusion account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {show2FA && (
              <Alert>
                <AlertDescription>
                  Two-factor authentication is enabled. Please enter your 6-digit code.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                disabled={show2FA}
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="you@company.com"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link 
                  to="/client/forgot-password" 
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                required
                disabled={show2FA}
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="Enter your password"
              />
            </div>

            {show2FA && (
              <div className="space-y-2">
                <Label htmlFor="totpCode">2FA Code</Label>
                <Input
                  id="totpCode"
                  type="text"
                  required
                  maxLength={6}
                  pattern="[0-9]{6}"
                  value={formData.totpCode}
                  onChange={(e) => handleChange('totpCode', e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="text-center text-2xl tracking-widest"
                  autoFocus
                />
              </div>
            )}

            {!show2FA && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberDevice"
                  checked={formData.rememberDevice}
                  onCheckedChange={(checked) => handleChange('rememberDevice', checked as boolean)}
                />
                <label
                  htmlFor="rememberDevice"
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Remember this device for 30 days
                </label>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {show2FA ? 'Verifying...' : 'Signing In...'}
                </>
              ) : (
                show2FA ? 'Verify & Sign In' : 'Sign In'
              )}
            </Button>

            {show2FA && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setShow2FA(false);
                  setFormData({ ...formData, totpCode: '' });
                }}
              >
                Back to Login
              </Button>
            )}

            <div className="text-center text-sm">
              Don't have an account?{' '}
              <Link to="/client/signup" className="text-primary hover:underline font-medium">
                Create one
              </Link>
            </div>

            <div className="text-center">
              <Link 
                to="/admin/login" 
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Admin Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
