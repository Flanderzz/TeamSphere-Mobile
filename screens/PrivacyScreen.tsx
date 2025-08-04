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

type PrivacyScreenProps = NativeStackScreenProps<RootStackParamList, 'Privacy'>;

export default function PrivacyScreen({ navigation }: PrivacyScreenProps) {
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;

  const [settings, setSettings] = useState({
    onlineStatus: true,
    readReceipts: true,
    typingIndicator: true,
    lastSeen: true,
    profileVisibility: true,
    messageRequests: true,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleBlockedContacts = () => {
    // TODO: Navigate to blocked contacts screen
    Alert.alert('Coming Soon', 'Blocked contacts management will be available soon.');
  };

  const handleDataExport = () => {
    // TODO: Implement data export functionality
    Alert.alert('Coming Soon', 'Data export functionality will be available soon.');
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Privacy</Text>
        <View style={styles.placeholderButton} />
      </View>

      <ScrollView style={styles.content}>
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Visibility</Text>
          
          <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <MaterialIcons name="visibility" size={24} color={colors.textSecondary} />
            <Text style={[styles.settingText, { color: colors.text }]}>Online Status</Text>
            <Switch
              value={settings.onlineStatus}
              onValueChange={() => toggleSetting('onlineStatus')}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={settings.onlineStatus ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <MaterialIcons name="done-all" size={24} color={colors.textSecondary} />
            <Text style={[styles.settingText, { color: colors.text }]}>Read Receipts</Text>
            <Switch
              value={settings.readReceipts}
              onValueChange={() => toggleSetting('readReceipts')}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={settings.readReceipts ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <MaterialIcons name="keyboard" size={24} color={colors.textSecondary} />
            <Text style={[styles.settingText, { color: colors.text }]}>Typing Indicator</Text>
            <Switch
              value={settings.typingIndicator}
              onValueChange={() => toggleSetting('typingIndicator')}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={settings.typingIndicator ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <MaterialIcons name="access-time" size={24} color={colors.textSecondary} />
            <Text style={[styles.settingText, { color: colors.text }]}>Last Seen</Text>
            <Switch
              value={settings.lastSeen}
              onValueChange={() => toggleSetting('lastSeen')}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={settings.lastSeen ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <MaterialIcons name="person" size={24} color={colors.textSecondary} />
            <Text style={[styles.settingText, { color: colors.text }]}>Profile Visibility</Text>
            <Switch
              value={settings.profileVisibility}
              onValueChange={() => toggleSetting('profileVisibility')}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={settings.profileVisibility ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Messages</Text>
          
          <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <MaterialIcons name="message" size={24} color={colors.textSecondary} />
            <Text style={[styles.settingText, { color: colors.text }]}>Message Requests</Text>
            <Switch
              value={settings.messageRequests}
              onValueChange={() => toggleSetting('messageRequests')}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={settings.messageRequests ? '#fff' : '#f4f3f4'}
            />
          </View>

          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: colors.border }]}
            onPress={handleBlockedContacts}
          >
            <MaterialIcons name="block" size={24} color={colors.textSecondary} />
            <Text style={[styles.settingText, { color: colors.text }]}>Blocked Contacts</Text>
            <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Data</Text>
          
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: colors.border }]}
            onPress={handleDataExport}
          >
            <MaterialIcons name="file-download" size={24} color={colors.textSecondary} />
            <Text style={[styles.settingText, { color: colors.text }]}>Export Data</Text>
            <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
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