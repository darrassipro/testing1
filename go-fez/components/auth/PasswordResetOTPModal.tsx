import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useVerifyPasswordResetOTPMutation, useResendPasswordResetOTPMutation } from '@/services/api/UserApi';

interface PasswordResetOTPModalProps {
  visible: boolean;
  email: string;
  onClose: () => void;
  onBack: () => void;
  onSuccess: (resetToken: string) => void;
}

const PasswordResetOTPModal: React.FC<PasswordResetOTPModalProps> = ({
  visible,
  email,
  onClose,
  onBack,
  onSuccess,
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(600); // 10 minutes
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const [verifyPasswordResetOTP, { isLoading: isVerifying }] = useVerifyPasswordResetOTPMutation();
  const [resendPasswordResetOTP, { isLoading: isResending }] = useResendPasswordResetOTPMutation();

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

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter a valid 6-digit code');
      return;
    }

    try {
      const response = await verifyPasswordResetOTP({ email, otpCode }).unwrap();
      Alert.alert('Success', 'Code verified! Please set your new password.');
      onSuccess(response.resetToken);
    } catch (err: any) {
      const errorMessage = err?.data?.message || 'Verification failed';
      Alert.alert('Verification Failed', errorMessage);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    try {
      await resendPasswordResetOTP({ email }).unwrap();
      Alert.alert('Success', 'New code sent to your email');
      setTimer(600);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      const errorMessage = err?.data?.message || 'Failed to resend code';
      Alert.alert('Error', errorMessage);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="shield-checkmark-outline" size={32} color="#3b82f6" />
            </View>
            <Text style={styles.title}>Verify Reset Code</Text>
            <Text style={styles.subtitle}>We sent a verification code to</Text>
            <Text style={styles.email}>{email}</Text>
            <Text style={styles.expiryNote}>⏱️ Code expires in 10 minutes</Text>
          </View>

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                style={styles.otpInput}
                value={digit}
                onChangeText={(value) => handleChange(index, value.replace(/[^0-9]/g, ''))}
                onKeyPress={({ nativeEvent: { key } }) => handleKeyPress(index, key)}
                keyboardType="numeric"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </View>

          <View style={styles.timerContainer}>
            {canResend ? (
              <TouchableOpacity onPress={handleResend} disabled={isResending}>
                <Text style={styles.resendText}>
                  {isResending ? 'Resending...' : 'Resend Code'}
                </Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.timerText}>
                Resend code in <Text style={styles.timerBold}>{formatTime(timer)}</Text>
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={[styles.verifyButton, (isVerifying || otp.join('').length !== 6) && styles.disabledButton]}
            onPress={handleVerify}
            disabled={isVerifying || otp.join('').length !== 6}
          >
            {isVerifying ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.verifyButtonText}>Verify Code</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={20} color="#666" />
            <Text style={styles.backButtonText}>Back to Forgot Password</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  expiryNote: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '600',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  resendText: {
    color: '#3b82f6',
    fontWeight: '600',
    fontSize: 14,
  },
  timerText: {
    color: '#666',
    fontSize: 14,
  },
  timerBold: {
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  verifyButton: {
    backgroundColor: '#3b82f6',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  backButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default PasswordResetOTPModal;
