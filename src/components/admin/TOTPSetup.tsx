// TOTP 2FA Settings Component for Admin Users

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Shield, Check, X } from "lucide-react";
import { getSession, logAdminAction } from "@/lib/admin-auth";
import { supabase } from "@/lib/supabase-client";
import * as OTPAuth from "otpauth";
import QRCode from "qrcode";

const TOTPSetup = () => {
  const [step, setStep] = useState<"setup" | "verify">("setup");
  const [secret, setSecret] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateTOTP = async () => {
    const session = getSession();
    if (!session) return;

    setIsLoading(true);
    try {
      // Generate TOTP secret
      const totp = new OTPAuth.TOTP({
        issuer: "Fusion Admin",
        label: session.admin.email,
        algorithm: "SHA1",
        digits: 6,
        period: 30,
      });

      const totpSecret = totp.secret.base32;
      setSecret(totpSecret);

      // Generate QR code
      const otpAuthUrl = totp.toString();
      const qrCodeDataUrl = await QRCode.toDataURL(otpAuthUrl);
      setQrCode(qrCodeDataUrl);

      setStep("verify");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate 2FA setup",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndEnable = async () => {
    const session = getSession();
    if (!session) return;

    setIsLoading(true);
    try {
      // Create TOTP instance with the secret
      const totp = new OTPAuth.TOTP({
        issuer: "Fusion Admin",
        label: session.admin.email,
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(secret),
      });

      // Verify the code
      const delta = totp.validate({ token: verificationCode, window: 1 });
      
      if (delta === null) {
        toast({
          title: "Invalid Code",
          description: "The verification code is incorrect",
          variant: "destructive",
        });
        return;
      }

      // Store encrypted TOTP secret in database
      const { error } = await supabase
        .from("admin_users")
        .update({
          totp_secret: secret, // In production, encrypt this!
          totp_enabled: true,
        })
        .eq("id", session.admin.id);

      if (error) throw error;

      await logAdminAction("totp_enabled", "admin_user", session.admin.id, {
        email: session.admin.email,
      });

      toast({
        title: "2FA Enabled",
        description: "Two-factor authentication has been enabled for your account",
      });

      // Reset state
      setStep("setup");
      setSecret("");
      setQrCode("");
      setVerificationCode("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to enable 2FA",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!confirm("Are you sure you want to disable 2FA? This will reduce your account security.")) {
      return;
    }

    const session = getSession();
    if (!session) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("admin_users")
        .update({
          totp_secret: null,
          totp_enabled: false,
        })
        .eq("id", session.admin.id);

      if (error) throw error;

      await logAdminAction("totp_disabled", "admin_user", session.admin.id, {
        email: session.admin.email,
      });

      toast({
        title: "2FA Disabled",
        description: "Two-factor authentication has been disabled",
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disable 2FA",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const session = getSession();
  const isTOTPEnabled = session?.admin?.totp_enabled || false;

  if (isTOTPEnabled) {
    return (
      <div className="glass rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
            <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1">Two-Factor Authentication Enabled</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Your account is protected with TOTP-based two-factor authentication.
            </p>
            <Button
              onClick={handleDisable2FA}
              variant="destructive"
              size="sm"
              disabled={isLoading}
            >
              Disable 2FA
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
          <Shield className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-1">Two-Factor Authentication</h3>
          <p className="text-sm text-muted-foreground">
            Add an extra layer of security to your admin account using TOTP (Time-based One-Time Password).
          </p>
        </div>
      </div>

      {step === "setup" ? (
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            Use an authenticator app like Google Authenticator, Authy, or 1Password to generate verification codes.
          </p>
          <Button onClick={handleGenerateTOTP} disabled={isLoading}>
            <Shield className="w-4 h-4 mr-2" />
            Enable 2FA
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <h4 className="font-medium mb-3">Step 1: Scan QR Code</h4>
            {qrCode && (
              <div className="bg-white p-4 rounded-lg inline-block">
                <img src={qrCode} alt="TOTP QR Code" className="w-48 h-48" />
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              Or manually enter this secret: <code className="bg-muted px-2 py-1 rounded">{secret}</code>
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-3">Step 2: Verify Code</h4>
            <div className="flex gap-2 max-w-md">
              <Input
                type="text"
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                className="text-center text-lg tracking-widest"
              />
              <Button onClick={handleVerifyAndEnable} disabled={isLoading || verificationCode.length !== 6}>
                Verify & Enable
              </Button>
            </div>
          </div>

          <Button variant="ghost" onClick={() => { setStep("setup"); setSecret(""); setQrCode(""); }}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
};

export default TOTPSetup;
