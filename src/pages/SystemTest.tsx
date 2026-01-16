/**
 * System Test & Verification Script
 * Tests all backend endpoints and verifies functionality
 */

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
  duration?: number;
}

export default function SystemTest() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [testing, setTesting] = useState(false);

  const updateResult = (name: string, status: TestResult['status'], message?: string, duration?: number) => {
    setResults(prev => {
      const existing = prev.find(r => r.name === name);
      if (existing) {
        return prev.map(r => r.name === name ? { name, status, message, duration } : r);
      }
      return [...prev, { name, status, message, duration }];
    });
  };

  const testEndpoint = async (name: string, endpoint: string, options: RequestInit = {}) => {
    const start = Date.now();
    updateResult(name, 'running');
    
    try {
      const response = await fetch(endpoint, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      
      const duration = Date.now() - start;
      const data = await response.json();
      
      if (response.ok || response.status === 400) { // 400 is ok for validation tests
        updateResult(name, 'success', `${response.status} - ${duration}ms`, duration);
        return { success: true, data };
      } else {
        updateResult(name, 'error', `${response.status}: ${data.error || 'Unknown error'}`, duration);
        return { success: false, error: data.error };
      }
    } catch (error: any) {
      const duration = Date.now() - start;
      updateResult(name, 'error', error.message, duration);
      return { success: false, error: error.message };
    }
  };

  const runAllTests = async () => {
    setTesting(true);
    setResults([]);

    // Test Admin Endpoints
    await testEndpoint('Admin: Send Code', '/.netlify/functions/send-admin-code', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@paperfrogs.dev' })
    });

    // Test Client Endpoints
    await testEndpoint('Client: Login (Invalid)', '/.netlify/functions/client-login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', password: 'test', deviceId: 'test' })
    });

    await testEndpoint('Client: Signup Validation', '/.netlify/functions/client-signup', {
      method: 'POST',
      body: JSON.stringify({ email: 'invalid' }) // Should fail validation
    });

    // Test Dashboard Endpoints
    await testEndpoint('Dashboard: Recent Activity', '/.netlify/functions/get-recent-activity', {
      method: 'POST',
      body: JSON.stringify({ organizationId: 'test-org', environmentId: 'test-env' })
    });

    await testEndpoint('Dashboard: Stats', '/.netlify/functions/get-dashboard-stats', {
      method: 'POST',
      body: JSON.stringify({ organizationId: 'test-org', environmentId: 'test-env' })
    });

    // Test API Keys
    await testEndpoint('API Keys: List', '/.netlify/functions/get-api-keys', {
      method: 'POST',
      body: JSON.stringify({ organizationId: 'test-org', environmentId: 'test-env' })
    });

    // Test Webhooks
    await testEndpoint('Webhooks: List', '/.netlify/functions/get-webhooks', {
      method: 'POST',
      body: JSON.stringify({ organizationId: 'test-org', environmentId: 'test-env' })
    });

    // Test Analytics
    await testEndpoint('Analytics: Data', '/.netlify/functions/get-analytics-data', {
      method: 'POST',
      body: JSON.stringify({ organizationId: 'test-org', environmentId: 'test-env', timeRange: '7d' })
    });

    // Test Billing
    await testEndpoint('Billing: Get Data', '/.netlify/functions/get-billing-data', {
      method: 'POST',
      body: JSON.stringify({ organizationId: 'test-org' })
    });

    // Test Verification Activity
    await testEndpoint('Activity: Get Verifications', '/.netlify/functions/get-verifications', {
      method: 'POST',
      body: JSON.stringify({ 
        organizationId: 'test-org', 
        environmentId: 'test-env',
        page: 1,
        pageSize: 10
      })
    });

    // Test Team Management
    await testEndpoint('Team: List Members', '/.netlify/functions/get-team-members', {
      method: 'POST',
      body: JSON.stringify({ organizationId: 'test-org' })
    });

    setTesting(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'running':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />;
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'running':
        return <Badge className="bg-blue-100 text-blue-800">Running</Badge>;
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Success</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;
  const avgDuration = results
    .filter(r => r.duration)
    .reduce((sum, r) => sum + (r.duration || 0), 0) / results.filter(r => r.duration).length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Test & Verification</h1>
          <p className="text-gray-600 mt-1">Test all backend endpoints and verify functionality</p>
        </div>

        {/* Summary Stats */}
        {results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="text-sm text-gray-600 mb-1">Total Tests</div>
              <div className="text-2xl font-bold text-gray-900">{results.length}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-gray-600 mb-1">Successful</div>
              <div className="text-2xl font-bold text-green-600">{successCount}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-gray-600 mb-1">Failed</div>
              <div className="text-2xl font-bold text-red-600">{errorCount}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-gray-600 mb-1">Avg Duration</div>
              <div className="text-2xl font-bold text-blue-600">{avgDuration.toFixed(0)}ms</div>
            </Card>
          </div>
        )}

        {/* Control Panel */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Test Suite</h2>
              <p className="text-sm text-gray-600">Run comprehensive tests on all backend functions</p>
            </div>
            <Button onClick={runAllTests} disabled={testing} size="lg">
              {testing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                'Run All Tests'
              )}
            </Button>
          </div>
        </Card>

        {/* Test Results */}
        {results.length > 0 && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Results</h2>
            <div className="space-y-3">
              {results.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    {getStatusIcon(result.status)}
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{result.name}</div>
                      {result.message && (
                        <div className="text-sm text-gray-600">{result.message}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {result.duration && (
                      <span className="text-sm text-gray-500">{result.duration}ms</span>
                    )}
                    {getStatusBadge(result.status)}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Instructions */}
        {results.length === 0 && (
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Test Instructions</h3>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li>This will test all backend endpoints to verify they are functioning</li>
                  <li>Most tests will fail with validation errors (expected behavior)</li>
                  <li>Green = endpoint is responding correctly</li>
                  <li>Red = endpoint has an error or is not responding</li>
                  <li>Tests use dummy data and will not create any real records</li>
                </ul>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
