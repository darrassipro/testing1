'use client';

import { useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LanguageScreen() {
  const router = useRouter();
  const [selectedLanguage, setSelectedLanguage] = useState('english');

  const languages = [
    { id: 'english', label: 'English', flag: '🇬🇧', nativeName: 'English' },
    { id: 'french', label: 'Français', flag: '🇫🇷', nativeName: 'Français' },
    { id: 'spanish', label: 'Español', flag: '🇪🇸', nativeName: 'Español' },
    { id: 'german', label: 'Deutsch', flag: '🇩🇪', nativeName: 'Deutsch' },
    { id: 'arabic', label: 'العربية', flag: '🇲🇦', nativeName: 'العربية' },
    {
      id: 'portuguese',
      label: 'Português',
      flag: '🇵🇹',
      nativeName: 'Português',
    },
    { id: 'italian', label: 'Italiano', flag: '🇮🇹', nativeName: 'Italiano' },
    { id: 'chinese', label: '中文', flag: '🇨🇳', nativeName: '中文' },
  ];

  const handleLanguageChange = (languageId: string) => {
    setSelectedLanguage(languageId);
    const selectedLang = languages.find((l) => l.id === languageId);
    Alert.alert('Language Changed', `Language set to ${selectedLang?.label}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name='chevron-back' size={24} color='#fff' />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Languages</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionDescription}>
            Select your preferred language for the app interface
          </Text>

          {languages.map((language) => (
            <TouchableOpacity
              key={language.id}
              style={[
                styles.languageItem,
                selectedLanguage === language.id && styles.selectedLanguage,
              ]}
              onPress={() => handleLanguageChange(language.id)}
            >
              <Text style={styles.languageFlag}>{language.flag}</Text>
              <View style={styles.languageInfo}>
                <Text style={styles.languageLabel}>{language.label}</Text>
                <Text style={styles.languageNative}>{language.nativeName}</Text>
              </View>
              {selectedLanguage === language.id && (
                <Ionicons name='checkmark-circle' size={20} color='#00d466' />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Save Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => {
              Alert.alert('Success', 'Language preferences saved!');
              router.back();
            }}
          >
            <Text style={styles.saveButtonText}>Save Language</Text>
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
    marginBottom: 20,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#7a9abf',
    marginBottom: 16,
    lineHeight: 20,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#243656',
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2a4668',
  },
  selectedLanguage: {
    borderColor: '#00d4ff',
    borderWidth: 2,
    backgroundColor: '#2d475a',
  },
  languageFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  languageInfo: {
    flex: 1,
  },
  languageLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  languageNative: {
    fontSize: 12,
    color: '#7a9abf',
    marginTop: 2,
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  saveButton: {
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
