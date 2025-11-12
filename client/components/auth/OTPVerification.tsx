'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { useVerifyOTPMutation, useSendOTPMutation } from '@/services/api/UserApi';

interface OTPVerificationProps {
  email: string;
  onClose?: () => void;
  onBack?: () => void;
  onSuccess?: (otpCode: string) => void;
}

const OTPVerification: React.FC<OTPVerificationProps> = ({ 
  email, 
  onClose, 
  onBack,
  onSuccess 
}) => {
  const t = useTranslations('OTPVerification');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(600); // 10 minutes (600 seconds) to match backend expiration
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  const [verifyOTP, { isLoading: isVerifying }] = useVerifyOTPMutation();
  const [resendOTP, { isLoading: isResending }] = useSendOTPMutation();

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    const newOtp = pastedData.split('').concat(Array(6).fill('')).slice(0, 6);
    setOtp(newOtp);
    
    // Focus last filled input or first empty
    const lastFilledIndex = newOtp.findIndex((val) => !val);
    if (lastFilledIndex !== -1) {
      inputRefs.current[lastFilledIndex]?.focus();
    } else {
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      toast.error(t('invalidOTP') || 'Please enter a valid 6-digit code');
      return;
    }

    try {
      await verifyOTP({ email, otpCode }).unwrap();
      toast.success(t('success') || 'Email verified successfully!');
      onSuccess?.(otpCode);
    } catch (err: any) {
      const errorMessage = err?.data?.message || t('error') || 'Verification failed';
      toast.error(errorMessage);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    try {
      await resendOTP({ email }).unwrap();
      toast.success(t('otpResent') || 'New code sent to your email');
      setTimer(600); // Reset to 10 minutes (600 seconds)
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      const errorMessage = err?.data?.message || t('resendError') || 'Failed to resend code';
      toast.error(errorMessage);
    }
  };

  // Format timer as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md">
        <Card className="bg-white backdrop-blur-xl border-0 shadow-2xl overflow-hidden">
          <div className="relative px-8 pt-8 pb-6 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-emerald-600 mb-2">
              {t('title') || 'Verify Your Email'}
            </h2>
            <p className="text-gray-600 text-sm">
              {t('description') || 'We sent a verification code to'}
            </p>
            <p className="text-gray-800 font-semibold text-sm mt-1">{email}</p>
            <p className="text-amber-600 text-xs mt-2 font-medium">
              ⏱️ {t('expiresIn') || 'Code expires in 10 minutes'}
            </p>
          </div>

          <div className="px-8 pb-8">
            <div className="space-y-6">
              {/* OTP Input */}
              <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value.replace(/[^0-9]/g, ''))}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 sm:w-14 sm:h-14 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors"
                  />
                ))}
              </div>

              {/* Timer & Resend */}
              <div className="text-center">
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={isResending}
                    className="text-emerald-600 font-medium hover:underline disabled:opacity-50"
                  >
                    {isResending ? t('resending') || 'Resending...' : t('resendCode') || 'Resend Code'}
                  </button>
                ) : (
                  <p className="text-gray-600 text-sm">
                    {t('resendIn') || 'Resend code in'} <span className="font-semibold text-emerald-600">{formatTime(timer)}</span>
                  </p>
                )}
              </div>

              {/* Verify Button */}
              <Button
                type="button"
                onClick={handleVerify}
                disabled={isVerifying || otp.join('').length !== 6}
                className="w-full h-12"
              >
                {isVerifying ? (
                  t('verifying') || 'Verifying...'
                ) : (
                  <div className="flex items-center justify-center">
                    {t('verify') || 'Verify Email'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                )}
              </Button>

              {/* Back Button */}
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className="w-full text-gray-600 hover:text-gray-800 text-sm font-medium flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t('backToSignup') || 'Back to Sign Up'}
                </button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default OTPVerification;
