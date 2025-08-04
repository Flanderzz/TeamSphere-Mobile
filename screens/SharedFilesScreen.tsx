import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
  Dimensions,
  Linking,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { toast } from 'sonner-native';
import { RootStackParamList } from '../types/Navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../contexts/ThemeContext';
import { lightTheme, darkTheme } from '../constants/theme';
import * as WebBrowser from 'expo-web-browser';
import { Image as ExpoImage } from 'expo-image';
import { Video, ResizeMode } from 'expo-av';
import { GestureHandlerRootView, PinchGestureHandler, PinchGestureHandlerEventPayload, PinchGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animated, { useAnimatedGestureHandler, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

interface SharedFile {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'image' | 'video';
  size: string;
  date: string;
  sender: string;
  url: string;
}

const mockFiles: SharedFile[] = [
  { id: '1', name: 'Project Report.pdf', type: 'pdf', size: '2.4 MB', date: '2 days ago', sender: 'John Doe', url: 'https://www.cs.tulane.edu/~zzheng3/teaching/cmps6760/spring21/le.pdf' },
  { id: '2', name: 'Meeting Notes.doc', type: 'doc', size: '521 KB', date: '1 week ago', sender: 'Jane Smith', url: 'https://www.cs.tulane.edu/~zzheng3/teaching/cmps6760/spring21/le.pdf' },
  { id: '3', name: 'Presentation.pdf', type: 'pdf', size: '3.1 MB', date: '2 weeks ago', sender: 'Mike Johnson', url: 'https://www.cs.tulane.edu/~zzheng3/teaching/cmps6760/spring21/le.pdf' },
  { id: '4', name: 'Screenshot.png', type: 'image', size: '1.2 MB', date: '3 weeks ago', sender: 'Jane Smith', url: 'https://placehold.co/4000x4000.png' },
  { id: '5', name: 'Product Demo.mp4', type: 'video', size: '15.7 MB', date: '1 month ago', sender: 'John Doe', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
];

type SharedFilesScreenProps = NativeStackScreenProps<RootStackParamList, 'SharedFiles'>;

export default function SharedFilesScreen({ navigation, route }: SharedFilesScreenProps) {
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;
  const [searchQuery, setSearchQuery] = useState('');  
  const [selectedFilters, setSelectedFilters] = useState<Set<string>>(new Set(['pdf', 'doc', 'image', 'video']));
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<SharedFile | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showViewerModal, setShowViewerModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVideoModalVisible, setIsVideoModalVisible] = useState(false);
  const videoRef = useRef<Video>(null);
  const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 });
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const filters = [
    { label: 'PDF Files', value: 'pdf' },
    { label: 'Documents', value: 'doc' },
    { label: 'Images', value: 'image' },
    { label: 'Videos', value: 'video' },
  ];
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const pinchRef = useRef(null);

  const pinchHandler = useAnimatedGestureHandler<
    PinchGestureHandlerGestureEvent,
    { startScale: number }
  >({
    onStart: (_, ctx) => {
      ctx.startScale = scale.value;
    },
    onActive: (event, ctx) => {
      scale.value = ctx.startScale * event.scale;
    },
    onEnd: () => {
      if (scale.value < 1) {
        scale.value = withSpring(1);
      } else if (scale.value > 3) {
        scale.value = withSpring(3);
      }
      savedScale.value = scale.value;
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const filteredFiles = mockFiles.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilters.has(file.type);
    return matchesSearch && matchesFilter;
  });

  const toggleFilter = (value: string) => {
    const newFilters = new Set(selectedFilters);
    if (newFilters.has(value)) {
      newFilters.delete(value);
    } else {
      newFilters.add(value);
    }
    setSelectedFilters(newFilters);
  };

  const handleLongPress = (file: SharedFile) => {
    setSelectedFile(file);
    setShowActionModal(true);
  };

  const handleAction = (action: string) => {
    if (!selectedFile) return;

    switch (action) {
      case 'delete':
        toast.success('File deleted successfully');
        break;
      case 'download':
        toast.success('File downloaded');
        break;
      case 'share':
        toast.success('Sharing options opened');
        break;
      case 'view':
        toast.success('Opening file viewer');
        break;
    }
    setShowActionModal(false);
  };

  const handleFilePress = async (file: SharedFile) => {
    setSelectedFile(file);
    setIsLoading(true);

    try {
      switch (file.type) {
        case 'pdf':
        case 'doc':
          await WebBrowser.openBrowserAsync(file.url, {
            presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
            toolbarColor: theme === 'dark' ? '#1A1A1A' : '#FFFFFF',
            controlsColor: theme === 'dark' ? '#FFFFFF' : '#000000',
          });
          break;
        case 'image':
          setSelectedFile(file);
          setShowViewerModal(true);
          break;
        case 'video':
          setIsVideoModalVisible(true);
          break;
        default:
          Alert.alert('Error', 'Unsupported file type');
      }
    } catch (error) {
      console.error('Error handling file:', error);
      Alert.alert('Error', 'Failed to open file');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateVideoDimensions = (videoWidth: number, videoHeight: number) => {
    const maxWidth = screenWidth * 0.9; // 90% of screen width
    const maxHeight = screenHeight * 0.8; // 80% of screen height
    
    const widthRatio = maxWidth / videoWidth;
    const heightRatio = maxHeight / videoHeight;
    
    // Use the smaller ratio to ensure the video fits within both max dimensions
    const ratio = Math.min(widthRatio, heightRatio);
    
    return {
      width: videoWidth * ratio,
      height: videoHeight * ratio
    };
  };

  const handleVideoLoad = () => {
    if (videoRef.current) {
      videoRef.current.playAsync();
      // Use a default 16:9 aspect ratio if we can't get the actual dimensions
      const dimensions = calculateVideoDimensions(1920, 1080);
      setVideoDimensions(dimensions);
    }
  };

  const renderFile = ({ item }: { item: SharedFile }) => (
    <TouchableOpacity 
      style={[styles.fileItem, { backgroundColor: colors.card }]}
      onPress={() => handleFilePress(item)}
      onLongPress={() => handleLongPress(item)}
      delayLongPress={500}
    >
      <MaterialIcons 
        name={
          item.type === 'pdf' ? 'picture-as-pdf' :
          item.type === 'doc' ? 'description' :
          item.type === 'image' ? 'image' :
          'video-library'
        } 
        size={24} 
        color={colors.textSecondary} 
      />
      <View style={styles.fileInfo}>
        <Text style={[styles.fileName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.fileDetails, { color: colors.textSecondary }]}>
          {item.size} • {item.date} • Sent by {item.sender}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Shared Files</Text>
          <View style={styles.placeholder} />
        </View>    
        <View style={styles.headerContainer}>
          <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
            <MaterialIcons name="search" size={24} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search files..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              keyboardAppearance={theme === 'dark' ? 'dark' : 'light'}
            />
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filtersList}
            contentContainerStyle={styles.filtersContent}
          >
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.value}
                style={[
                  styles.filterChip,
                  { backgroundColor: colors.card },
                  selectedFilters.has(filter.value) && { backgroundColor: colors.primary }
                ]}
                onPress={() => toggleFilter(filter.value)}
              >
                <MaterialIcons 
                  name={
                    filter.value === 'pdf' ? 'picture-as-pdf' :
                    filter.value === 'doc' ? 'description' :
                    filter.value === 'image' ? 'image' :
                    'video-library'
                  } 
                  size={20} 
                  color={selectedFilters.has(filter.value) ? 'white' : colors.textSecondary} 
                />
                <Text style={[
                  styles.filterChipText,
                  { color: colors.textSecondary },
                  selectedFilters.has(filter.value) && { color: 'white' }
                ]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <Modal
          visible={showFilterModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowFilterModal(false)}
        >
          <Pressable 
            style={styles.filterModalOverlay}
            onPress={() => setShowFilterModal(false)}
          >
            <View style={[styles.filterModal, { backgroundColor: colors.card }]}>
              <Text style={[styles.filterModalTitle, { color: colors.text }]}>Filter Files</Text>
              {filters.map((filter, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.filterOption}
                  onPress={() => toggleFilter(filter.value)}
                >
                  <View style={styles.checkboxWrapper}>
                    <View style={[
                      styles.checkbox,
                      { borderColor: colors.border },
                      selectedFilters.has(filter.value) && { backgroundColor: colors.primary, borderColor: colors.primary }
                    ]}>
                      {selectedFilters.has(filter.value) && (
                        <MaterialIcons name="check" size={16} color="white" />
                      )}
                    </View>
                    <Text style={[styles.filterOptionText, { color: colors.text }]}>{filter.label}</Text>
                  </View>
                  <MaterialIcons 
                    name={
                      filter.value === 'pdf' ? 'picture-as-pdf' :
                      filter.value === 'doc' ? 'description' :
                      filter.value === 'image' ? 'image' :
                      'video-library'
                    } 
                    size={24} 
                    color={colors.textSecondary} 
                  />
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Modal>

        <FlatList
          data={filteredFiles}
          renderItem={renderFile}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.filesList}
        />

        <Modal
          visible={showActionModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowActionModal(false)}
        >
          <Pressable 
            style={styles.modalOverlay}
            onPress={() => setShowActionModal(false)}
          >
            <View style={[styles.actionModal, { backgroundColor: colors.card }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>File Options</Text>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleAction('view')}
              >
                <MaterialIcons name="visibility" size={24} color={colors.primary} />
                <Text style={[styles.actionText, { color: colors.text }]}>View Document</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleAction('download')}
              >
                <MaterialIcons name="download" size={24} color={colors.primary} />
                <Text style={[styles.actionText, { color: colors.text }]}>Download</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleAction('share')}
              >
                <MaterialIcons name="share" size={24} color={colors.primary} />
                <Text style={[styles.actionText, { color: colors.text }]}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, { borderTopColor: colors.border }]}
                onPress={() => handleAction('delete')}
              >
                <MaterialIcons name="delete" size={24} color={colors.error} />
                <Text style={[styles.actionText, { color: colors.error }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>

        {/* Image Viewer Modal */}
        <Modal
          visible={showViewerModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowViewerModal(false)}
        >
          <TouchableOpacity 
            style={[styles.modalContainer, { backgroundColor: 'rgba(0, 0, 0, 0.9)' }]}
            activeOpacity={1}
            onPress={() => setShowViewerModal(false)}
          >
            <TouchableOpacity 
              activeOpacity={1} 
              onPress={(e) => e.stopPropagation()}
              style={styles.viewerContainer}
            >
              {selectedFile?.type === 'image' && (
                <PinchGestureHandler
                  ref={pinchRef}
                  onGestureEvent={pinchHandler}
                  onHandlerStateChange={pinchHandler}
                >
                  <Animated.View style={[styles.imageContainer, animatedStyle]}>
                    <ExpoImage
                      source={{ uri: selectedFile.url }}
                      style={styles.viewerImage}
                      contentFit="contain"
                      transition={200}
                      cachePolicy="memory-disk"
                    />
                  </Animated.View>
                </PinchGestureHandler>
              )}
              <TouchableOpacity
                style={styles.viewerCloseButton}
                onPress={() => setShowViewerModal(false)}
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        {/* Loading Modal */}
        <Modal
          visible={isLoading}
          transparent
          animationType="fade"
        >
          <View style={styles.modalContainer}>
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.modalText, { color: colors.text }]}>
                Opening file...
              </Text>
            </View>
          </View>
        </Modal>

        {/* Video Player Modal */}
        <Modal
          visible={isVideoModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setIsVideoModalVisible(false)}
        >
          <TouchableOpacity 
            style={[styles.modalContainer, { backgroundColor: 'rgba(0, 0, 0, 0.7)' }]}
            activeOpacity={1}
            onPress={() => setIsVideoModalVisible(false)}
          >
            <TouchableOpacity 
              activeOpacity={1} 
              onPress={(e) => e.stopPropagation()}
              style={styles.videoWrapper}
            >
              <View style={[
                styles.videoHeader,
                {
                  width: videoDimensions.width || '90%',
                  backgroundColor: 'transparent',
                }
              ]}>
                <Text style={[styles.videoTitle, { color: '#FFFFFF' }]}>
                  {selectedFile?.name}
                </Text>
                <TouchableOpacity
                  onPress={() => setIsVideoModalVisible(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              <View style={[
                styles.videoModalContent,
                {
                  backgroundColor: colors.card,
                  width: videoDimensions.width || '90%',
                  height: videoDimensions.height || '80%',
                }
              ]}>
                {selectedFile?.url && (
                  <Video
                    ref={videoRef}
                    source={{ uri: selectedFile.url }}
                    style={[styles.video, { width: '100%', height: '100%' }]}
                    useNativeControls
                    resizeMode={ResizeMode.CONTAIN}
                    isLooping={false}
                    shouldPlay={true}
                    isMuted={false}
                    onLoad={handleVideoLoad}
                  />
                )}
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      </SafeAreaView>
    </GestureHandlerRootView>
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
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  headerContainer: {
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  filtersList: {
    marginBottom: 8,
  },
  filtersContent: {
    paddingRight: 16,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterChipText: {
    marginLeft: 4,
    fontSize: 14,
  },
  filesList: {
    padding: 16,
    paddingTop: 8,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  fileInfo: {
    marginLeft: 12,
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  fileDetails: {
    fontSize: 14,
    color: '#666',
  },
  filterModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterModal: {
    width: '80%',
    borderRadius: 12,
    padding: 20,
  },
  filterModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  checkboxWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterOptionText: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  actionModal: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  actionText: {
    fontSize: 16,
    marginLeft: 12,
  },
  viewerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewerImage: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    maxWidth: '100%',
    maxHeight: '100%',
  },
  viewerCloseButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    padding: 8,
    zIndex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
  },
  videoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoModalContent: {
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 16,
  },
  closeButton: {
    padding: 4,
  },
  video: {
    width: '100%',
    height: '100%',
  },
});