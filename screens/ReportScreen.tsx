import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Image,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/Navigation';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../contexts/ThemeContext';
import { lightTheme, darkTheme } from '../constants/theme';

type ReportScreenProps = NativeStackScreenProps<RootStackParamList, 'Report'>;

const userReportCategories = [
  { id: 1, title: 'Harassment or Bullying', icon: 'warning' as const },
  { id: 2, title: 'Inappropriate Content', icon: 'block' as const },
  { id: 3, title: 'Spam', icon: 'report' as const },
  { id: 4, title: 'Fake Account', icon: 'person-off' as const },
  { id: 5, title: 'Other', icon: 'more-horiz' as const },
];

const bugReportCategories = [
  { id: 1, title: 'App Crash', icon: 'error' as const },
  { id: 2, title: 'Feature Not Working', icon: 'build' as const },
  { id: 3, title: 'UI/UX Issue', icon: 'palette' as const },
  { id: 4, title: 'Performance', icon: 'speed' as const },
  { id: 5, title: 'Bug Bounty', icon: 'bug-report' as const},
  { id: 6, title: 'Other', icon: 'more-horiz' as const }
];

export default function ReportScreen({ navigation, route }: ReportScreenProps) {
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;
  const { type, user } = route.params;
  const MAX_ALLOWED_IMAGES = type === 'user' ? 10 : 5;
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [deviceInfo, setDeviceInfo] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const scrollRef = useRef<ScrollView>(null);
  const descriptionRef = useRef<TextInput>(null);

  const categories = type === 'user' ? userReportCategories : bugReportCategories;

  const getCategoryColor = (category: string): string => {
    switch (category) {
        case 'Harassment or Bullying':
            return '#fe7118'; 
        case 'Inappropriate Content':
            return '#ff0046';
        case 'Spam':
            return '#f9d822';
        case 'Fake Account':
            return '#bc2ed1'; 
        case 'App Crash':
            return '#E53935';
        case 'Feature Not Working':
            return '#FB8C00';
        case 'UI/UX Issue':
            return '#AB47BC';
        case 'Performance':
            return '#00C853';
        case 'Bug Bounty':
            return '#ff6666';
        default:
            return '#007AFF';
    }
}

  const handleDescriptionFocus = () => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleBlockUser = () => {
    // Here you would implement the block user functionality
    console.log('Blocking user:', user?.username);
    
    // Reset navigation stack and go to home screen
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  const handleSubmit = async () => {
    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a category');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Please provide a description of the issue');
      return;
    }

    try {
      // Here you would typically upload the image to your server
      // and get back a URL or file reference
      const imageUrl = selectedImages.length > 0 ? Promise.all(selectedImages.map(async (img) => await uploadImage(img))) : null;

      // Create the report object
      const report = {
        type: type,
        category: selectedCategory,
        description: description.trim(),
        imageUrl,
        deviceInfo: '',
        timestamp: new Date().toISOString(),
      };

      // Here you would typically send the report to your backend
      console.log('Submitting report:', report);

      // Show success message with block option if reporting a user
      if (type === 'user' && user) {
        Alert.alert(
          'Report Submitted',
          'Would you like to block this user?',
          [
            {
              text: 'No',
              style: 'cancel',
              onPress: () => navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
              }),
            },
            {
              text: 'Yes, Block User',
              style: 'destructive',
              onPress: handleBlockUser,
            },
          ]
        );
      } else {
        Alert.alert(
          'Success',
          'Your report has been submitted successfully',
          [
            {
              text: 'OK',
              onPress: () => navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
              }),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    }
  };

  const handleImagePick = async () => {
    try {
      const remainingSlots = MAX_ALLOWED_IMAGES - selectedImages.length;
      if (remainingSlots <= 0) {
        Alert.alert('Maximum Images Reached', `You can only add up to ${MAX_ALLOWED_IMAGES} images.`);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 1,
        allowsMultipleSelection: true,
        selectionLimit: remainingSlots,
      });

      if (!result.canceled && result.assets.length > 0) {
        // Check if adding new images would exceed the limit
        const totalImages = selectedImages.length + result.assets.length;
        if (totalImages > MAX_ALLOWED_IMAGES) {
          Alert.alert(
            'Too Many Images',
            `You can only add ${remainingSlots} more image${remainingSlots === 1 ? '' : 's'}.`
          );
          return;
        }

        // Add new images to the existing ones
        const newImages = result.assets.map(asset => asset.uri);
        setSelectedImages([...selectedImages, ...newImages]);
      }
    } catch (error) {
      console.error('Error picking images:', error);
      Alert.alert('Error', 'Failed to pick images. Please try again.');
    }
  };

  const handleTakePhoto = async () => {
    try {
      if (selectedImages.length >= MAX_ALLOWED_IMAGES) {
        Alert.alert('Maximum Images Reached', `You can only add up to ${MAX_ALLOWED_IMAGES} images.`);
        return;
      }

      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please allow camera access to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImages([...selectedImages, result.assets[0].uri]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  const handleImagePress = (imageUri: string) => {
    setPreviewImage(imageUri);
  };

  const uploadImage = async (uri: string): Promise<string> => {
    // Here you would implement the actual image upload logic
    // For now, we'll just return the local URI
    console.log(uri);
    return uri;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>
          {type === 'user' ? 'Report User' : 'Report Bug'}
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView 
            ref={scrollRef}
            style={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            {type === 'user' && user && (
            <View style={styles.userInfo}>
                <Text style={styles.userTitle}>Reporting {user.username}</Text>
                <Text style={styles.reportPersonText}>
                <Text style={styles.boldText}>ALL</Text> reports will be kept confidential. If you or someone you know is in <Text style={styles.boldText}>immediate danger, please call your local emergency services</Text> – don't wait.
                </Text>
            </View>
            )}


            <Text style={styles.sectionTitle}>What's the issue?</Text>
            <View style={styles.categoriesContainer}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category.id && styles.selectedCategory
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <MaterialIcons 
                    name={category.icon} 
                    size={24} 
                    color={selectedCategory === category.id ? getCategoryColor(category.title) : '#807f7f'} 
                  />
                  <Text style={[
                    styles.categoryText,
                    selectedCategory === category.id && styles.selectedCategoryText
                  ]}>
                    {category.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Additional Details</Text>
            <TextInput
              ref={descriptionRef}
              style={styles.descriptionInput}
              placeholder="Please provide more details about the issue..."
              placeholderTextColor="#666"
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
              onFocus={handleDescriptionFocus}
              keyboardAppearance={theme === 'dark' ? 'dark' : 'light'}
            />

            <Text style={styles.sectionTitle}>Attachments</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.attachmentsScrollView}
            >
              <View style={styles.attachmentsContainer}>
                {selectedImages.map((uri, index) => (
                  <View key={index} style={styles.attachmentItem}>
                    <TouchableOpacity
                      onPress={() => handleImagePress(uri)}
                      style={styles.attachmentImageContainer}
                    >
                      <Image source={{ uri }} style={styles.attachmentImage} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.removeAttachment}
                      onPress={() => handleRemoveImage(index)}
                    >
                      <MaterialIcons name="close" size={20} color="white" />
                    </TouchableOpacity>
                  </View>
                ))}
                {selectedImages.length < MAX_ALLOWED_IMAGES && (
                  <TouchableOpacity
                    style={styles.addAttachment}
                    onPress={handleImagePick}
                  >
                    <MaterialIcons name="add-photo-alternate" size={24} color="#007AFF" />
                    <Text style={styles.addAttachmentText}>
                      {selectedImages.length === 0 ? 'Add Photos' : 'Add More'}
                    </Text>
                    <Text style={styles.remainingSlots}>
                      {MAX_ALLOWED_IMAGES - selectedImages.length} remaining
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>

            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>Submit Report</Text>
            </TouchableOpacity>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Image Preview Modal */}
      <Modal
        visible={!!previewImage}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPreviewImage(null)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setPreviewImage(null)}
        >
          <View style={styles.modalContent}>
            {previewImage && (
              <Image 
                source={{ uri: previewImage }} 
                style={styles.previewImage}
                resizeMode="contain"
              />
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E1E1',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  userInfo: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  userTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  categoriesContainer: {
    marginBottom: 24,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  selectedCategory: {
    backgroundColor: '#E3F2FD',
  },
  categoryText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#666',
  },
  selectedCategoryText: {
    color: '#007AFF',
  },
  descriptionInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 24,
  },
  attachmentsScrollView: {
    marginBottom: 24,
  },
  reportPersonText: {
    color: '#939296',
    paddingTop: 5
  },
  attachmentsContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  attachmentItem: {
    marginRight: 12,
    position: 'relative',
  },
  attachmentImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
  },
  attachmentImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeAttachment: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  addAttachment: {
    width: 100,
    height: 100,
    backgroundColor: 'white',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E1E1E1',
    borderStyle: 'dashed',
  },
  addAttachmentText: {
    marginTop: 4,
    fontSize: 12,
    color: '#007AFF',
  },
  remainingSlots: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    height: '80%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  boldText: {
    fontWeight: 'bold',
    color: 'black'
  },  
  previewImage: {
    width: '100%',
    height: '100%',
  },
}); 