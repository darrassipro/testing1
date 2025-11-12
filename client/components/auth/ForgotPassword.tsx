'use client';

import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Mail, ArrowRight, ArrowLeft, KeyRound } from 'lucide-react';

// Logic & API
import { emailSchema } from '@/lib/validationSchemas';
import * as Yup from 'yup';
import { useSendPasswordResetOTPMutation } from '@/services/api/UserApi';

interface ForgotPasswordProps {
  onClose?: () => void;
  onBack?: () => void;
  onEmailSent?: (email: string) => void;
}

const forgotPasswordEmailSchema = Yup.object({
  email: emailSchema,
});

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ 
  onClose, 
  onBack,
  onEmailSent 
}) => {
  const t = useTranslations('ForgotPassword');
  const [sendPasswordResetOTP, { isLoading }] = useSendPasswordResetOTPMutation();

  const initialValues = {
    email: '',
  };

  const handleSubmit = async (values: typeof initialValues) => {
    try {
      await sendPasswordResetOTP({ email: values.email }).unwrap();
      toast.success(t('otpSent') || 'Code OTP envoyé avec succès à votre email');
      onEmailSent?.(values.email);
    } catch (err: any) {
      console.error('Error sending password reset OTP:', err);
      const errorMessage = err?.data?.message || t('error') || 'Erreur lors de l\'envoi du code OTP';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md">
        <Card className="bg-white backdrop-blur-xl border-0 shadow-2xl overflow-hidden">
          <div className="relative px-8 pt-8 pb-6">
            <div className="relative text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <KeyRound className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-amber-600 mb-2">
                {t('title') || 'Mot de passe oublié ?'}
              </h2>
              <p className="text-gray-600 text-sm">
                {t('description') || 'Entrez votre adresse email et nous vous enverrons un code de réinitialisation'}
              </p>
            </div>
          </div>

          <div className="px-8 pb-8">
            <Formik
              initialValues={initialValues}
              validationSchema={forgotPasswordEmailSchema}
              onSubmit={handleSubmit}
              validateOnChange={false}
              validateOnBlur={true}
            >
              {({ errors, touched }) => (
                <Form className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      {t('email') || 'Email'}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-4 w-4 text-gray-400" />
                      </div>
                      <Field name="email">
                        {({ field }: any) => (
                          <Input
                            {...field}
                            type="email"
                            placeholder="name@example.com"
                            className={`pl-10 h-11 bg-white/80 border-gray-200 focus:border-amber-500 focus:ring-amber-500/20 ${
                              errors.email && touched.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                            }`}
                          />
                        )}
                      </Field>
                    </div>
                    <ErrorMessage name="email" component="p" className="text-xs text-red-500" />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isLoading} 
                    className="w-full h-12 bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        {t('sending') || 'Envoi en cours...'}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <KeyRound className="w-5 h-5 mr-2" />
                        {t('sendCode') || 'Envoyer le code'}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </div>
                    )}
                  </Button>

                  {onBack && (
                    <button
                      type="button"
                      onClick={onBack}
                      className="w-full text-gray-600 hover:text-gray-800 text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      {t('backToLogin') || 'Retour à la connexion'}
                    </button>
                  )}
                </Form>
              )}
            </Formik>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;

