import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Modal,
  Pressable,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useTheme } from '../contexts/ThemeContext';
import { lightTheme, darkTheme } from '../constants/theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/Navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';

type SettingsScreenProps = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const { user, updateUser, signOut } = useAuth();
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileImage, setProfileImage] = useState(user?.avatar || null);
  const [isEditing, setIsEditing] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [dontAskAgain, setDontAskAgain] = useState(false);
  const { theme, themeMode, setThemeMode, colors } = useTheme();
  const systemTheme = Appearance.getColorScheme();

  useEffect(() => {
    // Load the "Don't ask again" preference
    const loadPreference = async () => {
      try {
        const value = await AsyncStorage.getItem('dontAskSignOut');
        if (value !== null) {
          setDontAskAgain(JSON.parse(value));
        }
      } catch (error) {
        console.error('Error loading preference:', error);
      }
    };
    loadPreference();
  }, []);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemTheme(colorScheme);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      // Save the "Don't ask again" preference
      if (dontAskAgain) {
        await AsyncStorage.setItem('dontAskSignOut', JSON.stringify(true));
      }
      
      await signOut();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to logout');
    }
  }, [signOut, dontAskAgain]);

  const handleSignOutPress = () => {
    if (dontAskAgain) {
      handleLogout();
    } else {
      setShowLogoutModal(true);
    }
  };

  const pickImage = async (source: 'camera' | 'library') => {
    try {
      let permissionResult;
      if (source === 'camera') {
        permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      } else {
        permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      }
      
      if (permissionResult.status !== 'granted') {
        toast.error(`We need ${source === 'camera' ? 'camera' : 'gallery'} permissions`);
        return;
      }

      const result = await (source === 'camera' 
        ? ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
          })
        : ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
          }));

      if (!result.canceled) {
        const { uri } = result.assets[0];
        
        // Resize and compress the image
        const manipulatedImage = await ImageManipulator.manipulateAsync(
          uri,
          [{ resize: { width: 500, height: 500 } }],
          { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
        );

        setProfileImage(manipulatedImage.uri);
        toast.success('Profile picture updated');
      }
    } catch (error) {
      toast.error('Error processing image');
      console.error('Image processing error:', error);
    } finally {
      setShowImagePicker(false);
    }
  };

  const handleSave = async () => {
    if (!username.trim()) {
      toast.error('Username cannot be empty');
      return;
    }

    try {
      await updateUser({
        ...user,
        username,
        email,
        avatar: profileImage,
      });
      
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleThemeChange = async (newTheme: 'light' | 'dark' | 'system') => {
    await setThemeMode(newTheme);
  };

  const settingsOptions = [
    {
      title: 'Account',
      options: [
        { label: 'Edit Profile', icon: 'person', onPress: () => navigation.navigate('ProfileSettings') },
        { label: 'Change Password', icon: 'lock', onPress: () => {} },
      ],
    },
    {
      title: 'Preferences',
      options: [
        // { label: 'Theme', icon: 'palette', onPress: () => navigation.navigate('ThemeSettings') },
        { label: 'Notifications', icon: 'notifications', onPress: () => navigation.navigate('Notifications') },
        { label: 'Language', icon: 'language', onPress: () => {} },
      ],
    },
    {
      title: 'Support',
      options: [
        { label: 'Help Center', icon: 'help', onPress: () => {} },
        { label: 'Report a Problem', icon: 'report', onPress: () => navigation.navigate('Report', { type: 'bug' }) },
      ],
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
        </View>
      </View>

      {/* Sign Out Modal */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Sign Out</Text>
            <Text style={[styles.modalText, { color: colors.textSecondary }]}>
              Are you sure you want to sign out?
            </Text>
            
            <View style={styles.dontAskContainer}>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setDontAskAgain(!dontAskAgain)}
              >
                <View style={[
                  styles.checkbox,
                  { 
                    backgroundColor: dontAskAgain ? colors.primary : 'transparent',
                    borderColor: colors.border
                  }
                ]}>
                  {dontAskAgain && (
                    <MaterialIcons name="check" size={16} color={colors.background} />
                  )}
                </View>
                <Text style={[styles.dontAskText, { color: colors.text }]}>
                  Don't ask again
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={[styles.buttonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.signOutButton]}
                onPress={handleLogout}
              >
                <Text style={[styles.buttonText, { color: colors.error }]}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView style={styles.content}>
        {settingsOptions.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              {section.title}
            </Text>
            <View style={[styles.optionsContainer, { backgroundColor: colors.surface }]}>
              {section.options.map((option, optionIndex) => (
                <TouchableOpacity
                  key={optionIndex}
                  style={[
                    styles.option,
                    optionIndex !== section.options.length - 1 && { borderBottomColor: colors.border }
                  ]}
                  onPress={option.onPress}
                >
                  <View style={styles.optionLeft}>
                    <MaterialIcons name={option.icon} size={24} color={colors.text} />
                    <Text style={[styles.optionText, { color: colors.text }]}>
                      {option.label}
                    </Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Theme Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Theme</Text>
          <View style={[styles.optionsContainer, { backgroundColor: colors.surface }]}>
            <TouchableOpacity
              style={[styles.option, { borderBottomWidth: 1, borderBottomColor: colors.border }]}
              onPress={() => setThemeMode('light')}
            >
              <View style={styles.optionLeft}>
                <MaterialIcons name="light-mode" size={24} color={colors.text} />
                <Text style={[styles.optionText, { color: colors.text }]}>Light</Text>
              </View>
              {themeMode === 'light' && (
                <MaterialIcons name="check" size={24} color={colors.primary} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.option, { borderBottomWidth: 1, borderBottomColor: colors.border }]}
              onPress={() => setThemeMode('dark')}
            >
              <View style={styles.optionLeft}>
                <MaterialIcons name="dark-mode" size={24} color={colors.text} />
                <Text style={[styles.optionText, { color: colors.text }]}>Dark</Text>
              </View>
              {themeMode === 'dark' && (
                <MaterialIcons name="check" size={24} color={colors.primary} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.option, { borderBottomWidth: 0 }]}
              onPress={() => setThemeMode('system')}
            >
              <View style={styles.optionLeft}>
                <MaterialIcons name="settings" size={24} color={colors.text} />
                <View>
                  <Text style={[styles.optionText, { color: colors.text }]}>System</Text>
                  <Text style={[styles.optionSubtext, { color: colors.textSecondary }]}>
                    {systemTheme === 'dark' ? 'Dark mode' : 'Light mode'}
                  </Text>
                </View>
              </View>
              {themeMode === 'system' && (
                <MaterialIcons name="check" size={24} color={colors.primary} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign Out Section */}
        <View style={styles.section}>
          <View style={[styles.optionsContainer, { backgroundColor: colors.surface }]}>
            <TouchableOpacity
              style={[styles.option, { borderBottomWidth: 0 }]}
              onPress={handleSignOutPress}
            >
              <View style={styles.optionLeft}>
                <MaterialIcons name="logout" size={24} color={colors.error} />
                <Text style={[styles.optionText, { color: colors.error }]}>
                  Sign Out
                </Text>
              </View>
            </TouchableOpacity>
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
    marginRight: 40, // To offset the back button and center the title
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 16,
  },
  optionsContainer: {
    borderRadius: 12,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    marginLeft: 12,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  dontAskContainer: {
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dontAskText: {
    fontSize: 13,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    marginRight: 8,
    backgroundColor: 'transparent',
  },
  signOutButton: {
    marginLeft: 8,
    backgroundColor: 'transparent',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  optionSubtext: {
    fontSize: 12,
    marginTop: 4,
  },
});