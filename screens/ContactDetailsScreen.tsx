import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  FlatList,
  Modal,
  Pressable,
  Dimensions,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { toast } from 'sonner-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { lightTheme, darkTheme } from '../constants/theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/Navigation';
import * as WebBrowser from 'expo-web-browser';
import { Image as ExpoImage } from 'expo-image';
import { Video, ResizeMode } from 'expo-av';
import { GestureHandlerRootView, PinchGestureHandler, PinchGestureHandlerEventPayload, PinchGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animated, { useAnimatedGestureHandler, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

interface GroupMember {
  id: string;
  username: string;
  avatar: string;
  isAdmin?: boolean;
}

interface FileItem {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'image' | 'video';
  size: string;
  date: string;
  url: string;
}

type ContactScreenProps = NativeStackScreenProps<RootStackParamList, 'ContactDetails'>;

export default function ContactDetailsScreen({ route, navigation }: ContactScreenProps) {
  const { contact } = route.params;
  const { user } = useAuth();
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;
  const [notifications, setNotifications] = useState(true);
  const [muteGroup, setMuteGroup] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewerModal, setShowViewerModal] = useState(false);
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const pinchRef = useRef(null);

  // Mock data - in real app, this would come from your backend
  const isGroupChat = contact?.isGroup ? true : false;
  const isAdmin = isGroupChat ? true : false; // Mock admin status
  const [members, setMembers] = useState<Array<GroupMember>>([
    {
      id: '1',
      username: 'John Doe',
      avatar: 'https://imagedelivery.net/N-wC4umAd0dRtzKF6AjDrQ/e6218504-d143-4232-bd7b-a72b2b4ce800/public',
      isAdmin: true,
    },
    {
      id: '2',
      username: 'Jane Smith',
      avatar: 'https://imagedelivery.net/N-wC4umAd0dRtzKF6AjDrQ/0c757d3c-4197-4759-72ac-a94a9515ee00/public',
    },
    {
      id: '3',
      username: 'Mike Johnson',
      avatar: 'https://imagedelivery.net/N-wC4umAd0dRtzKF6AjDrQ/2ac936c2-394d-43bc-8e68-b4aec4159900/public',
    },
  ]);

  // Mock files data
  const [sharedFiles] = useState<FileItem[]>([
    { 
      id: '1', 
      name: 'Project Report.pdf', 
      type: 'pdf', 
      size: '2.4 MB', 
      date: '2 days ago',
      url: 'https://www.cs.tulane.edu/~zzheng3/teaching/cmps6760/spring21/le.pdf'
    },
    { 
      id: '2', 
      name: 'Meeting Notes.doc', 
      type: 'doc', 
      size: '521 KB', 
      date: '1 week ago',
      url: 'https://www.cs.tulane.edu/~zzheng3/teaching/cmps6760/spring21/le.pdf'
    },
    { 
      id: '3', 
      name: 'Screenshot.png', 
      type: 'image', 
      size: '1.2 MB', 
      date: '3 weeks ago',
      url: 'https://i.pinimg.com/736x/9c/15/16/9c15162394e00983d47cca924fb72726.jpg'
    },
  ]);

  const handleRemoveMember = (memberId: string) => {
    if (!isAdmin) {
      toast.error('Only admins can remove members');
      return;
    }
    setMembers(members.filter(member => member.id !== memberId));
    toast.success('Member removed from group');
  };

  const handlePromoteToAdmin = (memberId: string) => {
    if (!isAdmin) {
      toast.error('Only admins can promote members');
      return;
    }
    setMembers(members.map(member => 
      member.id === memberId 
        ? { ...member, isAdmin: true }
        : member
    ));
    toast.success('Member promoted to admin');
  };

  const handleLeaveGroup = () => {
    toast.success('You left the group');
    navigation.goBack();
  };

  const [showMemberMenu, setShowMemberMenu] = useState(false);
  const [selectedMember, setSelectedMember] = useState<GroupMember | null>(null);

  const handleMemberPress = (member: GroupMember) => {
    if (!isGroupChat) return; // Only allow member actions in group chats
    if (member.id === user?.id) return; // Don't show menu for yourself
    setSelectedMember(member);
    setShowMemberMenu(true);
  };

  const handleBlockMember = () => {
    if (!selectedMember) return;
    toast.success(`Blocked ${selectedMember.username}`);
    setShowMemberMenu(false);
  };

  const renderMember = ({ item }: { item: GroupMember }) => (
    <TouchableOpacity 
      style={styles.memberItem}
      onPress={() => handleMemberPress(item)}
    >
      <Image source={{ uri: item.avatar }} style={styles.memberAvatar} />
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.username}</Text>          
        <View style={styles.memberSubInfo}>
            <View style={styles.memberBadges}>
              {item.isAdmin && (
                <Text style={styles.adminBadge}>Admin</Text>
              )}
              {item.id === user?.id && (
                <Text style={styles.youBadge}>(You)</Text>
              )}
            </View>
          </View>
      </View>
      {isAdmin && item.id !== user?.id && (
        <View style={styles.memberActions}>
          {!item.isAdmin && (
            <TouchableOpacity 
              onPress={() => handlePromoteToAdmin(item.id)}
              style={styles.actionButton}
            >
              <MaterialIcons name="admin-panel-settings" size={24} color="#007AFF" />
            </TouchableOpacity>
          )}          
          <TouchableOpacity 
            onPress={() => handleRemoveMember(item.id)}
            style={styles.actionButton}
          >
            <MaterialIcons name="person-remove" size={24} color="#FF3B30" />
            <Text style={styles.kickText}>Kick</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );  

  const handleFilePress = async (file: FileItem) => {
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
          await WebBrowser.openBrowserAsync(file.url, {
            presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
            toolbarColor: theme === 'dark' ? '#1A1A1A' : '#FFFFFF',
            controlsColor: theme === 'dark' ? '#FFFFFF' : '#000000',
          });
          break;
      }
    } catch (error) {
      console.error('Error opening file:', error);
      toast.error('Failed to open file');
    }
  };

  const renderFile = ({ item }: { item: FileItem }) => (
    <TouchableOpacity 
      style={[styles.fileItem, { backgroundColor: colors.card }]}
      onPress={() => handleFilePress(item)}
      onLongPress={() => {
        setSelectedFile(item);
        setShowActionModal(true);
      }}
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
          {item.size} • {item.date}
        </Text>
      </View>
    </TouchableOpacity>
  );

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

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: colors.text }]}>
              {isGroupChat ? 'Group Details' : 'Contact Details'}
            </Text>
          </View>
          <View style={styles.placeholderButton} />
        </View>

        <ScrollView style={styles.content}>
          <View style={[styles.profileSection, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
            <Image source={{ uri: contact.avatar }} style={styles.avatar} />
            <Text style={[styles.username, { color: colors.text }]}>{contact.username}</Text>
            {isGroupChat && <Text style={[styles.memberCount, { color: colors.textSecondary }]}>{members.length} members</Text>}
          </View>

          {isGroupChat ? (
            <>
              <View style={[styles.settingsSection, { backgroundColor: colors.surface }]}>
                <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
                  <MaterialIcons name="volume-off" size={24} color={colors.textSecondary} />
                  <Text style={[styles.settingText, { color: colors.text }]}>Mute Group</Text>
                  <Switch
                    value={muteGroup}
                    onValueChange={setMuteGroup}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={muteGroup ? '#fff' : '#f4f3f4'}
                  />
                </View>
              </View>

              <View style={[styles.section, { backgroundColor: colors.surface }]}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Members</Text>
                  <Text style={[styles.memberCount, { color: colors.textSecondary }]}>{members.length} members</Text>
                </View>
                <FlatList
                  data={members}
                  renderItem={renderMember}
                  keyExtractor={item => item.id}
                  scrollEnabled={false}
                  ItemSeparatorComponent={() => <View style={[styles.memberSeparator, { backgroundColor: colors.border }]} />}
                />
              </View>

              {isAdmin && (
                <View style={[styles.adminSection, { backgroundColor: colors.surface }]}>
                  <TouchableOpacity style={[styles.adminButton, { borderBottomColor: colors.border }]}>
                    <MaterialIcons name="person-add" size={24} color={colors.primary} />
                    <Text style={[styles.adminButtonText, { color: colors.primary }]}>Add Members</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.adminButton, { borderBottomColor: colors.border }]}>
                    <MaterialIcons name="edit" size={24} color={colors.primary} />
                    <Text style={[styles.adminButtonText, { color: colors.primary }]}>Edit Group Info</Text>
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity 
                style={[styles.leaveButton, { backgroundColor: colors.error + '20' }]}
                onPress={handleLeaveGroup}
              >
                <MaterialIcons name="exit-to-app" size={24} color={colors.error} />
                <Text style={[styles.leaveButtonText, { color: colors.error }]}>Leave Group</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={[styles.section, { backgroundColor: colors.surface }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Privacy & Support</Text>
                <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
                  <MaterialIcons name="block" size={24} color={colors.error} />
                  <Text style={[styles.settingText, { color: colors.text }]}>Block User</Text>
                  <Switch
                    value={isBlocked}
                    onValueChange={(newValue) => {
                      setIsBlocked(newValue);
                      if (newValue) {
                        toast.success(`${contact.username} has been blocked`);
                      } else {
                        toast.success(`${contact.username} has been unblocked`);
                      }
                    }}
                    trackColor={{ false: colors.border, true: colors.error }}
                    thumbColor={isBlocked ? colors.error : '#f4f3f4'}
                  />
                </View>
                <TouchableOpacity 
                  style={[styles.settingItem, { borderBottomColor: colors.border }]}
                  onPress={() => navigation.navigate('Report', { type: 'user', user: contact })}
                >
                  <MaterialIcons name="report-problem" size={24} color={colors.warning} />
                  <Text style={[styles.settingText, { color: colors.text }]}>Report User</Text>
                  <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={[styles.settingsSection, { backgroundColor: colors.surface }]}>
                <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
                  <MaterialIcons name="notifications" size={24} color={colors.textSecondary} />
                  <Text style={[styles.settingText, { color: colors.text }]}>Notifications</Text>
                  <Switch
                    value={notifications}
                    onValueChange={setNotifications}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={notifications ? '#fff' : '#f4f3f4'}
                  />
                </View>
              </View>

              <View style={[styles.section, { backgroundColor: colors.surface }]}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Shared Files</Text>
                  <TouchableOpacity 
                    style={styles.showMoreButton}
                    onPress={() => navigation.navigate('SharedFiles', { chatId: contact.id })}
                  >
                    <Text style={[styles.showMoreText, { color: colors.primary }]}>Show All</Text>
                    <MaterialIcons name="chevron-right" size={24} color={colors.primary} />
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={sharedFiles}
                  renderItem={renderFile}
                  keyExtractor={item => item.id}
                  scrollEnabled={false}
                  ItemSeparatorComponent={() => <View style={[styles.fileSeparator, { backgroundColor: colors.border }]} />}
                />
              </View>

              <TouchableOpacity 
                style={[styles.deleteButton, { backgroundColor: colors.error + '20' }]}
                onPress={() => setShowDeleteModal(true)}
              >
                <MaterialIcons name="delete" size={24} color={colors.error} />
                <Text style={[styles.deleteButtonText, { color: colors.error }]}>Delete Chat</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>

        {/* Delete Confirmation Modal */}
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
              <View style={styles.modalTitleContainer}>
                <MaterialIcons name="warning" size={32} color={colors.error} />
                <Text style={[styles.modalTitle, { color: colors.text }]}>Delete Chat?</Text>
              </View>
              <Text style={[styles.modalMessage, { color: colors.textSecondary }]}>
                This will delete the chat only for you. Other participants will still be able to see the chat history.
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
                  onPress={() => {
                    setShowDeleteModal(false);
                    toast.success('Chat deleted');
                    navigation.navigate('Home');
                  }}
                >
                  <Text style={styles.modalDeleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </Modal>

        {/* Member Action Menu Modal */}
        <Modal
          visible={showMemberMenu}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowMemberMenu(false)}
        >
          <Pressable 
            style={styles.modalOverlay}
            onPress={() => setShowMemberMenu(false)}
          >
            <View style={[styles.memberMenuModal, { backgroundColor: colors.surface }]}>
              <Text style={[styles.memberMenuTitle, { color: colors.text }]}>
                {selectedMember?.username}
              </Text>
              <TouchableOpacity 
                style={[styles.memberMenuOption, { borderBottomColor: colors.border }]}
                onPress={handleBlockMember}
              >
                <MaterialIcons name="block" size={24} color={colors.error} />
                <Text style={[styles.memberMenuOptionText, { color: colors.error }]}>Block User</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.memberMenuCancelButton}
                onPress={() => setShowMemberMenu(false)}
              >
                <Text style={[styles.memberMenuCancelText, { color: colors.textSecondary }]}>Cancel</Text>
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
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  showMoreText: {
    color: '#007AFF',
    fontSize: 14,
    marginRight: 4,
  },  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
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
  },
  kickText: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 2,
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E1E1',
  },
  backButton: {
    padding: 4,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  placeholderButton: {
    width: 32,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E1E1',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  username: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  memberCount: {
    fontSize: 14,
    color: '#666',
  },
  settingsSection: {
    backgroundColor: 'white',
    marginTop: 20,
    paddingHorizontal: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E1E1',
  },
  settingText: {
    flex: 1,
    marginLeft: 16,
    fontSize: 16,
    color: '#1A1A1A',
  },
  section: {
    backgroundColor: 'white',
    marginTop: 20,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E1E1',
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  memberInfo: {
    flex: 1,
    marginLeft: 12,
  },
  memberSubInfo: {
    marginTop: 4,
  },
  memberBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  memberName: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  adminBadge: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 2,
  },
  youBadge: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  memberActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
  },
  adminSection: {
    backgroundColor: 'white',
    marginTop: 20,
    padding: 16,
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E1E1',
  },
  adminButtonText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#007AFF',
  },
  leaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFE5E5',
    margin: 20,
    padding: 16,
    borderRadius: 12,
  },
  leaveButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '600',
  },  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFE5E5',
    margin: 20,
    padding: 16,
    borderRadius: 12,
  },
  deleteButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '600',
  },  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionModal: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 280,
  },  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 320,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },  modalTitleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 8,
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalCancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F5F7FB',
  },
  modalCancelText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  modalDeleteButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  modalDeleteText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E1E1',
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  actionText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
  },
  deleteText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
    color: '#FF3B30',
  },
  memberMenuModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    width: '80%',
    maxWidth: 320,
  },
  memberMenuTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
    textAlign: 'center',
  },
  memberMenuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E1E1',
  },
  memberMenuOptionText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#FF3B30',
  },
  memberMenuCancelButton: {
    marginTop: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  memberMenuCancelText: {
    fontSize: 16,
    color: '#666',
  },
  menuButton: {
    padding: 8,
  },
  memberSeparator: {
    height: 1,
    backgroundColor: '#E1E1E1',
  },
  fileSeparator: {
    height: 1,
    marginLeft: 52,
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
});