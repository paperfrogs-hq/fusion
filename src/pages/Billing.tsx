import { useState, useEffect } from 'react';
import { 
  CreditCard, 
  TrendingUp, 
  Download,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Receipt,
  Zap,
  ArrowUpRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import ClientLayout from '../components/client/ClientLayout';
import UpgradePlanModal from '../components/client/UpgradePlanModal';
import PaymentMethodModal from '../components/client/PaymentMethodModal';
import { getCurrentOrganization, canViewBilling, canManageBilling } from '../lib/client-auth';
import { toast } from 'sonner';

interface BillingData {
  subscription: {
    plan_type: string;
    status: string;
    current_period_start: string;
    current_period_end: string;
    is_trial: boolean;
    trial_ends_at?: string;
  };
  usage: {
    quota_used: number;
    quota_limit: number;
    overage_count: number;
  };
  invoices: Array<{
    id: string;
    amount: number;
    status: string;
    created_at: string;
    period_start: string;
    period_end: string;
    invoice_url?: string;
  }>;
  payment_method?: {
    type: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
}

export default function Billing() {
  const [data, setData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const org = getCurrentOrganization();
  const canView = canViewBilling(org);
  const canManage = canManageBilling(org);

  useEffect(() => {
    if (org && canView) {
      loadBillingData();
    }
  }, [org?.id, canView]);

  const loadBillingData = async () => {
    if (!org) return;

    try {
      const response = await fetch('/.netlify/functions/get-billing-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId: org.id }),
      });

      if (response.ok) {
        const result = await response.json();
        setData(result.billing);
      } else {
        toast.error('Failed to load billing data');
      }
    } catch (error) {
      console.error('Failed to load billing:', error);
      toast.error('Failed to load billing data');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      const response = await fetch('/.netlify/functions/download-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${invoiceId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        toast.error('Failed to download invoice');
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download invoice');
    }
  };

  const getPlanBadge = (planType: string) => {
    const badges = {
      trial: <Badge variant="outline">14-Day Trial</Badge>,
      starter: <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Starter</Badge>,
      professional: <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">Professional</Badge>,
      enterprise: <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">Enterprise</Badge>,
    };
    return badges[planType] || badges.trial;
  };

  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Active</Badge>;
    }
    if (status === 'past_due') {
      return <Badge className="bg-red-500/20 text-red-300 border-red-500/30">Past Due</Badge>;
    }
    if (status === 'canceled') {
      return <Badge variant="outline">Canceled</Badge>;
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <ClientLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </ClientLayout>
    );
  }

  if (!canView) {
    return (
      <ClientLayout>
        <div className="max-w-4xl mx-auto text-center py-12">
          <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-neutral-400">You don't have permission to view billing information.</p>
        </div>
      </ClientLayout>
    );
  }

  if (!data) return null;

  const usagePercent = (data.usage.quota_used / data.usage.quota_limit) * 100;

  return (
    <ClientLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Billing & Usage</h1>
            <p className="text-neutral-400 mt-1">
              Manage your subscription and view usage
            </p>
          </div>
          {canManage && (
            <Button onClick={() => setShowUpgradeModal(true)}>
              <ArrowUpRight className="h-4 w-4 mr-2" />
              Upgrade Plan
            </Button>
          )}
        </div>

        {/* Trial Banner */}
        {data.subscription.is_trial && data.subscription.trial_ends_at && (
          <Card className="bg-blue-500/10 border-blue-500/30 p-4">
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-blue-300 mb-1">Trial Active</h3>
                <p className="text-sm text-blue-200">
                  Your trial ends on {formatDate(data.subscription.trial_ends_at)}. 
                  Upgrade to continue using Fusion without interruption.
                </p>
              </div>
              {canManage && (
                <Button 
                  size="sm"
                  onClick={() => setShowUpgradeModal(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Upgrade Now
                </Button>
              )}
            </div>
          </Card>
        )}

        {/* Current Plan & Usage */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Plan */}
          <Card className="p-6 bg-neutral-900 border-neutral-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Current Plan</h3>
              {getPlanBadge(data.subscription.plan_type)}
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-neutral-400 mb-1">Status</p>
                {getStatusBadge(data.subscription.status)}
              </div>

              <div>
                <p className="text-sm text-neutral-400 mb-1">Billing Period</p>
                <p className="text-sm text-white">
                  {formatDate(data.subscription.current_period_start)} - {formatDate(data.subscription.current_period_end)}
                </p>
              </div>

              <div>
                <p className="text-sm text-neutral-400 mb-1">Monthly Quota</p>
                <p className="text-2xl font-bold text-white">
                  {data.usage.quota_limit.toLocaleString()} <span className="text-base font-normal text-neutral-500">verifications</span>
                </p>
              </div>

              {canManage && (
                <div className="pt-4 border-t border-neutral-700">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setShowUpgradeModal(true)}
                  >
                    Change Plan
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Usage This Month */}
          <Card className="p-6 bg-neutral-900 border-neutral-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Usage This Month</h3>
              <TrendingUp className="h-5 w-5 text-neutral-500" />
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-neutral-400">Verifications Used</p>
                  <p className="text-sm font-medium text-white">
                    {data.usage.quota_used.toLocaleString()} / {data.usage.quota_limit.toLocaleString()}
                  </p>
                </div>
                <Progress value={usagePercent} className="h-3" />
                <p className="text-xs text-neutral-500 mt-2">
                  {Math.round(usagePercent)}% of quota used
                </p>
              </div>

              {data.usage.overage_count > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-amber-300">Overage Usage</p>
                      <p className="text-amber-200 mt-1">
                        {data.usage.overage_count.toLocaleString()} verifications over quota
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {usagePercent >= 90 && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-red-300">Quota Warning</p>
                      <p className="text-red-200 mt-1">
                        You're approaching your monthly quota. Consider upgrading your plan.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Payment Method */}
        <Card className="p-6 bg-neutral-900 border-neutral-800">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-neutral-400" />
              <h3 className="text-lg font-semibold text-white">Payment Method</h3>
            </div>
            {canManage && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowPaymentModal(true)}
              >
                {data.payment_method ? 'Update' : 'Add'} Payment Method
              </Button>
            )}
          </div>

          {data.payment_method ? (
            <div className="flex items-center gap-4">
              <div className="w-12 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  {data.payment_method.type} ending in {data.payment_method.last4}
                </p>
                <p className="text-xs text-neutral-500">
                  Expires {data.payment_method.exp_month}/{data.payment_method.exp_year}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-neutral-500">No payment method on file</p>
          )}
        </Card>

        {/* Invoice History */}
        <Card className="p-6 bg-neutral-900 border-neutral-800">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-neutral-400" />
              <h3 className="text-lg font-semibold text-white">Invoice History</h3>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="border-neutral-700 hover:bg-neutral-800/50">
                <TableHead className="text-neutral-300">Invoice</TableHead>
                <TableHead className="text-neutral-300">Period</TableHead>
                <TableHead className="text-neutral-300">Amount</TableHead>
                <TableHead className="text-neutral-300">Status</TableHead>
                <TableHead className="w-24 text-neutral-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.invoices.map((invoice) => (
                <TableRow key={invoice.id} className="border-neutral-700 hover:bg-neutral-800/50">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-neutral-500" />
                      <span className="text-sm text-white">
                        {formatDate(invoice.created_at)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-neutral-400">
                    {formatDate(invoice.period_start)} - {formatDate(invoice.period_end)}
                  </TableCell>
                  <TableCell className="text-sm font-medium text-white">
                    {formatCurrency(invoice.amount)}
                  </TableCell>
                  <TableCell>
                    {invoice.status === 'paid' ? (
                      <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Paid
                      </Badge>
                    ) : invoice.status === 'open' ? (
                      <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">Open</Badge>
                    ) : (
                      <Badge className="bg-red-500/20 text-red-300 border-red-500/30">Past Due</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-neutral-400 hover:text-white"
                      onClick={() => handleDownloadInvoice(invoice.id)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {data.invoices.length === 0 && (
                <TableRow className="border-neutral-700">
                  <TableCell colSpan={5} className="text-center py-12">
                    <Receipt className="h-12 w-12 text-neutral-600 mx-auto mb-3" />
                    <p className="text-neutral-400">No invoices yet</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Modals */}
      {showUpgradeModal && (
        <UpgradePlanModal
          currentPlan={data.subscription.plan_type}
          organizationId={org?.id || ''}
          onClose={() => setShowUpgradeModal(false)}
          onSuccess={() => {
            setShowUpgradeModal(false);
            loadBillingData();
          }}
        />
      )}

      {showPaymentModal && (
        <PaymentMethodModal
          organizationId={org?.id || ''}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={() => {
            setShowPaymentModal(false);
            loadBillingData();
          }}
        />
      )}
    </ClientLayout>
  );
}
