import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { lightTheme, darkTheme } from '../constants/theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/Navigation';

type NotificationsScreenProps = NativeStackScreenProps<RootStackParamList, 'Notifications'>;

export default function NotificationsScreen({ navigation }: NotificationsScreenProps) {
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;

  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: true,
    soundEnabled: true,
    vibrationEnabled: true,
    messageNotifications: true,
    groupNotifications: true,
    mentionNotifications: true,
    callNotifications: true,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
        <View style={styles.placeholderButton} />
      </View>

      <ScrollView style={styles.content}>
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>General</Text>
          
          <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <MaterialIcons name="notifications" size={24} color={colors.textSecondary} />
            <Text style={[styles.settingText, { color: colors.text }]}>Push Notifications</Text>
            <Switch
              value={settings.pushNotifications}
              onValueChange={() => toggleSetting('pushNotifications')}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={settings.pushNotifications ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <MaterialIcons name="email" size={24} color={colors.textSecondary} />
            <Text style={[styles.settingText, { color: colors.text }]}>Email Notifications</Text>
            <Switch
              value={settings.emailNotifications}
              onValueChange={() => toggleSetting('emailNotifications')}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={settings.emailNotifications ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <MaterialIcons name="volume-up" size={24} color={colors.textSecondary} />
            <Text style={[styles.settingText, { color: colors.text }]}>Sound</Text>
            <Switch
              value={settings.soundEnabled}
              onValueChange={() => toggleSetting('soundEnabled')}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={settings.soundEnabled ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <MaterialIcons name="vibration" size={24} color={colors.textSecondary} />
            <Text style={[styles.settingText, { color: colors.text }]}>Vibration</Text>
            <Switch
              value={settings.vibrationEnabled}
              onValueChange={() => toggleSetting('vibrationEnabled')}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={settings.vibrationEnabled ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Chat Notifications</Text>
          
          <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <MaterialIcons name="chat" size={24} color={colors.textSecondary} />
            <Text style={[styles.settingText, { color: colors.text }]}>Message Notifications</Text>
            <Switch
              value={settings.messageNotifications}
              onValueChange={() => toggleSetting('messageNotifications')}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={settings.messageNotifications ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <MaterialIcons name="group" size={24} color={colors.textSecondary} />
            <Text style={[styles.settingText, { color: colors.text }]}>Group Notifications</Text>
            <Switch
              value={settings.groupNotifications}
              onValueChange={() => toggleSetting('groupNotifications')}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={settings.groupNotifications ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <MaterialIcons name="alternate-email" size={24} color={colors.textSecondary} />
            <Text style={[styles.settingText, { color: colors.text }]}>Mention Notifications</Text>
            <Switch
              value={settings.mentionNotifications}
              onValueChange={() => toggleSetting('mentionNotifications')}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={settings.mentionNotifications ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <MaterialIcons name="call" size={24} color={colors.textSecondary} />
            <Text style={[styles.settingText, { color: colors.text }]}>Call Notifications</Text>
            <Switch
              value={settings.callNotifications}
              onValueChange={() => toggleSetting('callNotifications')}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={settings.callNotifications ? '#fff' : '#f4f3f4'}
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