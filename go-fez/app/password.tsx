'use client';

import { useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PasswordScreen() {
  const router = useRouter();
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });
  const [passwords, setPasswords] = useState({
    old: '',
    new: '',
    confirm: '',
  });

  const handlePasswordChange = (field: string, value: string) => {
    setPasswords({ ...passwords, [field]: value });
  };

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords({
      ...showPasswords,
      [field]: !showPasswords[field as keyof typeof showPasswords],
    });
  };

  const handleSave = () => {
    if (!passwords.old || !passwords.new || !passwords.confirm) {
      Alert.alert('Error', 'Please fill all password fields');
      return;
    }
    if (passwords.new !== passwords.confirm) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }
    Alert.alert('Success', 'Password changed successfully!');
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name='chevron-back' size={24} color='#fff' />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Password & Security</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          {/* Old Password */}
          <Text style={styles.label}>Old Password</Text>
          <View style={styles.passwordInputContainer}>
            <TextInput
              style={styles.input}
              placeholder='Enter old password'
              placeholderTextColor='#7a9abf'
              secureTextEntry={!showPasswords.old}
              value={passwords.old}
              onChangeText={(value) => handlePasswordChange('old', value)}
            />
            <TouchableOpacity onPress={() => togglePasswordVisibility('old')}>
              <Ionicons
                name={showPasswords.old ? 'eye' : 'eye-off'}
                size={20}
                color='#7a9abf'
              />
            </TouchableOpacity>
          </View>

          {/* New Password */}
          <Text style={styles.label}>New Password</Text>
          <View style={styles.passwordInputContainer}>
            <TextInput
              style={styles.input}
              placeholder='Enter new password'
              placeholderTextColor='#7a9abf'
              secureTextEntry={!showPasswords.new}
              value={passwords.new}
              onChangeText={(value) => handlePasswordChange('new', value)}
            />
            <TouchableOpacity onPress={() => togglePasswordVisibility('new')}>
              <Ionicons
                name={showPasswords.new ? 'eye' : 'eye-off'}
                size={20}
                color='#7a9abf'
              />
            </TouchableOpacity>
          </View>

          {/* Confirm Password */}
          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.passwordInputContainer}>
            <TextInput
              style={styles.input}
              placeholder='Confirm password'
              placeholderTextColor='#7a9abf'
              secureTextEntry={!showPasswords.confirm}
              value={passwords.confirm}
              onChangeText={(value) => handlePasswordChange('confirm', value)}
            />
            <TouchableOpacity
              onPress={() => togglePasswordVisibility('confirm')}
            >
              <Ionicons
                name={showPasswords.confirm ? 'eye' : 'eye-off'}
                size={20}
                color='#7a9abf'
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a2f4d',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a4668',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 20,
  },
  label: {
    fontSize: 14,
    color: '#7a9abf',
    marginBottom: 8,
    marginTop: 16,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#243656',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2a4668',
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 40,
    marginBottom: 40,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00d4ff',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#00d4ff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#00d466',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#1a2f4d',
    fontSize: 16,
    fontWeight: '600',
  },
});
