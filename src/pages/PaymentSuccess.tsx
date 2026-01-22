import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

export default function PaymentSuccess() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Get session ID from URL
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');

    if (!sessionId) {
      setError('No session ID found');
      setLoading(false);
      return;
    }

    // Wait a moment for webhook to process
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen glass flex items-center justify-center">
        <Card className="glass-card p-12 max-w-lg text-center">
          <Loader2 className="h-16 w-16 animate-spin text-blue-600 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Processing Payment...</h2>
          <p className="text-muted-foreground">
            Please wait while we activate your subscription
          </p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen glass flex items-center justify-center px-4">
        <Card className="glass-card p-12 max-w-lg text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-4">Something went wrong</h2>
          <p className="text-muted-foreground mb-8">{error}</p>
          <Button onClick={() => window.location.href = '/'}>
            Return Home
          </Button>
        </Card>
      </div>
    );
  }

  // Check if user or business portal
  const isUserPortal = localStorage.getItem('fusion_user_session');
  const dashboardUrl = isUserPortal ? '/user/subscription' : '/client/settings/billing';

  return (
    <div className="min-h-screen glass flex items-center justify-center px-4">
      <Card className="glass-card p-12 max-w-lg text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Welcome to Fusion!
        </h1>
        
        <p className="text-lg text-muted-foreground mb-8">
          Your subscription has been activated successfully. You now have access to all premium features.
        </p>

        <div className="space-y-4 mb-8 text-left">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">14-Day Free Trial Started</p>
              <p className="text-sm text-muted-foreground">
                You won't be charged until your trial ends
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">Full Feature Access</p>
              <p className="text-sm text-muted-foreground">
                All premium features are now unlocked
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">Cancel Anytime</p>
              <p className="text-sm text-muted-foreground">
                No commitment, cancel before trial ends with no charge
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <Button
            onClick={() => window.location.href = dashboardUrl}
            className="bg-blue-600 hover:bg-blue-700"
          >
            View Subscription
          </Button>
          <Button
            onClick={() => window.location.href = isUserPortal ? '/user/dashboard' : '/client/dashboard'}
            variant="outline"
          >
            Go to Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
}
