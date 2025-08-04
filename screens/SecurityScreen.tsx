import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { lightTheme, darkTheme } from '../constants/theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/Navigation';

type SecurityScreenProps = NativeStackScreenProps<RootStackParamList, 'Security'>;

export default function SecurityScreen({ navigation }: SecurityScreenProps) {
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;

  const [settings, setSettings] = useState({
    twoFactorAuth: false,
    biometricAuth: false,
    deviceLock: true,
    messageEncryption: true,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleTwoFactorAuth = () => {
    if (!settings.twoFactorAuth) {
      Alert.alert(
        'Enable Two-Factor Authentication',
        'This will require you to enter a verification code each time you log in. Would you like to proceed?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Enable',
            onPress: () => toggleSetting('twoFactorAuth'),
          },
        ]
      );
    } else {
      Alert.alert(
        'Disable Two-Factor Authentication',
        'Are you sure you want to disable two-factor authentication? This will make your account less secure.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: () => toggleSetting('twoFactorAuth'),
          },
        ]
      );
    }
  };

  const handleBiometricAuth = () => {
    if (!settings.biometricAuth) {
      Alert.alert(
        'Enable Biometric Authentication',
        'This will allow you to use your device\'s biometric features (fingerprint/face) to log in. Would you like to proceed?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Enable',
            onPress: () => toggleSetting('biometricAuth'),
          },
        ]
      );
    } else {
      Alert.alert(
        'Disable Biometric Authentication',
        'Are you sure you want to disable biometric authentication?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: () => toggleSetting('biometricAuth'),
          },
        ]
      );
    }
  };

  const handleChangePassword = () => {
    // TODO: Navigate to change password screen
    Alert.alert('Coming Soon', 'Password change functionality will be available soon.');
  };

  const handleActiveSessions = () => {
    // TODO: Navigate to active sessions screen
    Alert.alert('Coming Soon', 'Active sessions management will be available soon.');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Security</Text>
        <View style={styles.placeholderButton} />
      </View>

      <ScrollView style={styles.content}>
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Authentication</Text>
          
          <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <MaterialIcons name="security" size={24} color={colors.textSecondary} />
            <Text style={[styles.settingText, { color: colors.text }]}>Two-Factor Authentication</Text>
            <Switch
              value={settings.twoFactorAuth}
              onValueChange={handleTwoFactorAuth}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={settings.twoFactorAuth ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <MaterialIcons name="fingerprint" size={24} color={colors.textSecondary} />
            <Text style={[styles.settingText, { color: colors.text }]}>Biometric Authentication</Text>
            <Switch
              value={settings.biometricAuth}
              onValueChange={handleBiometricAuth}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={settings.biometricAuth ? '#fff' : '#f4f3f4'}
            />
          </View>

          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: colors.border }]}
            onPress={handleChangePassword}
          >
            <MaterialIcons name="lock" size={24} color={colors.textSecondary} />
            <Text style={[styles.settingText, { color: colors.text }]}>Change Password</Text>
            <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Device Security</Text>
          
          <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <MaterialIcons name="phone-android" size={24} color={colors.textSecondary} />
            <Text style={[styles.settingText, { color: colors.text }]}>Device Lock</Text>
            <Switch
              value={settings.deviceLock}
              onValueChange={() => toggleSetting('deviceLock')}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={settings.deviceLock ? '#fff' : '#f4f3f4'}
            />
          </View>

          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: colors.border }]}
            onPress={handleActiveSessions}
          >
            <MaterialIcons name="devices" size={24} color={colors.textSecondary} />
            <Text style={[styles.settingText, { color: colors.text }]}>Active Sessions</Text>
            <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Message Security</Text>
          
          <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <MaterialIcons name="enhanced-encryption" size={24} color={colors.textSecondary} />
            <Text style={[styles.settingText, { color: colors.text }]}>End-to-End Encryption</Text>
            <Switch
              value={settings.messageEncryption}
              onValueChange={() => toggleSetting('messageEncryption')}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={settings.messageEncryption ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>
      </ScrollView>
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
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholderButton: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    padding: 16,
    paddingBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  settingText: {
    flex: 1,
    marginLeft: 16,
    fontSize: 16,
  },
}); 