import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  Switch,
  Modal,
  Pressable,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { toast } from 'sonner-native';
import { User } from '../types/User';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/Navigation';
import { useTheme } from '../contexts/ThemeContext';
import { lightTheme, darkTheme } from '../constants/theme';

type NewChatScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'NewChat'
>;

type Props = {
  navigation: NewChatScreenNavigationProp;
};

const mockUsers = [
  {
    id: '1',
    username: 'John Doe',
    avatar: 'https://imagedelivery.net/N-wC4umAd0dRtzKF6AjDrQ/e6218504-d143-4232-bd7b-a72b2b4ce800/public',
    online: true,
  },
  {
    id: '2',
    username: 'Jane Smith',
    avatar: 'https://imagedelivery.net/N-wC4umAd0dRtzKF6AjDrQ/0c757d3c-4197-4759-72ac-a94a9515ee00/public',
    online: false,
  },
  {
    id: '3',
    username: 'Mike Johnson',
    avatar: 'https://imagedelivery.net/N-wC4umAd0dRtzKF6AjDrQ/2ac936c2-394d-43bc-8e68-b4aec4159900/public',
    online: true,
  },
];

export default function NewChatScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isGroupChat, setIsGroupChat] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupImage, setGroupImage] = useState<string | null>(null);
  const [showImagePicker, setShowImagePicker] = useState(false);

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

        setGroupImage(manipulatedImage.uri);
        setShowImagePicker(false);
      }
    } catch (error) {
      toast.error('Error processing image');
    }
  };

  const filteredUsers = mockUsers.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );  
  
  const toggleUserSelection = (user: User) => {
    let newSelectedUsers;
    if (selectedUsers.find(u => u.id === user.id)) {
      newSelectedUsers = selectedUsers.filter(u => u.id !== user.id);
    } else {
      newSelectedUsers = [...selectedUsers, user];
    }
    setSelectedUsers(newSelectedUsers);

    // Auto enable group chat if more than 1 person is selected
    if (newSelectedUsers.length > 1 && !isGroupChat) {
      setIsGroupChat(true);
      toast.info('Group chat enabled automatically');
    }
  };  
  
  const handleCreateChat = () => {
    if (selectedUsers.length === 0) {
      toast.error('Please select at least one user');
      return;
    }

    if (isGroupChat) {
      if (!groupName.trim()) {
        toast.error('Please enter a group name');
        return;
      }
    }    
    const chatData = {
      id: Date.now().toString(),
      isGroup: isGroupChat,
      name: isGroupChat ? groupName : selectedUsers[0].username,
      avatar: isGroupChat 
        ? groupImage || 'https://imagedelivery.net/N-wC4umAd0dRtzKF6AjDrQ/245fba1e-b2a5-4042-3f2c-5f2403425f00/public'
        : selectedUsers[0].avatar,
      participants: selectedUsers,
    };

    // Navigate to Chat screen and replace NewChat screen in the stack
    navigation.replace('Chat', {
      contact: {
        username: chatData.name,
        avatar: chatData.avatar
      }
    });
  };

  const renderUser = ({ item }: { item: User }) => (
    <TouchableOpacity 
      style={[styles.userItem, { backgroundColor: colors.surface }]}
      onPress={() => toggleUserSelection(item)}
    >
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.userInfo}>
        <Text style={[styles.username, { color: colors.text }]}>{item.username}</Text>
        <View style={styles.onlineStatus}>
          <View 
            style={[
              styles.onlineIndicator,
              { backgroundColor: item.online ? colors.success : colors.textSecondary }
            ]} 
          />
          <Text style={[styles.onlineText, { color: colors.textSecondary }]}>
            {item.online ? 'Online' : 'Offline'}
          </Text>
        </View>
      </View>
      <MaterialIcons 
        name={selectedUsers.find(u => u.id === item.id) ? "check-circle" : "radio-button-unchecked"} 
        size={24} 
        color={selectedUsers.find(u => u.id === item.id) ? colors.primary : colors.textSecondary} 
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>New Chat</Text>
        <TouchableOpacity 
          onPress={handleCreateChat}
          style={styles.createButton}
        >
          <Text style={[styles.createButtonText, { color: colors.primary }]}>Create</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={[styles.groupToggle, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <Text style={[styles.groupToggleText, { color: colors.text }]}>Create Group Chat</Text>
          <Switch
            value={isGroupChat}
            onValueChange={setIsGroupChat}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={isGroupChat ? '#fff' : '#f4f3f4'}
          />
        </View>

        {isGroupChat && (      
          <View style={[styles.groupNameContainer, { backgroundColor: colors.surface }]}>
            <TouchableOpacity 
              style={styles.groupImageContainer}
              onPress={() => setShowImagePicker(true)}
            >
              {groupImage ? (
                <View style={styles.groupImageWrapper}>
                  <Image 
                    source={{ uri: groupImage }} 
                    style={styles.groupImage} 
                  />
                  <TouchableOpacity 
                    style={styles.removeImageButton}
                    onPress={() => setGroupImage(null)}
                  >
                    <MaterialIcons name="close" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={[styles.groupImagePlaceholder, { backgroundColor: colors.card }]}>
                  <MaterialIcons name="add-photo-alternate" size={32} color={colors.textSecondary} />
                  <Text style={[styles.groupImageText, { color: colors.textSecondary }]}>Add group photo</Text>
                </View>
              )}
            </TouchableOpacity>
            <TextInput
              style={[styles.groupNameInput, { 
                backgroundColor: colors.card,
                color: colors.text,
                borderColor: colors.border
              }]}
              value={groupName}
              onChangeText={setGroupName}
              placeholder="Enter group name"
              placeholderTextColor={colors.textSecondary}
              maxLength={30}
              keyboardAppearance={theme === 'dark' ? 'dark' : 'light'}
            />
          </View>
        )}

        {selectedUsers.length > 0 && (
          <View style={[styles.selectedUsersContainer, { 
            backgroundColor: theme === 'dark' ? darkTheme.surface : lightTheme.surface,
            borderBottomColor: theme === 'dark' ? darkTheme.border : lightTheme.border 
          }]}>
            <Text style={[styles.selectedUsersTitle, { 
              color: theme === 'dark' ? darkTheme.text : lightTheme.text 
            }]}>
              Selected Users ({selectedUsers.length})
            </Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.selectedUsersList}
            >
              {selectedUsers.map(user => (
                <View key={user.id} style={[styles.selectedUserChip, { 
                  backgroundColor: theme === 'dark' ? darkTheme.card : lightTheme.card 
                }]}>
                  <Image source={{ uri: user.avatar }} style={styles.selectedUserAvatar} />
                  <Text style={[styles.selectedUsername, { 
                    color: theme === 'dark' ? darkTheme.text : lightTheme.text 
                  }]}>{user.username}</Text>
                  <TouchableOpacity 
                    onPress={() => toggleUserSelection(user)}
                    style={styles.removeButton}
                  >
                    <MaterialIcons 
                      name="close" 
                      size={16} 
                      color={theme === 'dark' ? darkTheme.textSecondary : lightTheme.textSecondary} 
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
          <MaterialIcons name="search" size={24} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search users..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            keyboardAppearance={theme === 'dark' ? 'dark' : 'light'}
          />
        </View>

        <FlatList
          data={filteredUsers}
          renderItem={renderUser}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.userList}
          scrollEnabled={false}
        />
      </ScrollView>

      <Modal
        visible={showImagePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowImagePicker(false)}
      >
        <Pressable 
          style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
          onPress={() => setShowImagePicker(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <TouchableOpacity 
              style={[styles.modalOption, { borderBottomColor: colors.border }]}
              onPress={() => pickImage('camera')}
            >
              <MaterialIcons name="camera-alt" size={24} color={colors.text} />
              <Text style={[styles.modalOptionText, { color: colors.text }]}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.modalOption}
              onPress={() => pickImage('library')}
            >
              <MaterialIcons name="photo-library" size={24} color={colors.text} />
              <Text style={[styles.modalOptionText, { color: colors.text }]}>Choose from Library</Text>
            </TouchableOpacity>
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
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  createButton: {
    padding: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  groupToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  groupToggleText: {
    fontSize: 16,
    fontWeight: '600',
  },
  groupNameContainer: {
    padding: 16,
    marginBottom: 8,
  },
  groupImageContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  groupImageWrapper: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
  },
  groupImage: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: 4,
  },
  groupImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  groupImageText: {
    marginTop: 4,
    fontSize: 12,
  },
  groupNameInput: {
    fontSize: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  selectedUsersContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E1E1',
  },
  selectedUsersTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  selectedUsersList: {
    paddingRight: 16,
  },
  selectedUserChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 8,
    marginRight: 8,
  },
  selectedUserAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  selectedUsername: {
    fontSize: 14,
    marginRight: 4,
  },
  removeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    margin: 16,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  userList: {
    padding: 16,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  onlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  onlineText: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalOptionText: {
    fontSize: 16,
    marginLeft: 12,
  },
});