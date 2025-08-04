export type RootStackParamList = {
  Home: undefined;
  Chat: { 
    chatId?: string;
    contact?: {
      username: string;
      avatar: string;
    };
  };
  Settings: undefined;
  ProfileSettings: undefined;
  NewChat: undefined;
  ContactDetails: { contact: {
    id: any;
    isGroup: boolean; 
    username: string; 
    avatar: string 
  }};
  ThemeSettings: undefined;
  Report: { 
    type: 'user' | 'message' | 'bug';
    user?: { 
      username: string; 
      avatar: string;
    };
    message?: string;
  };
  Search: undefined;
  SharedFiles: { chatId: string, contactId?: string };
  Main: {
    screen?: 'Home' | 'Calendar' | 'CallLog' | 'Settings';
  };
  Notifications: undefined;
  Privacy: undefined;
  Security: undefined;
  Auth: undefined;
};