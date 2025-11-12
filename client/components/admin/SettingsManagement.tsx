'use client';

import React, { useState, useEffect } from 'react';
import { useGetAllSettingsQuery, useUpdateSettingMutation } from '@/services/api/SettingsApi';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, Settings, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsManagement() {
  const { data, isLoading, error } = useGetAllSettingsQuery(undefined);
  const [updateSetting, { isLoading: isUpdating }] = useUpdateSettingMutation();

  const [emailVerificationEnabled, setEmailVerificationEnabled] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (data?.settings?.email_verification_enabled) {
      setEmailVerificationEnabled(data.settings.email_verification_enabled.value);
    }
  }, [data]);

  const handleToggleChange = (checked: boolean) => {
    setEmailVerificationEnabled(checked);
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await updateSetting({
        key: 'email_verification_enabled',
        value: emailVerificationEnabled
      }).unwrap();
      
      toast.success('Settings saved successfully!');
      setHasChanges(false);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to save settings');
    }
  };

  const handleReset = () => {
    if (data?.settings?.email_verification_enabled) {
      setEmailVerificationEnabled(data.settings.email_verification_enabled.value);
      setHasChanges(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-600" />
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load settings. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-8 w-8 text-indigo-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Application Settings</h1>
          <p className="text-gray-600 mt-1">
            Configure global application settings and preferences
          </p>
        </div>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Authentication Settings
            </h2>
            
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <Label 
                      htmlFor="email-verification" 
                      className="text-base font-medium text-gray-900 cursor-pointer"
                    >
                      Email Verification
                    </Label>
                    {emailVerificationEnabled ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 max-w-2xl">
                    {emailVerificationEnabled 
                      ? 'Users must verify their email address after signup. They will receive an OTP code to activate their account before they can login.'
                      : 'Users can login immediately after signup without email verification. The OTP verification step is skipped entirely.'
                    }
                  </p>
                  
                  <div className="mt-3 p-3 bg-white rounded-md border border-gray-200">
                    <p className="text-xs text-gray-700 font-medium mb-1">Impact:</p>
                    <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                      {emailVerificationEnabled ? (
                        <>
                          <li>New users receive OTP via email after signup</li>
                          <li>Users must enter OTP code to verify account</li>
                          <li>Account remains with isVerified: false until OTP verified</li>
                          <li>Better security and valid email addresses</li>
                        </>
                      ) : (
                        <>
                          <li>No OTP email sent to new users</li>
                          <li>No verification step required</li>
                          <li>Users can login immediately after signup (isVerified: false but access granted)</li>
                          <li>Faster onboarding but less email validation</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
                
                <div className="ml-6">
                  <Switch
                    id="email-verification"
                    checked={emailVerificationEnabled}
                    onCheckedChange={handleToggleChange}
                    className="data-[state=checked]:bg-indigo-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {hasChanges && (
            <Alert className="bg-amber-50 border-amber-200">
              <AlertDescription className="text-amber-800">
                You have unsaved changes. Click Save to apply them or Reset to discard.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={!hasChanges || isUpdating}
            >
              Reset
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges || isUpdating}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
