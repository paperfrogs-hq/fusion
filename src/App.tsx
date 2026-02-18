import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Whitepaper from "./pages/Whitepaper";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import UserIndex from "./pages/UserIndex";
import UserSignup from "./pages/UserSignup";
import UserLogin from "./pages/UserLogin";
import UserDashboard from "./pages/UserDashboard";
import VerifyEmail from "./pages/VerifyEmail";
import ComingSoon from "./pages/ComingSoon";
import BusinessPricing from "./pages/BusinessPricing";
import UserPricing from "./pages/UserPricing";
import UserCheckout from "./pages/UserCheckout";
import UserPayment from "./pages/UserPayment";
import UserSubscription from "./pages/UserSubscription";
import ErrorBoundary from "./components/client/ErrorBoundary";

// Lazy load client portal pages
import { lazy, Suspense } from "react";
import LoadingSkeleton from "./components/client/LoadingSkeleton";

const ClientLogin = lazy(() => import("./pages/ClientLogin"));
const ClientSignup = lazy(() => import("./pages/ClientSignup"));
const ClientSelectOrg = lazy(() => import("./pages/ClientSelectOrg"));
const ClientDashboard = lazy(() => import("./pages/Dashboard"));
const Activity = lazy(() => import("./pages/VerificationActivity"));
const ApiKeys = lazy(() => import("./pages/APIKeys"));
const Webhooks = lazy(() => import("./pages/Webhooks"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Team = lazy(() => import("./pages/TeamRoles"));
const OrganizationSettings = lazy(() => import("./pages/OrganizationSettings"));
const Billing = lazy(() => import("./pages/Billing"));
const StatusIncidents = lazy(() => import("./pages/StatusIncidents"));
const Reports = lazy(() => import("./pages/Reports"));
const CreateOrganization = lazy(() => import("./pages/CreateOrganization"));
const SystemTest = lazy(() => import("./pages/SystemTest"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const WaitlistSignup = lazy(() => import("./pages/WaitlistSignup"));
const VerifyAudio = lazy(() => import("./pages/VerifyAudio"));
const OrgPage = lazy(() => import("./pages/OrgPage"));
const SecuritySettings = lazy(() => import("./pages/SecuritySettings"));
const AcceptInvite = lazy(() => import("./pages/AcceptInvite"));
const ProfileSettings = lazy(() => import("./pages/ProfileSettings"));
const ClientCheckout = lazy(() => import("./pages/ClientCheckout"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const LoadingPage = () => (
  <div className="min-h-screen bg-background p-6">
    <LoadingSkeleton type="stats" />
    <div className="mt-6">
      <LoadingSkeleton type="card" />
    </div>
  </div>
);

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-right" />
        <BrowserRouter>
          <Suspense fallback={<LoadingPage />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/whitepaper" element={<Whitepaper />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/user" element={<UserIndex />} />
              <Route path="/user/signup" element={<UserSignup />} />
              <Route path="/user/login" element={<UserLogin />} />
              <Route path="/user/dashboard" element={<UserDashboard />} />
              <Route path="/user/pricing" element={<UserPricing />} />
              <Route path="/user/checkout" element={<UserCheckout />} />
              <Route path="/user/payment" element={<UserPayment />} />
              <Route path="/user/subscription" element={<UserSubscription />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              
              {/* Forgot Password & Reset Password Routes */}
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/user/forgot-password" element={<ForgotPassword />} />
              <Route path="/user/reset-password" element={<ResetPassword />} />
              <Route path="/client/forgot-password" element={<ForgotPassword />} />
              <Route path="/client/reset-password" element={<ResetPassword />} />
              
              {/* Waitlist Signup Route */}
              <Route path="/waitlist/signup" element={<WaitlistSignup />} />
              
              {/* Organization Public Page */}
              <Route path="/org/:slug" element={<OrgPage />} />
              
              {/* Business/Enterprise Pricing */}
              <Route path="/business/pricing" element={<BusinessPricing />} />
              <Route path="/enterprise/pricing" element={<BusinessPricing />} />
              
              {/* Client Portal Routes */}
              <Route path="/client/login" element={<ClientLogin />} />
              <Route path="/client/signup" element={<ClientSignup />} />
              <Route path="/client/select-org" element={<ClientSelectOrg />} />
              <Route path="/client/create-organization" element={<CreateOrganization />} />
              <Route path="/client/accept-invite" element={<AcceptInvite />} />
              <Route path="/client/checkout" element={<ClientCheckout />} />
              <Route path="/client/pricing" element={<BusinessPricing />} />
              <Route path="/client/dashboard" element={<ClientDashboard />} />
              <Route path="/client/verify" element={<VerifyAudio />} />
              <Route path="/client/activity" element={<Activity />} />
              <Route path="/client/api-keys" element={<ApiKeys />} />
              <Route path="/client/webhooks" element={<Webhooks />} />
              <Route path="/client/analytics" element={<Analytics />} />
              <Route path="/client/team" element={<Team />} />
              <Route path="/client/settings" element={<OrganizationSettings />} />
              <Route path="/client/settings/profile" element={<ProfileSettings />} />
              <Route path="/client/settings/billing" element={<Billing />} />
              <Route path="/client/settings/security" element={<SecuritySettings />} />
              <Route path="/client/status" element={<StatusIncidents />} />
              <Route path="/client/reports" element={<Reports />} />
              
              {/* Success Route Removed - Payment System Coming Soon */}
              
              {/* System Test Route */}
              <Route path="/system-test" element={<SystemTest />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
