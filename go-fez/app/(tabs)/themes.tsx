import { useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ThemesScreen() {
  const [selectedTheme, setSelectedTheme] = useState('dark');

  const themes = [
    { id: 'light', label: 'Light', icon: 'sunny' },
    { id: 'dark', label: 'Dark', icon: 'moon' },
    { id: 'auto', label: 'Auto', icon: 'sync' },
  ];

  const colorThemes = [
    { id: 'cyan', label: 'Cyan', color: '#00d4ff' },
    { id: 'green', label: 'Green', color: '#00d466' },
    { id: 'purple', label: 'Purple', color: '#b366ff' },
    { id: 'orange', label: 'Orange', color: '#ff8c00' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Themes</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Theme Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Theme</Text>
          {themes.map((theme) => (
            <TouchableOpacity
              key={theme.id}
              style={[
                styles.themeItem,
                selectedTheme === theme.id && styles.selectedTheme,
              ]}
              onPress={() => setSelectedTheme(theme.id)}
            >
              <Ionicons name={theme.icon as any} size={24} color='#00d4ff' />
              <Text style={styles.themeLabel}>{theme.label}</Text>
              {selectedTheme === theme.id && (
                <Ionicons name='checkmark' size={20} color='#00d466' />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Color Theme Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Accent Color</Text>
          <View style={styles.colorGrid}>
            {colorThemes.map((theme) => (
              <TouchableOpacity
                key={theme.id}
                style={[styles.colorOption, { backgroundColor: theme.color }]}
                onPress={() =>
                  Alert.alert(
                    'Theme Changed',
                    `Accent color changed to ${theme.label}`
                  )
                }
              >
                <Text style={styles.colorLabel}>{theme.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a4668',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7a9abf',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  themeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#243656',
    marginBottom: 8,
    borderRadius: 8,
  },
  selectedTheme: {
    borderWidth: 2,
    borderColor: '#00d4ff',
  },
  themeLabel: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 12,
    flex: 1,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: '48%',
    paddingVertical: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
});
