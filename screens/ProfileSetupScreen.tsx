import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { toast } from 'sonner-native';

type Props = {
  email: string;
  password: string;
  onComplete: (data: { username: string; profileImage: string }) => void;
  onBack: () => void;
  loading?: boolean;
}

export default function ProfileSetupScreen({ 
  email, 
  password,
  onComplete,
  onBack,
  loading = false
}: Props) {
  const [username, setUsername] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photo library to select a profile picture.',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        
        // Check file size (if available)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (asset.fileSize && asset.fileSize > maxSize) {
          toast.error('Image size must be less than 10MB');
          return;
        }

        setProfileImage(asset.uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      toast.error('Failed to select image. Please try again.');
    }
  };

  const takePicture = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow camera access to take a profile picture.',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setProfileImage(asset.uri);
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      toast.error('Failed to take picture. Please try again.');
    }
  };

  const showImagePicker = () => {
    Alert.alert(
      'Select Profile Picture',
      'Choose how you want to add your profile picture',
      [
        { text: 'Camera', onPress: takePicture },
        { text: 'Photo Library', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };
  
  const { signIn } = useAuth();  
  
  const handleComplete = async () => {
    if (!username.trim()) {
      toast.error('Please enter a username');
      return;
    }
    
    if (username.length < 3) {
      toast.error('Username must be at least 3 characters');
      return;
    }

    if (username.length > 30) {
      toast.error('Username must be less than 30 characters');
      return;
    }

    // Check if username contains only allowed characters
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      toast.error('Username can only contain letters, numbers, and underscores');
      return;
    }
    
    if (!profileImage) {
      toast.error('Please select a profile photo');
      return;
    }

    // Call the parent's onComplete function which handles the actual signup
    onComplete({ username, profileImage });
  };

  const checkUsername = () => {
    if (!username.trim() || username.length < 3) return;
    
    setIsCheckingUsername(true);
    // TODO: Implement actual username availability check
    setTimeout(() => {
      setIsCheckingUsername(false);
      toast.success('Username is available!');
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={onBack}
        disabled={loading}
      >
        <MaterialIcons name="arrow-back" size={24} color="#007AFF" />
      </TouchableOpacity>

      <Text style={styles.title}>Complete your profile</Text>
      <Text style={styles.subtitle}>Choose a unique username and add a profile photo</Text>

      <TouchableOpacity 
        style={styles.imageContainer} 
        onPress={showImagePicker}
        disabled={loading}
      >
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.profileImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <MaterialIcons name="add-a-photo" size={32} color="#666" />
            <Text style={styles.uploadText}>Upload photo</Text>
          </View>
        )}
      </TouchableOpacity>

      {profileImage && (
        <TouchableOpacity 
          style={styles.changePictureButton}
          onPress={showImagePicker}
          disabled={loading}
        >
          <Text style={styles.changePictureText}>Change Picture</Text>
        </TouchableOpacity>
      )}

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Username</Text>
        <View style={styles.usernameContainer}>
          <TextInput
            style={[styles.input, loading && styles.inputDisabled]}
            value={username}
            onChangeText={setUsername}
            placeholder="Choose a username"
            placeholderTextColor="#666666"
            autoCapitalize="none"
            onEndEditing={checkUsername}
            editable={!loading}
            maxLength={30}
          />
          {isCheckingUsername && (
            <MaterialIcons name="refresh" size={24} color="#666" style={{ marginLeft: 8 }} />
          )}
        </View>
      </View>

      <TouchableOpacity 
        style={[
          styles.button,
          ((!username.trim() || !profileImage) || loading) && styles.buttonDisabled
        ]} 
        onPress={handleComplete}
        disabled={(!username.trim() || !profileImage) || loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Creating Account...' : 'Complete Setup'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
    padding: 20,
  },
  backButton: {
    marginTop: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1A1A1A',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  imageContainer: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E1E1E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadText: {
    color: '#666',
    marginTop: 8,
    fontSize: 14,
  },
  changePictureButton: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  changePictureText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  inputDisabled: {
    color: '#999',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#B0B0B0',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});