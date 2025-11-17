'use client';

import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useDispatch } from 'react-redux';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Mail, Lock, Eye, EyeOff, ArrowRight, User as UserIcon, Phone } from 'lucide-react';
import GmailLoginButton from '@/components/social/GmailLoginButton';
import FacebookLoginButton from '@/components/social/FacebookLoginButton';
import OTPVerification from './OTPVerification';

// Logic & API
import { signUpSchema } from '@/lib/validationSchemas';
import { useRegisterUserMutation, useProviderRegisterMutation, useSendOTPMutation } from '@/services/api/UserApi';
import { useGetSettingQuery } from '@/services/api/SettingsApi';

interface SignUpProps {
  onClose?: () => void;
  onSwitchToLogin?: () => void;
}

const SignUp: React.FC<SignUpProps> = ({ onClose, onSwitchToLogin }) => {
  const dispatch = useDispatch();
  const t = useTranslations('SignUp');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOTPScreen, setShowOTPScreen] = useState(false);
  const [signupData, setSignupData] = useState<any>(null);
  
  const [registerUser, { isLoading, error }] = useRegisterUserMutation();
  const [sendOTP, { isLoading: isSendingOTP }] = useSendOTPMutation();
  const [providerRegister] = useProviderRegisterMutation();
  
  // Check if email verification is enabled
  const { data: emailVerificationSetting, isLoading: isLoadingSettings } = useGetSettingQuery('email_verification_enabled');
  // Handle both boolean and string values from backend
  const isEmailVerificationEnabled = emailVerificationSetting?.setting?.value === true || 
                                      emailVerificationSetting?.setting?.value === 'true';

  // Debug logging
  React.useEffect(() => {
    console.log('📧 Email Verification Setting:', {
      rawData: emailVerificationSetting,
      settingObject: emailVerificationSetting?.setting,
      value: emailVerificationSetting?.setting?.value,
      type: typeof emailVerificationSetting?.setting?.value,
      isEnabled: isEmailVerificationEnabled,
      isLoading: isLoadingSettings
    });
  }, [emailVerificationSetting, isEmailVerificationEnabled, isLoadingSettings]);

  const initialValues = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  };

  const handleSignUpSubmit = async (values: typeof initialValues) => {
    try {
      const { confirmPassword, ...payload } = values;
      
      // Validate required fields
      if (!payload.firstName || !payload.lastName || !payload.email || !payload.password) {
        toast.error('Please fill in all required fields');
        return;
      }
      
      const finalPayload = {
        ...payload,
        email: payload.email?.trim() || undefined,
        phone: payload.phone?.trim() || undefined,
      };

      console.log('Email verification enabled:', isEmailVerificationEnabled);
      console.log('Signup payload:', { ...finalPayload, password: '[REDACTED]' });

      // Check if email verification is enabled (default to false if setting not loaded)
      if (isEmailVerificationEnabled) {
        // ✅ STEP 1: EMAIL VERIFICATION IS ENABLED - Send OTP to email first
        console.log('✅ Email verification ENABLED - Sending OTP to:', finalPayload.email);
        const otpResponse = await sendOTP({ 
          email: finalPayload.email,
          firstName: finalPayload.firstName,
          lastName: finalPayload.lastName
        }).unwrap();
        console.log('📧 OTP sent successfully:', otpResponse);
        
        // Store signup data for later (after OTP verification)
        setSignupData(finalPayload);
        setShowOTPScreen(true);
        toast.success(t('checkEmail') || 'Please check your email for verification code');
      } else {
        // ❌ STEP 1: EMAIL VERIFICATION IS DISABLED - Create account directly
        console.log('❌ Email verification DISABLED - Creating account directly without OTP');
        const response = await registerUser(finalPayload).unwrap();
        console.log('✅ Account created successfully:', response);
        toast.success('Account created successfully!');
        onSwitchToLogin?.();
      }
    } catch (err: any) {
      console.error('Signup error full:', {
        error: err,
        data: err?.data,
        status: err?.status,
        message: err?.message,
        response: err?.response,
        originalStatus: err?.originalStatus
      });
      
      let errorMessage = t('error');
      
      // Handle RTK Query error format
      if (err?.data?.message) {
        errorMessage = err.data.message;
      } else if (err?.data?.error) {
        errorMessage = err.data.error;
      } else if (err?.message) {
        errorMessage = err.message;
      } else if (err?.status === 400) {
        errorMessage = 'Invalid data provided. Please check your information.';
      } else if (err?.status === 409) {
        errorMessage = 'An account with this email already exists.';
      } else if (err?.status) {
        errorMessage = `Error ${err.status}: Unable to create account`;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      toast.error(errorMessage);
    }
  };

  const handleOTPSuccess = async (otpCode: string) => {
    try {
      console.log('OTP verified, creating account with data:', signupData);
      // Step 2: After OTP verification, create the account
      const response = await registerUser(signupData).unwrap();
      console.log('Account created after OTP:', response);
      
      setShowOTPScreen(false);
      toast.success('Account created successfully!');
      onSwitchToLogin?.();
    } catch (err: any) {
      console.error('Account creation error after OTP:', {
        error: err,
        data: err?.data,
        status: err?.status,
        message: err?.message
      });
      
      const errorMessage = err?.data?.message || err?.message || 'Failed to create account';
      toast.error(errorMessage);
    }
  };

  const handleOTPBack = () => {
    setShowOTPScreen(false);
    setSignupData(null);
  };

  // If OTP screen should be shown, render it instead
  if (showOTPScreen && signupData?.email) {
    return (
      <OTPVerification
        email={signupData.email}
        onClose={onClose}
        onBack={handleOTPBack}
        onSuccess={handleOTPSuccess}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md">
        <Card className="bg-white backdrop-blur-xl border-0 shadow-2xl overflow-hidden">
          <div className="relative px-8 pt-8 pb-6 text-center">
            <h2 className="text-2xl font-bold text-emerald-600 mb-2">{t('title')}</h2>
            <p className="text-gray-600 text-sm">{t('description')}</p>
          </div>

          <div className="px-8 pb-8">
            <Formik
              initialValues={initialValues}
              validationSchema={signUpSchema}
              onSubmit={handleSignUpSubmit}
              validateOnChange={false}
              validateOnBlur={true}
            >
              {({ errors, touched }) => (
                <Form className="space-y-4">
                  {/* First & Last Name */}
                  <div className="grid grid-cols-2 gap-4">
                    <Field name="firstName">
                      {({ field }: any) => (
                        <Input {...field} placeholder={t('firstNamePlaceholder')} className={`h-11 ${errors.firstName && touched.firstName ? 'border-red-500' : ''}`} />
                      )}
                    </Field>
                    <Field name="lastName">
                      {({ field }: any) => (
                        <Input {...field} placeholder={t('lastNamePlaceholder')} className={`h-11 ${errors.lastName && touched.lastName ? 'border-red-500' : ''}`} />
                      )}
                    </Field>
                  </div>
                  <ErrorMessage name="firstName" component="p" className="text-xs text-red-500" />
                  <ErrorMessage name="lastName" component="p" className="text-xs text-red-500" />

                  {/* Email */}
                  <Field name="email">
                    {({ field }: any) => (
                      <Input {...field} type="email" placeholder="name@example.com" className={`h-11 ${errors.email && touched.email ? 'border-red-500' : ''}`} />
                    )}
                  </Field>
                  <ErrorMessage name="email" component="p" className="text-xs text-red-500" />

                  {/* Phone */}
                  <Field name="phone">
                    {({ field }: any) => (
                      <Input {...field} type="tel" placeholder="+212 6 00 00 00 00" className={`h-11 ${errors.phone && touched.phone ? 'border-red-500' : ''}`} />
                    )}
                  </Field>
                  <ErrorMessage name="phone" component="p" className="text-xs text-red-500" />

                  {/* Password */}
                  <Field name="password">
                    {({ field }: any) => (
                      <Input {...field} type={showPassword ? 'text' : 'password'} placeholder="••••••••" className={`h-11 ${errors.password && touched.password ? 'border-red-500' : ''}`} />
                    )}
                  </Field>
                  <button type="button" onClick={() => setShowPassword((v) => !v)} className="text-xs text-gray-500 underline">
                    {showPassword ? t('hidePassword') : t('showPassword')}
                  </button>
                  <ErrorMessage name="password" component="p" className="text-xs text-red-500" />

                  {/* Confirm Password */}
                  <Field name="confirmPassword">
                    {({ field }: any) => (
                      <Input {...field} type={showConfirmPassword ? 'text' : 'password'} placeholder="••••••••" className={`h-11 ${errors.confirmPassword && touched.confirmPassword ? 'border-red-500' : ''}`} />
                    )}
                  </Field>
                  <button type="button" onClick={() => setShowConfirmPassword((v) => !v)} className="text-xs text-gray-500 underline">
                    {showConfirmPassword ? t('hidePassword') : t('showPassword')}
                  </button>
                  <ErrorMessage name="confirmPassword" component="p" className="text-xs text-red-500" />

                  {/* Error */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-600">
                        {(error as any)?.data?.message || t('error')}
                      </p>
                    </div>
                  )}

                  {/* Submit */}
                  <Button type="submit" disabled={isLoading || isSendingOTP || isLoadingSettings} className="w-full h-12">
                    {(isLoading || isSendingOTP) ? t('loading') : (
                      <div className="flex items-center justify-center">
                        <UserIcon className="w-5 h-5 mr-2" />
                        {t('submit')}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </div>
                    )}
                  </Button>

                  {/* Switch to login */}
                  <div className="text-center mt-4">
                    <p className="text-sm text-gray-600">
                      {t('alreadyAccount')}{' '}
                      <button type="button" onClick={onSwitchToLogin} className="text-emerald-600 underline">
                        {t('login')}
                      </button>
                    </p>
                  </div>

                  {/* Social Signup */}
                  <div className="relative mt-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500">{t('orSignUpWith')}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
<GmailLoginButton color="emerald" />
  <FacebookLoginButton color="blue" />
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SignUp;
