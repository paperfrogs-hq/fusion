import { useState } from 'react';
import { Rocket, Key, Code, CheckCircle2, Copy, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';

interface QuickStartGuideProps {
  organizationId: string;
  environmentId: string;
}

export default function QuickStartGuide({ organizationId, environmentId }: QuickStartGuideProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const curlExample = `curl -X POST https://api.fusion.audio/v1/verify \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "file=@audio.mp3"`;

  const nodeExample = `const response = await fetch('https://api.fusion.audio/v1/verify', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: formData
});`;

  const pythonExample = `import requests

response = requests.post(
    'https://api.fusion.audio/v1/verify',
    headers={'Authorization': 'Bearer YOUR_API_KEY'},
    files={'file': open('audio.mp3', 'rb')}
)`;

  return (
    <Card className="border-primary/25 bg-gradient-to-br from-primary/10 via-card to-card p-6">
      <div className="flex items-start gap-4 mb-6">
        <div className="rounded-lg border border-primary/30 bg-primary/15 p-3">
          <Rocket className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="mb-2 text-xl font-bold text-foreground">Get Started with Fusion API</h3>
          <p className="text-muted-foreground">
            Follow these steps to start verifying audio authenticity in minutes
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Step 1 */}
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
              1
            </div>
          </div>
          <div className="flex-1">
            <h4 className="mb-2 flex items-center gap-2 font-semibold text-foreground">
              <Key className="h-4 w-4" />
              Create an API Key
            </h4>
            <p className="mb-3 text-sm text-muted-foreground">
              Generate your first API key to authenticate requests. Keys can have specific scopes and rate limits.
            </p>
            <Button 
              size="sm"
              onClick={() => window.location.href = '/client/api-keys'}
            >
              Create API Key
            </Button>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
              2
            </div>
          </div>
          <div className="flex-1">
            <h4 className="mb-2 flex items-center gap-2 font-semibold text-foreground">
              <Code className="h-4 w-4" />
              Make Your First Request
            </h4>
            <p className="mb-3 text-sm text-muted-foreground">
              Use your API key to verify audio files. Here are examples in different languages:
            </p>

            {/* Code Examples */}
            <div className="space-y-3">
              {/* cURL */}
              <div className="relative rounded-lg border border-border bg-secondary/60 p-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="border-border bg-secondary text-muted-foreground text-xs">
                    cURL
                  </Badge>
                  <button
                    onClick={() => handleCopy(curlExample, 'curl')}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {copied === 'curl' ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <pre className="overflow-x-auto text-xs text-primary">
                  <code>{curlExample}</code>
                </pre>
              </div>

              {/* Node.js */}
              <div className="relative rounded-lg border border-border bg-secondary/60 p-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="border-border bg-secondary text-muted-foreground text-xs">
                    Node.js
                  </Badge>
                  <button
                    onClick={() => handleCopy(nodeExample, 'node')}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {copied === 'node' ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <pre className="overflow-x-auto text-xs text-primary">
                  <code>{nodeExample}</code>
                </pre>
              </div>

              {/* Python */}
              <div className="relative rounded-lg border border-border bg-secondary/60 p-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="border-border bg-secondary text-muted-foreground text-xs">
                    Python
                  </Badge>
                  <button
                    onClick={() => handleCopy(pythonExample, 'python')}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {copied === 'python' ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <pre className="overflow-x-auto text-xs text-primary">
                  <code>{pythonExample}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
              3
            </div>
          </div>
          <div className="flex-1">
            <h4 className="mb-2 flex items-center gap-2 font-semibold text-foreground">
              <CheckCircle2 className="h-4 w-4" />
              Monitor & Analyze
            </h4>
            <p className="mb-3 text-sm text-muted-foreground">
              Track verification activity, analyze results, and configure webhooks for real-time notifications.
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = '/client/activity'}
              >
                View Activity
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = '/client/webhooks'}
              >
                Setup Webhooks
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Documentation Link */}
      <div className="mt-6 border-t border-primary/25 pt-6">
        <p className="text-sm text-muted-foreground">
          Need more help? Check out our{' '}
          <a href="/docs" className="font-medium text-primary hover:underline">
            API documentation
          </a>
          {' '}or{' '}
          <a href="/support" className="font-medium text-primary hover:underline">
            contact support
          </a>
          .
        </p>
      </div>
    </Card>
  );
}
