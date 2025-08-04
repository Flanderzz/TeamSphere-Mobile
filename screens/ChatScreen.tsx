import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  Animated,
  Keyboard,
  TouchableWithoutFeedback,
  Modal,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useWebSocket } from '../contexts/WebSocketContext';
import { ChatSkeletonLoader } from '../components/ChatSkeletonLoader';
import { useTheme } from '../contexts/ThemeContext';
import { lightTheme, darkTheme } from '../constants/theme';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  isMine?: boolean;
  avatar?: string;
}

type RootStackParamList = {
  Home: undefined;
  Chat: { contact: { username: string; avatar: string } };
  ProfileSettings: undefined;
  NewChat: undefined;
  ContactDetails: { contact: { username: string; avatar: string } };
};

type ChatScreenProps = NativeStackScreenProps<RootStackParamList, 'Chat'>;

export default function ChatScreen({ route, navigation }: ChatScreenProps) {
  const { contact } = route.params;
  const { sendMessage, messages } = useWebSocket();
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const fadeAnim = useRef(new Animated.Value(0.3)).current;
  const flatListRef = useRef<FlatList<Message>>(null);
  const menuAnimation = useRef(new Animated.Value(0)).current;
  const buttonRotate = useRef(new Animated.Value(0)).current;
  const menuItemAnimations = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  const typingAnimation = useRef(new Animated.Value(0)).current;

  // Simulate typing users (replace with actual WebSocket implementation)
  useEffect(() => {
    const typingInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        setTypingUsers(['John Doe', 'Jane Smith'].slice(0, Math.floor(Math.random() * 3)));
      } else {
        setTypingUsers([]);
      }
    }, 3000);

    return () => clearInterval(typingInterval);
  }, []);

  useEffect(() => {
    if (isLoading) {
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

      // Simulate loading delay
      const timer = setTimeout(() => {
        setIsLoading(false);
        fadeAnim.stopAnimation();
      }, 1500);

      return () => {
        clearTimeout(timer);
        fadeAnim.stopAnimation();
      };
    }
  }, [isLoading]);

  // Add animation for typing indicator
  useEffect(() => {
    if (typingUsers.length > 0) {
      Animated.spring(typingAnimation, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    } else {
      Animated.spring(typingAnimation, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    }
  }, [typingUsers]);

  const handleSend = () => {
    if (inputMessage.trim()) {
      sendMessage({ content: inputMessage.trim() });
      setInputMessage('');
    }
  };

  const toggleAttachmentMenu = () => {
    const toValue = showAttachmentMenu ? 0 : 1;
    
    // Rotate the plus button
    Animated.spring(buttonRotate, {
      toValue,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();

    // Animate menu items with staggered delay
    menuItemAnimations.forEach((anim, index) => {
      Animated.spring(anim, {
        toValue,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
        delay: toValue ? index * 100 : 0, // Stagger the appearance
      }).start();
    });

    setShowAttachmentMenu(!showAttachmentMenu);
  };

  // Auto-dismiss menu when keyboard shows or screen is touched
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      if (showAttachmentMenu) {
        toggleAttachmentMenu();
      }
    });

    return () => {
      keyboardDidShowListener.remove();
    };
  }, [showAttachmentMenu]);

  const rotateInterpolate = buttonRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  const getMenuItemAnimation = (index: number) => {
    return {
      opacity: menuItemAnimations[index].interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
      }),
      transform: [
        {
          translateY: menuItemAnimations[index].interpolate({
            inputRange: [0, 1],
            outputRange: [20, 0],
          }),
        },
        {
          scale: menuItemAnimations[index].interpolate({
            inputRange: [0, 1],
            outputRange: [0.5, 1],
          }),
        },
      ],
    };
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageWrapper,
      item.sender === 'You' ? styles.myMessageWrapper : styles.theirMessageWrapper
    ]}>
      {item.sender !== 'You' && (
        <TouchableOpacity 
          onPress={() => navigation.navigate('ContactDetails', { 
            contact: { 
              username: item.sender,
              avatar: item.avatar || contact.avatar
            }
          })}
        >
          <Image 
            source={{ uri: item.avatar || contact.avatar }} 
            style={styles.messageAvatar} 
          />
        </TouchableOpacity>
      )}
      <View style={[
        styles.messageContainer,
        item.sender === 'You' ? styles.myMessage : styles.theirMessage,
        item.sender === 'You' ? { backgroundColor: colors.primary } : { backgroundColor: colors.surface }
      ]}>
        {item.sender !== 'You' && (
          <Text style={[styles.senderName, { color: colors.textSecondary }]}>
            {item.sender}
          </Text>
        )}
        <Text style={[
          styles.messageText,
          item.sender === 'You' ? styles.myMessageText : { color: colors.text }
        ]}>
          {item.content}
        </Text>
        <Text style={[styles.timestamp, { color: item.sender === 'You' ? 'rgba(255, 255, 255, 0.7)' : colors.textSecondary }]}>
          {new Date(item.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Text>
      </View>
    </View>
  );

  const renderTypingIndicator = () => {
    if (typingUsers.length === 0) return null;
    
    return (
      <Animated.View 
        style={[
          styles.typingContainer, 
          { 
            backgroundColor: colors.surface,
            transform: [{
              translateY: typingAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              })
            }],
            opacity: typingAnimation
          }
        ]}
      >
        <View style={styles.typingDots}>
          <Animated.View style={[styles.typingDot, { backgroundColor: colors.primary }]} />
          <Animated.View style={[styles.typingDot, { backgroundColor: colors.primary }]} />
          <Animated.View style={[styles.typingDot, { backgroundColor: colors.primary }]} />
        </View>
        <Text style={[styles.typingText, { color: colors.textSecondary }]}>
          {typingUsers.length === 1 
            ? `${typingUsers[0]} is typing...`
            : `${typingUsers.length} people are typing...`}
        </Text>
      </Animated.View>
    );
  };

  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);  
  
  return (
    <KeyboardAvoidingView      
      behavior='padding'
      style={[styles.container, { backgroundColor: colors.background }]}      
      enabled={!isLoading}
      keyboardVerticalOffset={Platform.OS === 'ios' ? -35 : -20}
    >
      <SafeAreaView style={styles.innerContainer}>
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerInfo}
            onPress={() => navigation.navigate('ContactDetails', { contact })}
          >
            <Image source={{ uri: contact.avatar }} style={styles.avatar} />
            <View style={styles.headerText}>
              <Text style={[styles.username, { color: colors.text }]}>{contact.username}</Text>
              <Text style={styles.status}>Online</Text>
            </View>
          </TouchableOpacity>
        </View>        

        <View style={styles.contentContainer}>
          {isLoading ? (
            <ChatSkeletonLoader fadeAnim={fadeAnim} />
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.messagesList}
              onLayout={() => flatListRef.current?.scrollToEnd()}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={true}
              removeClippedSubviews={Platform.OS === 'android'}
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              windowSize={10}
              onScrollBeginDrag={Keyboard.dismiss}
              style={styles.messagesContainer}
            />
          )}
        </View>

        <View style={[styles.bottomContainer, { backgroundColor: colors.surface }]}>
          {renderTypingIndicator()}
          <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
            <View style={styles.attachmentContainer}>
              <TouchableOpacity 
                style={styles.attachButton}
                onPress={toggleAttachmentMenu}
              >
                <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
                  <MaterialIcons name="add-circle" size={32} color={colors.primary} />
                </Animated.View>
              </TouchableOpacity>
              
              <Animated.View 
                style={[
                  styles.menuContainer,
                  { opacity: menuItemAnimations[0].interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1],
                  })}
                ]}
              >
                <Animated.View style={getMenuItemAnimation(0)}>
                  <TouchableOpacity 
                    style={[styles.menuItem, { backgroundColor: colors.card }]}
                    onPress={() => {
                      // Handle attachment
                      toggleAttachmentMenu();
                    }}
                  >
                    <MaterialIcons name="attach-file" size={24} color={colors.primary} />
                  </TouchableOpacity>
                </Animated.View>
                
                <Animated.View style={getMenuItemAnimation(1)}>
                  <TouchableOpacity 
                    style={[styles.menuItem, { backgroundColor: colors.card }]}
                    onPress={() => {
                      // Handle voice memo
                      toggleAttachmentMenu();
                    }}
                  >
                    <MaterialIcons name="mic" size={24} color={colors.primary} />
                  </TouchableOpacity>
                </Animated.View>
                
                <Animated.View style={getMenuItemAnimation(2)}>
                  <TouchableOpacity 
                    style={[styles.menuItem, { backgroundColor: colors.card }]}
                    onPress={() => {
                      // Handle file
                      toggleAttachmentMenu();
                    }}
                  >
                    <MaterialIcons name="folder" size={24} color={colors.primary} />
                  </TouchableOpacity>
                </Animated.View>
              </Animated.View>
            </View>

            <TextInput
              style={[styles.input, { color: colors.text, backgroundColor: colors.card }]}
              value={inputMessage}
              onChangeText={setInputMessage}
              placeholder="Type a message..."
              placeholderTextColor={colors.textSecondary}
              multiline
              maxLength={500}
              keyboardAppearance={theme === 'dark' ? 'dark' : 'light'}
              onFocus={() => showAttachmentMenu && toggleAttachmentMenu()}
            />
            
            <TouchableOpacity 
              style={[
                styles.sendButton,
                !inputMessage.trim() && styles.sendButtonDisabled
              ]}
              onPress={handleSend}
              disabled={!inputMessage.trim()}
            >
              <MaterialIcons 
                name="send" 
                size={24} 
                color={inputMessage.trim() ? colors.primary : colors.textSecondary} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
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
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
  },
  status: {
    fontSize: 12,
    color: '#4CAF50',
  },
  contentContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  messagesList: {
    padding: 16,
    flexGrow: 1,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  myMessageWrapper: {
    justifyContent: 'flex-end',
  },
  theirMessageWrapper: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  myMessage: {
    alignSelf: 'flex-end',
  },
  theirMessage: {
    alignSelf: 'flex-start',
  },
  senderName: {
    fontSize: 12,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    marginBottom: 4,
  },
  myMessageText: {
    color: 'white',
  },
  timestamp: {
    fontSize: 12,
  },
  bottomContainer: {
    position: 'relative',
    backgroundColor: 'transparent',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    position: 'absolute',
    bottom: '100%',
    left: 0,
    right: 0,
    zIndex: 1,
  },
  typingDots: {
    flexDirection: 'row',
    marginRight: 8,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 2,
    opacity: 0.7,
  },
  typingText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
  },
  attachmentContainer: {
    position: 'relative',
    zIndex: 1,
  },
  attachButton: {
    padding: 8,
  },
  menuContainer: {
    position: 'absolute',
    bottom: '100%',
    left: 0,
    marginBottom: 8,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  menuItem: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  input: {
    flex: 1,
    marginHorizontal: 8,
    padding: 8,
    borderRadius: 20,
    maxHeight: 100,
  },
  sendButton: {
    padding: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  attachmentMenu: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
  },
  attachmentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  attachmentOptionText: {
    fontSize: 16,
    marginLeft: 12,
  },
});