import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      setStatus('error');
      setMessage('Invalid verification link');
      return;
    }

    verifyEmail(token, email);
  }, [searchParams]);

  const verifyEmail = async (token: string, email: string) => {
    try {
      const response = await fetch('/.netlify/functions/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email })
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message || 'Email verified successfully!');
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/user/login');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.error || 'Verification failed');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Failed to verify email. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              {status === 'loading' && (
                <>
                  <Loader2 className="w-16 h-16 text-primary mx-auto mb-4 animate-spin" />
                  <CardTitle className="text-2xl">Verifying Email</CardTitle>
                  <CardDescription>
                    Please wait while we verify your email address...
                  </CardDescription>
                </>
              )}

              {status === 'success' && (
                <>
                  <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <CardTitle className="text-2xl">Email Verified!</CardTitle>
                  <CardDescription>
                    {message}
                  </CardDescription>
                </>
              )}

              {status === 'error' && (
                <>
                  <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <CardTitle className="text-2xl">Verification Failed</CardTitle>
                  <CardDescription className="text-red-600">
                    {message}
                  </CardDescription>
                </>
              )}
            </CardHeader>

            <CardContent className="text-center space-y-4">
              {status === 'success' && (
                <p className="text-sm text-muted-foreground">
                  Redirecting to login page...
                </p>
              )}

              {status === 'error' && (
                <Link to="/user/login">
                  <Button variant="hero" className="w-full">
                    Go to Login
                  </Button>
                </Link>
              )}

              {status === 'success' && (
                <Link to="/user/login">
                  <Button variant="outline" className="w-full">
                    Continue to Login
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
