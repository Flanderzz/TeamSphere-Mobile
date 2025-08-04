import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  Animated,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useWebSocket } from '../contexts/WebSocketContext';
import { useTheme } from '../contexts/ThemeContext';
import { lightTheme, darkTheme } from '../constants/theme';
import { toast } from 'sonner-native';
import { RootStackParamList } from '../types/Navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

interface ChatPreview {
  id: string;
  username: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
}

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { user, signOut } = useAuth();
  const { isConnected } = useWebSocket();
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const fadeAnim = new Animated.Value(0.3);

  const onRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    setIsLoading(true);
    fadeAnim.setValue(0.3);

    // Start loading animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    try {
      // Simulate API call to refresh chats
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Chats refreshed');
    } catch (error) {
      toast.error('Failed to refresh chats');
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
      fadeAnim.stopAnimation();
    }
  }, [fadeAnim]);

  useEffect(() => {
    // Start with loading state
    setIsLoading(true);
    fadeAnim.setValue(0.3);

    // Start loading animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Simulate API call to fetch chats
    const fetchChats = async () => {
      try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // In a real app, this would be an API call
        // const response = await fetch('your-api/chats');
        // const data = await response.json();
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching chats:', error);
        toast.error('Failed to load chats');
        setIsLoading(false);
      }
    };

    fetchChats();

    return () => fadeAnim.stopAnimation();
  }, []);

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
      username: 'Jane Smith',
      avatar: 'https://imagedelivery.net/N-wC4umAd0dRtzKF6AjDrQ/0c757d3c-4197-4759-72ac-a94a9515ee00/public',
      lastMessage: 'The meeting is at 3 PM',
      timestamp: '1h ago',
      unreadCount: 0,
    },
    {
      id: '3',
      username: 'Marketing Team',
      avatar: 'https://imagedelivery.net/N-wC4umAd0dRtzKF6AjDrQ/e6c29a56-2920-4ef4-2cd7-b03588b4cb00/public',
      lastMessage: 'Sarah: Latest campaign results are in!',
      timestamp: '3h ago',
      unreadCount: 5,
    },
    {
      id: '4',
      username: 'David Wilson',
      avatar: 'https://imagedelivery.net/N-wC4umAd0dRtzKF6AjDrQ/d4d1e748-29a3-4110-05bc-160d64ae4800/public',
      lastMessage: 'Thanks for the help yesterday',
      timestamp: '1d ago',
      unreadCount: 0,
    },
    {
      id: '5',
      username: 'Project Alpha',
      avatar: 'https://imagedelivery.net/N-wC4umAd0dRtzKF6AjDrQ/3bdbbea1-5a74-4c2c-8a3c-ba534eb3a200/public',
      lastMessage: 'Tom: Updated the timeline ⏰',
      timestamp: '1d ago',
      unreadCount: 3,
    },
    {
      id: '6',
      username: 'Alice Brown',
      avatar: 'https://imagedelivery.net/N-wC4umAd0dRtzKF6AjDrQ/d3e5cee5-0b18-45e5-1e41-2395d93e0200/public',
      lastMessage: 'Can we reschedule to tomorrow?',
      timestamp: '2d ago',
      unreadCount: 0,
    },
    {
      id: '7',
      username: 'Tech Support',
      avatar: 'https://imagedelivery.net/N-wC4umAd0dRtzKF6AjDrQ/4826353e-db10-413c-74a4-9584fcbe8a00/public',
      lastMessage: 'Your ticket #1234 has been resolved',
      timestamp: '3d ago',
      unreadCount: 1,
    },
    {
      id: '11',
      username: 'John Doe',
      avatar: 'https://imagedelivery.net/N-wC4umAd0dRtzKF6AjDrQ/e6218504-d143-4232-bd7b-a72b2b4ce800/public',
      lastMessage: 'Hey, how are you?',
      timestamp: '2m ago',
      unreadCount: 2,
    },
    {
      id: '22',
      username: 'Jane Smith',
      avatar: 'https://imagedelivery.net/N-wC4umAd0dRtzKF6AjDrQ/0c757d3c-4197-4759-72ac-a94a9515ee00/public',
      lastMessage: 'The meeting is at 3 PM',
      timestamp: '1h ago',
      unreadCount: 0,
    },
    {
      id: '33',
      username: 'Marketing Team',
      avatar: 'https://imagedelivery.net/N-wC4umAd0dRtzKF6AjDrQ/e6c29a56-2920-4ef4-2cd7-b03588b4cb00/public',
      lastMessage: 'Sarah: Latest campaign results are in!',
      timestamp: '3h ago',
      unreadCount: 5,
    },
    {
      id: '44',
      username: 'David Wilson',
      avatar: 'https://imagedelivery.net/N-wC4umAd0dRtzKF6AjDrQ/d4d1e748-29a3-4110-05bc-160d64ae4800/public',
      lastMessage: 'Thanks for the help yesterday',
      timestamp: '1d ago',
      unreadCount: 0,
    },
    {
      id: '55',
      username: 'Project Alpha',
      avatar: 'https://imagedelivery.net/N-wC4umAd0dRtzKF6AjDrQ/3bdbbea1-5a74-4c2c-8a3c-ba534eb3a200/public',
      lastMessage: 'Tom: Updated the timeline ⏰',
      timestamp: '1d ago',
      unreadCount: 3,
    },
    {
      id: '66',
      username: 'Alice Brown',
      avatar: 'https://imagedelivery.net/N-wC4umAd0dRtzKF6AjDrQ/d3e5cee5-0b18-45e5-1e41-2395d93e0200/public',
      lastMessage: 'Can we reschedule to tomorrow?',
      timestamp: '2d ago',
      unreadCount: 0,
    },
    {
      id: '77',
      username: 'Tech Support',
      avatar: 'https://imagedelivery.net/N-wC4umAd0dRtzKF6AjDrQ/4826353e-db10-413c-74a4-9584fcbe8a00/public',
      lastMessage: 'Your ticket #1234 has been resolved',
      timestamp: '3d ago',
      unreadCount: 1,
    }
  ];

  const renderChatPreview = ({ item }: { item: ChatPreview }) => (
    <TouchableOpacity 
      style={[styles.chatPreview, { backgroundColor: colors.surface }]}
      onPress={() => navigation.navigate('Chat', { contact: {
        username: item.username,
        avatar: item.avatar
      }})}
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
              <Text style={styles.unreadCount}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3, 4, 5].map((key) => (
        <Animated.View 
          key={key}
          style={[
            styles.skeletonItem,
            { opacity: fadeAnim, backgroundColor: colors.surface }
          ]}
        >
          <View style={[styles.skeletonAvatar, { backgroundColor: colors.border }]} />
          <View style={styles.skeletonContent}>
            <View style={[styles.skeletonLine, { backgroundColor: colors.border }]} />
            <View style={[styles.skeletonLine, { width: '60%', backgroundColor: colors.border }]} />
          </View>
        </Animated.View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.text }]}>Chats</Text>
          <View style={[styles.connectionStatus, 
            { backgroundColor: isConnected ? colors.success : colors.error }]} />
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={() => navigation.navigate('Main', { screen: 'Settings' })}
          >
            <Image 
              source={{ uri: user?.avatar || 'https://via.placeholder.com/40' }} 
              style={[styles.profileIcon, { borderColor: colors.primary }]} 
            />
          </TouchableOpacity>
        </View>
      </View>
      
      <TouchableOpacity 
        style={[styles.searchContainer, { backgroundColor: colors.surface }]}
        onPress={() => navigation.navigate('Search')}
      >
        <MaterialIcons name="search" size={24} color={colors.textSecondary} />
        <Text style={[styles.searchInputPlaceholder, { color: colors.textSecondary }]}>Search chats...</Text>
      </TouchableOpacity>

      <FlatList
        data={isLoading ? [] : chatPreviews}
        renderItem={renderChatPreview}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.chatList}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={isLoading ? renderSkeleton : null}
      />

      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('NewChat')}
      >
        <MaterialIcons name="chat" size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  skeletonContainer: {
    padding: 20,
  },
  skeletonItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  skeletonAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E1E9EE',
  },
  skeletonContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  skeletonLine: {
    height: 12,
    backgroundColor: '#E1E9EE',
    borderRadius: 6,
    marginBottom: 8,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    marginLeft: 16,
  },
  profileIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginRight: 8,
  },
  connectionStatus: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInputPlaceholder: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#666',
  },
  chatList: {
    padding: 16,
    paddingTop: 8,
  },
  chatPreview: {
    flexDirection: 'row',
    backgroundColor: 'white',
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
    color: '#1A1A1A',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  messagePreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#007AFF',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});