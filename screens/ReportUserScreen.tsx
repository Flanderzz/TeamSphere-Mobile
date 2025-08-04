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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { toast } from 'sonner-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/Navigation';

const reportCategories = [
  { id: 1, title: 'Harassment or Bullying', icon: 'warning' as const },
  { id: 2, title: 'Inappropriate Content', icon: 'block' as const },
  { id: 3, title: 'Spam', icon: 'report' as const },
  { id: 4, title: 'Fake Account', icon: 'person-off' as const },
  { id: 5, title: 'Other', icon: 'more-horiz' as const },
];

type ReportUserScreenProps = NativeStackScreenProps<RootStackParamList, 'ReportUser'>;

export default function ReportUserScreen({ navigation, route }: ReportUserScreenProps) {
  const user = route.params?.user;
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [description, setDescription] = useState('');

  const scrollRef = useRef<ScrollView>(null);
  const descriptionRef = useRef<TextInput>(null);

  const handleDescriptionFocus = () => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSubmit = () => {
    if (!selectedCategory) {
      toast.error('Please select a report category');
      return;
    }

    if (!description.trim()) {
      toast.error('Please provide a description');
      return;
    }

    toast.success('Report submitted successfully');
    navigation.goBack();
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <MaterialIcons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Report User</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>User information not available</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Report User</Text>
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
            <Text style={styles.sectionTitle}>What's the issue?</Text>
            <View style={styles.categoriesContainer}>
              {reportCategories.map((category) => (
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
                    color={selectedCategory === category.id ? '#007AFF' : '#666'} 
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
            />

            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>Submit Report</Text>
            </TouchableOpacity>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
