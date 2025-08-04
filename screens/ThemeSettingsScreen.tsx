// DEPRICATED PAGE, DELETE SOON

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { lightTheme, darkTheme } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/Navigation';

type ThemeSettingsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ThemeSettings'
>;

type Props = {
  navigation: ThemeSettingsScreenNavigationProp;
};

export default function ThemeSettingsScreen({ navigation }: Props) {
  const { theme, themeMode, setThemeMode } = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;

  const options = [
    { label: 'System Default', value: 'system' },
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.text }]}>Theme</Text>
        </View>
      </View>

      <View style={styles.content}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.option,
              { 
                backgroundColor: colors.surface,
                borderBottomColor: colors.border,
              }
            ]}
            onPress={() => setThemeMode(option.value as 'light' | 'dark' | 'system')}
          >
            <Text style={[styles.optionText, { color: colors.text }]}>
              {option.label}
            </Text>
            {themeMode === option.value && (
              <MaterialIcons name="check" size={24} color={colors.primary} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    marginRight: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 16,
  },
}); 