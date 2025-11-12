'use client';

import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useDispatch } from 'react-redux';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { toast } from 'sonner';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Lock, Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';

// Logic & API
import { passwordSchema } from '@/lib/validationSchemas';
import * as Yup from 'yup';
import { useResetPasswordMutation } from '@/services/api/UserApi';
import { setCredentials } from '@/services/slices/authSlice';

interface ResetPasswordProps {
  email: string;
  otpCode: string;
  onClose?: () => void;
  onBack?: () => void;
}

const resetPasswordSchema = Yup.object({
  newPassword: passwordSchema,
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Les mots de passe ne correspondent pas')
    .required('La confirmation du mot de passe est obligatoire'),
});

const ResetPassword: React.FC<ResetPasswordProps> = ({ 
  email,
  otpCode,
  onClose,
  onBack
}) => {
  const t = useTranslations('ResetPassword');
  const dispatch = useDispatch();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const initialValues = {
    newPassword: '',
    confirmPassword: '',
  };

  const handleSubmit = async (values: typeof initialValues) => {
    try {
      // Vérifier que les mots de passe correspondent (déjà fait par validation mais on double-vérifie)
      if (values.newPassword !== values.confirmPassword) {
        toast.error(t('passwordsDontMatch') || 'Les mots de passe ne correspondent pas');
        return;
      }

      // Appeler l'API pour réinitialiser le mot de passe
      const response = await resetPassword({
        email,
        otpCode,
        newPassword: values.newPassword,
      }).unwrap();

      console.log('Reset password response:', response);

      // Vérifier si tokens existent dans la réponse
      if (!response || !response.tokens) {
        console.error('Tokens missing from response:', response);
        toast.error(t('invalidResponse') || 'Réponse invalide du serveur');
        return;
      }

      // Mettre à jour les credentials Redux (même structure que loginUser)
      dispatch(setCredentials({
        user: response.user,
        token: response.tokens.token,
        refreshToken: response.tokens.refreshToken
      }));

      toast.success(t('success') || 'Mot de passe réinitialisé avec succès !');
      onClose?.();

      // Rediriger selon le rôle de l'utilisateur
      const userRole = response.user?.role?.toLowerCase();
      console.log('User role:', userRole);

      if (userRole === 'admin' || userRole === 'moderator') {
        console.log('Redirecting to admin panel');
        router.push("/admin");
      } else {
        console.log('Redirecting to profile');
        router.push("/profile");
      }
    } catch (err: any) {
      console.error('Reset password error:', err);
      const errorMessage = err?.data?.message || t('error') || 'Erreur lors de la réinitialisation du mot de passe';
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
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-emerald-600 mb-2">
                {t('title') || 'Nouveau mot de passe'}
              </h2>
              <p className="text-gray-600 text-sm">
                {t('description') || 'Définissez un nouveau mot de passe sécurisé pour votre compte'}
              </p>
            </div>
          </div>

          <div className="px-8 pb-8">
            <Formik
              initialValues={initialValues}
              validationSchema={resetPasswordSchema}
              onSubmit={handleSubmit}
              validateOnChange={false}
              validateOnBlur={true}
            >
              {({ errors, touched }) => (
                <Form className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <Lock className="w-4 h-4 mr-2" />
                      {t('newPassword') || 'Nouveau mot de passe'}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-gray-400" />
                      </div>
                      <Field name="newPassword">
                        {({ field }: any) => (
                          <Input
                            {...field}
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            className={`pl-10 pr-10 h-11 bg-white/80 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20 ${
                              errors.newPassword && touched.newPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                            }`}
                          />
                        )}
                      </Field>
                      <button 
                        type="button" 
                        className="absolute inset-y-0 right-0 pr-3 flex items-center" 
                        onClick={() => setShowPassword((v) => !v)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                    <ErrorMessage name="newPassword" component="p" className="text-xs text-red-500" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <Lock className="w-4 h-4 mr-2" />
                      {t('confirmPassword') || 'Confirmer le mot de passe'}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-gray-400" />
                      </div>
                      <Field name="confirmPassword">
                        {({ field }: any) => (
                          <Input
                            {...field}
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            className={`pl-10 pr-10 h-11 bg-white/80 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20 ${
                              errors.confirmPassword && touched.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                            }`}
                          />
                        )}
                      </Field>
                      <button 
                        type="button" 
                        className="absolute inset-y-0 right-0 pr-3 flex items-center" 
                        onClick={() => setShowConfirmPassword((v) => !v)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                    <ErrorMessage name="confirmPassword" component="p" className="text-xs text-red-500" />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isLoading} 
                    className="w-full h-12 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-700 hover:to-green-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        {t('updating') || 'Mise à jour...'}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        {t('validate') || 'Valider'}
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
                      {t('back') || 'Retour'}
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

export default ResetPassword;

