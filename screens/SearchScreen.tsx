import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { lightTheme, darkTheme } from '../constants/theme';
import { User } from '../types/User';

interface SearchScreenProps {
  navigation: any;
}

interface ChatPreview {
  id: string;
  username: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
}

export default function SearchScreen({ navigation }: SearchScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;

  // Mock data - replace with actual data fetching
  const users: User[] = [
    {
      id: '1',
      username: 'John Doe',
      email: 'email@email.com',
      avatar: 'https://i.pravatar.cc/150?img=1',
      online: true
    },
    {
      id: '2',
      username: 'Jane Smith',
      email: 'email@email.com',
      avatar: 'https://i.pravatar.cc/150?img=2',
      online: false
    },
    // Add more mock users as needed
  ];

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUserSelect = (user: User) => {
    // Handle user selection
    console.log('Selected user:', user);
  };

  const renderUser = ({ item }: { item: User }) => (
    <TouchableOpacity 
      style={[styles.userItem, { backgroundColor: colors.surface }]}
      onPress={() => handleUserSelect(item)}
    >
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.userInfo}>
        <Text style={[styles.username, { color: colors.text }]}>{item.username}</Text>
        <View style={styles.onlineStatus}>
          <View 
            style={[
              styles.statusDot,
              { backgroundColor: item.online ? colors.success : colors.textSecondary }
            ]} 
          />
          <Text style={[styles.onlineText, { color: colors.textSecondary }]}>
            {item.online ? 'Online' : 'Offline'}
          </Text>
        </View>
      </View>
      <MaterialIcons 
        name="chevron-right" 
        size={24} 
        color={colors.textSecondary} 
      />
    </TouchableOpacity>
  );

  // Mock data with diverse chat previews
  const chatPreviews: ChatPreview[] = [
    {
      id: '1',
      username: 'John Doe',
      avatar: 'https://imagedelivery.net/N-wC4umAd0dRtzKF6AjDrQ/e6218504-d143-4232-bd7b-a72b2b4ce800/public',
      lastMessage: 'Hey, how are you?',
      timestamp: '2m ago',
      unreadCount: 2,
    },
    {
      id: '2',
      username: 'Marketing Team',
      avatar: 'https://imagedelivery.net/N-wC4umAd0dRtzKF6AjDrQ/e6c29a56-2920-4ef4-2cd7-b03588b4cb00/public',
      lastMessage: 'Sarah: Latest campaign results are in!',
      timestamp: '3h ago',
      unreadCount: 5,
    },
    {
      id: '3',
      username: 'Project Alpha',
      avatar: 'https://imagedelivery.net/N-wC4umAd0dRtzKF6AjDrQ/3bdbbea1-5a74-4c2c-8a3c-ba534eb3a200/public',
      lastMessage: 'Tom: Updated the timeline ⏰',
      timestamp: '1d ago',
      unreadCount: 3,
    },
  ];

  const filteredChats = chatPreviews.filter(chat =>
    chat.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderChatPreview = ({ item }: { item: ChatPreview }) => (
    <TouchableOpacity 
      style={[styles.chatPreview, { backgroundColor: colors.surface }]}
      onPress={() => {
        navigation.navigate('Chat', {
          contact: {
            username: item.username,
            avatar: item.avatar
          }
        });
      }}
    >
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={[styles.username, { color: colors.text }]}>{item.username}</Text>
          <Text style={[styles.timestamp, { color: colors.textSecondary }]}>{item.timestamp}</Text>
        </View>
        <View style={styles.messagePreview}>
          <Text style={[styles.lastMessage, { color: colors.textSecondary }]} numberOfLines={1}>
            {item.lastMessage}
          </Text>
          {item.unreadCount > 0 && (
            <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
              <Text style={[styles.unreadCount, { color: colors.surface }]}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={24} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search chats..."
            placeholderTextColor="#666666"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
            keyboardAppearance={theme === 'dark' ? 'dark' : 'light'}
          />
        </View>
      </View>

      <FlatList
        data={filteredChats}
        renderItem={renderChatPreview}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.chatList}
      />
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
    padding: 4,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FB',
    padding: 8,
    borderRadius: 12,
    marginTop: 4,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    paddingVertical: Platform.OS === 'ios' ? 9 : 2,
  },
  chatList: {
    padding: 20,
  },
  chatPreview: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  chatInfo: {
    flex: 1,
    marginLeft: 12,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 12,
  },
  messagePreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    marginRight: 8,
  },
  unreadBadge: {
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    fontSize: 12,
    fontWeight: '600',
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
  userInfo: {
    flex: 1,
  },
  onlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  onlineText: {
    fontSize: 14,
  },
});