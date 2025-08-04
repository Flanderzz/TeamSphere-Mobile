import React, { useState } from 'react';
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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { lightTheme, darkTheme } from '../constants/theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/Navigation';
import { toast } from 'sonner-native';
import * as ImagePicker from 'expo-image-picker';

type ProfileSettingsScreenProps = NativeStackScreenProps<RootStackParamList, 'ProfileSettings'>;

export default function ProfileSettingsScreen({ navigation }: ProfileSettingsScreenProps) {
  const { user, updateUser } = useAuth();
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [profileChange, setProfileChange] = useState(false);

  const handleUpdateProfile = async () => {
    try {
      await updateUser({ ...user, name });
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleEmailVerification = () => {
    // TODO: Implement email verification
    toast.success('Verification email sent!');
    setShowEmailModal(false);
  };

  const handleDeleteAccount = () => {
    // TODO: Implement account deletion
    toast.success('Account deletion initiated');
    setShowDeleteModal(false);
  };

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        // TODO: Implement image upload
        toast.success('Profile picture updated!');
      }
    } catch (error) {
      toast.error('Failed to update profile picture');
    }
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
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.text }]}>Profile Settings</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.profileSection}>
          <TouchableOpacity onPress={handleImagePick} style={styles.profileImageContainer}>
            <Image 
              source={{ uri: user?.avatar || 'https://via.placeholder.com/100' }} 
              style={styles.profileImage} 
            />
            <View style={[styles.editOverlay, { backgroundColor: colors.primary + '80' }]}>
              <MaterialIcons name="edit" size={24} color="white" />
            </View>
          </TouchableOpacity>
          <Text style={[styles.profileName, { color: colors.text }]}>{user?.name || 'Your Name'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Personal Information</Text>
          <View style={[styles.optionsContainer, { backgroundColor: colors.surface }]}>
            <View style={[styles.inputContainer, { borderBottomColor: colors.border }]}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Name</Text>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor={colors.textSecondary}
                keyboardAppearance={theme === 'dark' ? 'dark' : 'light'}
              />
            </View>

            <View style={[styles.inputContainer, { borderBottomColor: colors.border }]}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Email</Text>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor={colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                keyboardAppearance={theme === 'dark' ? 'dark' : 'light'}
              />
              <TouchableOpacity 
                style={[styles.verifyButton, { backgroundColor: colors.primary }]}
                onPress={() => setShowEmailModal(true)}
              >
                <Text style={styles.verifyButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity 
            style={[styles.saveButton, { backgroundColor: colors.primary }]}
            onPress={() => {
              // TODO: Implement save functionality
              toast.success('Changes saved successfully!');
            }}
          >
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Account Settings</Text>
          <View style={[styles.optionsContainer, { backgroundColor: colors.surface }]}>
            <TouchableOpacity 
              style={[styles.settingItem, { borderBottomColor: colors.border }]}
              onPress={() => navigation.navigate('Notifications')}
            >
              <MaterialIcons name="notifications" size={24} color={colors.textSecondary} />
              <Text style={[styles.settingText, { color: colors.text }]}>Notifications</Text>
              <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.settingItem, { borderBottomColor: colors.border }]}
              onPress={() => navigation.navigate('Privacy')}
            >
              <MaterialIcons name="privacy-tip" size={24} color={colors.textSecondary} />
              <Text style={[styles.settingText, { color: colors.text }]}>Privacy</Text>
              <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.settingItem, { borderBottomColor: colors.border }]}
              onPress={() => navigation.navigate('Security')}
            >
              <MaterialIcons name="security" size={24} color={colors.textSecondary} />
              <Text style={[styles.settingText, { color: colors.text }]}>Security</Text>
              <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.deleteButton, { backgroundColor: colors.error + '20' }]}
          onPress={() => setShowDeleteModal(true)}
        >
          <MaterialIcons name="delete" size={24} color={colors.error} />
          <Text style={[styles.deleteButtonText, { color: colors.error }]}>Delete Account</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Email Verification Modal */}
      <Modal
        visible={showEmailModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowEmailModal(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowEmailModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <MaterialIcons name="email" size={48} color={colors.primary} style={styles.modalIcon} />
            <Text style={[styles.modalTitle, { color: colors.text }]}>Verify Your Email</Text>
            <Text style={[styles.modalMessage, { color: colors.textSecondary }]}>
              We'll send a verification link to your email address. Please check your inbox and follow the instructions to verify your email.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalCancelButton, { backgroundColor: colors.background }]}
                onPress={() => setShowEmailModal(false)}
              >
                <Text style={[styles.modalCancelText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalConfirmButton, { backgroundColor: colors.primary }]}
                onPress={handleEmailVerification}
              >
                <Text style={styles.modalConfirmText}>Send Verification</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* Account Deletion Modal */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowDeleteModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <MaterialIcons name="warning" size={48} color={colors.error} style={styles.modalIcon} />
            <Text style={[styles.modalTitle, { color: colors.text }]}>Delete Account?</Text>
            <Text style={[styles.modalMessage, { color: colors.textSecondary }]}>
              This action cannot be undone. All your data will be permanently deleted. We'll send a confirmation email to complete the process.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalCancelButton, { backgroundColor: colors.background }]}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={[styles.modalCancelText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalDeleteButton, { backgroundColor: colors.error }]}
                onPress={handleDeleteAccount}
              >
                <Text style={styles.modalDeleteText}>Delete Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
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
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 16,
    marginHorizontal: 16,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 12,
},
    profileImage: {

    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
  },
//   profileImage: {
//     width: '100%',
//     height: '100%',
//   },
  editOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '600',
  },
  section: {
    marginBottom: 16,
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
  inputContainer: {
    padding: 16,
    borderBottomWidth: 1,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    padding: 0,
  },
  verifyButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    margin: 16,
    borderRadius: 12,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  modalIcon: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalCancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  modalConfirmButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalConfirmText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalDeleteButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center',
  },
  modalDeleteText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 