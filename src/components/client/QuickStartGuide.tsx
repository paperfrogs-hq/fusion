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
    <Card className="p-6 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
      <div className="flex items-start gap-4 mb-6">
        <div className="p-3 bg-blue-100 rounded-lg">
          <Rocket className="h-6 w-6 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Get Started with Fusion API</h3>
          <p className="text-gray-600">
            Follow these steps to start verifying audio authenticity in minutes
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Step 1 */}
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
              1
            </div>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Key className="h-4 w-4" />
              Create an API Key
            </h4>
            <p className="text-sm text-gray-600 mb-3">
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
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
              2
            </div>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Code className="h-4 w-4" />
              Make Your First Request
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              Use your API key to verify audio files. Here are examples in different languages:
            </p>

            {/* Code Examples */}
            <div className="space-y-3">
              {/* cURL */}
              <div className="bg-gray-900 rounded-lg p-4 relative">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-xs bg-gray-800 text-gray-300 border-gray-700">
                    cURL
                  </Badge>
                  <button
                    onClick={() => handleCopy(curlExample, 'curl')}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {copied === 'curl' ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <pre className="text-xs text-green-400 overflow-x-auto">
                  <code>{curlExample}</code>
                </pre>
              </div>

              {/* Node.js */}
              <div className="bg-gray-900 rounded-lg p-4 relative">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-xs bg-gray-800 text-gray-300 border-gray-700">
                    Node.js
                  </Badge>
                  <button
                    onClick={() => handleCopy(nodeExample, 'node')}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {copied === 'node' ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <pre className="text-xs text-green-400 overflow-x-auto">
                  <code>{nodeExample}</code>
                </pre>
              </div>

              {/* Python */}
              <div className="bg-gray-900 rounded-lg p-4 relative">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-xs bg-gray-800 text-gray-300 border-gray-700">
                    Python
                  </Badge>
                  <button
                    onClick={() => handleCopy(pythonExample, 'python')}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {copied === 'python' ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <pre className="text-xs text-green-400 overflow-x-auto">
                  <code>{pythonExample}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
              3
            </div>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Monitor & Analyze
            </h4>
            <p className="text-sm text-gray-600 mb-3">
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
      <div className="mt-6 pt-6 border-t border-blue-200">
        <p className="text-sm text-gray-600">
          Need more help? Check out our{' '}
          <a href="/docs" className="text-blue-600 hover:underline font-medium">
            API documentation
          </a>
          {' '}or{' '}
          <a href="/support" className="text-blue-600 hover:underline font-medium">
            contact support
          </a>
          .
        </p>
      </div>
    </Card>
  );
}
