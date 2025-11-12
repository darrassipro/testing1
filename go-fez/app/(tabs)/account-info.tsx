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

export default function AccountInfoScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: 'Jackson',
    surname: 'Jackie',
    lastName: 'Smith',
    qualis: 'Product Manager',
    email: 'jackson@email.com',
    mobile: '+212 05 6655646',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name='chevron-back' size={24} color='#fff' />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account Informations</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Form Fields */}
        <View style={styles.section}>
          <Text style={styles.label}>First name</Text>
          <TextInput
            style={styles.input}
            placeholder='Enter first name'
            placeholderTextColor='#7a9abf'
            value={formData.firstName}
            onChangeText={(value) => handleInputChange('firstName', value)}
          />

          <Text style={styles.label}>Surname</Text>
          <TextInput
            style={styles.input}
            placeholder='Enter surname'
            placeholderTextColor='#7a9abf'
            value={formData.surname}
            onChangeText={(value) => handleInputChange('surname', value)}
          />

          <Text style={styles.label}>Last Name</Text>
          <TextInput
            style={styles.input}
            placeholder='Enter last name'
            placeholderTextColor='#7a9abf'
            value={formData.lastName}
            onChangeText={(value) => handleInputChange('lastName', value)}
          />

          <Text style={styles.label}>Qualis</Text>
          <TextInput
            style={styles.input}
            placeholder='Enter title'
            placeholderTextColor='#7a9abf'
            value={formData.qualis}
            onChangeText={(value) => handleInputChange('qualis', value)}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder='Enter email'
            placeholderTextColor='#7a9abf'
            value={formData.email}
            editable={false}
          />

          <Text style={styles.label}>Mobile Number</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder='Enter mobile'
              placeholderTextColor='#7a9abf'
              value={formData.mobile}
              editable={false}
            />
            <View style={styles.flagIcon}>
              <Text style={{ fontSize: 20 }}>🇲🇦</Text>
            </View>
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
          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => {
              Alert.alert('Success', 'Account information updated!');
              router.back();
            }}
          >
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
  input: {
    backgroundColor: '#243656',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#2a4668',
  },
  inputContainer: {
    position: 'relative',
  },
  flagIcon: {
    position: 'absolute',
    right: 16,
    top: 12,
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
