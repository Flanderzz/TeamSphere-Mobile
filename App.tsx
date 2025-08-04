import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform, StyleSheet } from 'react-native';
import { SafeAreaProvider } from "react-native-safe-area-context"
import { Toaster } from 'sonner-native';
import HomeScreen from "./screens/HomeScreen"
import ChatScreen from "./screens/ChatScreen"
import SearchScreen from "./screens/SearchScreen"
import ReportScreen from "./screens/ReportScreen"
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { lightTheme, darkTheme } from './constants/theme';
import AuthScreen from './screens/AuthScreen';
import LoadingScreen from './screens/LoadingScreen';
import SettingsScreen from './screens/SettingsScreen';
import ProfileSettingsScreen from './screens/ProfileSettingsScreen';
import NewChatScreen from './screens/NewChatScreen';
import ContactDetailsScreen from './screens/ContactDetailsScreen';
import SharedFilesScreen from './screens/SharedFilesScreen';
import CalendarScreen from './screens/CalendarScreen';
import CallLogScreen from './screens/CallLogScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import PrivacyScreen from './screens/PrivacyScreen';
import SecurityScreen from './screens/SecurityScreen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import ThemeSettingsScreen from './screens/ThemeSettingsScreen';
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();


function MainTabs() {
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: 83,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarLabel: 'Chats',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="chat" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Calendar" 
        component={CalendarScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="calendar-today" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="CallLog" 
        component={CallLogScreen}
        options={{
          tabBarLabel: 'Calls',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="call" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function AppContent() {
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;

  return (
    <NavigationContainer
      theme={{
        dark: theme === 'dark',
        colors: {
          primary: colors.primary,
          background: colors.background,
          card: colors.surface,
          text: colors.text,
          border: colors.border,
          notification: colors.primary,
        },
        fonts: {
          regular: {
            fontFamily: 'System',
            fontWeight: '400',
          },
          medium: {
            fontFamily: 'System',
            fontWeight: '500',
          },
          bold: {
            fontFamily: 'System',
            fontWeight: '700',
          },
          heavy: {
            fontFamily: 'System',
            fontWeight: '900',
          },
        },
      }}
    >
      <RootStack />
    </NavigationContainer>
  );
}

function RootStack() {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />
  }  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {token ? (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
          <Stack.Screen name="ProfileSettings" component={ProfileSettingsScreen} />
          <Stack.Screen name="NewChat" component={NewChatScreen} />
          <Stack.Screen name="ContactDetails" component={ContactDetailsScreen} />
          <Stack.Screen name="SharedFiles" component={SharedFilesScreen} />
          <Stack.Screen name="Search" component={SearchScreen} />
          <Stack.Screen name="Report" component={ReportScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="Privacy" component={PrivacyScreen} />
          <Stack.Screen name="Security" component={SecurityScreen} />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthScreen} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {  
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <WebSocketProvider>
              <AppContent />
              <Toaster />
            </WebSocketProvider>
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
