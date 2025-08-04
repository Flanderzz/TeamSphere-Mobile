import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { MaterialIcons, AntDesign } from '@expo/vector-icons';
import { toast } from 'sonner-native';
import ProfileSetupScreen from './ProfileSetupScreen';
import { getRandomPfp } from '../utils/getRandomPfp';

const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleInputErrors = (email: string, password: string) => {
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return false;
    }
    return true;
  };

  const login = async (email: string, password: string) => {
    const inputValid = handleInputErrors(email, password);
    if (!inputValid) return;
    
    setLoading(true);

    try {
      const loginResponse = await fetch(`${process.env.API_HOST}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      
      if (!loginResponse.ok) {
        if (loginResponse.status === 401) {
          throw new Error('Invalid email or password');
        } else if (loginResponse.status === 422) {
          throw new Error('Please check your email and password');
        } else if (loginResponse.status >= 500) {
          throw new Error('Server error. Please try again later');
        } else {
          throw new Error(`Login failed (${loginResponse.status})`);
        }
      }
      
      const loginData = await loginResponse.json();
      
      if (loginData?.error) {
        throw new Error(loginData.error);
      }
      
      if (!loginData?.jwt) {
        throw new Error('Authentication failed. Please try again');
      }
      
      const profileResponse = await fetch(`${process.env.API_HOST}/api/user/profile`, {
        method: 'GET',
        headers: {
          'Authorization': "Bearer " + loginData.jwt,
          'Content-Type': 'application/json',
        },
      });
      
      if (!profileResponse.ok) {
        if (profileResponse.status === 401) {
          throw new Error('Session expired. Please log in again');
        } else if (profileResponse.status >= 500) {
          throw new Error('Failed to load profile. Please try again');
        } else {
          throw new Error(`Profile error (${profileResponse.status})`);
        }
      }
      
      const profileData = await profileResponse.json();
      
      if (profileData?.error) {
        throw new Error(`Profile error: ${profileData.error}`);
      }
      
      if (!profileData?.id || !profileData?.email || !profileData?.username) {
        throw new Error('Incomplete profile data received');
      }

      const user = {
        id: profileData.id,
        email: profileData.email,
        username: profileData.username,
        avatar: /*profileData.profilePicture ||*/ await getRandomPfp()
      };
      
      await signIn(loginData.jwt, user);
    } catch (error: any) {
      if (error.name === 'TypeError' && error.message.includes('Network')) {
        toast.error("Network error. Please check your connection");
        return;
      }
      
      if (error instanceof SyntaxError) {
        toast.error("Server returned invalid response. Please try again");
        return;
      }
      
      const errorMessage = error.message || "Login failed. Please try again";
      toast.error(errorMessage); 
      
    } finally {
      setLoading(false);
    }
  };

  return { loading, login };
};

const useSignup = () => {
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleInputErrors = (email: string, password: string, username: string, profileImageUri: string) => {
    if (!email || !username || !password) {
      toast.error("Please fill in all fields");
      return false;
    }
    
    if (!profileImageUri) {
      toast.error("Please upload a profile picture");
      return false;
    }
    
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return false;
    }
    
    return true;
  };

  const signup = async (email: string, password: string, username: string, profileImageUri: string) => {
    const inputValid = handleInputErrors(email, password, username, profileImageUri);
    if (!inputValid) return;
    
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);
      formData.append('username', username);
      
      if (profileImageUri) {
        formData.append('file', {
          uri: profileImageUri,
          type: 'image/jpeg',
          name: 'profile.jpg',
        } as any);
      }

      const signupResponse = await fetch(`${process.env.API_HOST}/auth/signup`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (!signupResponse.ok) {
        if (signupResponse.status === 401) {
          throw new Error('Invalid registration data');
        } else if (signupResponse.status === 422) {
          throw new Error('Please check your registration details');
        } else if (signupResponse.status >= 500) {
          throw new Error('Server error. Please try again later');
        } else {
          throw new Error(`Registration failed (${signupResponse.status})`);
        }
      }
      
      const signupData = await signupResponse.json();
      
      if (signupData?.error) {
        throw new Error(signupData.error);
      }
      
      if (!signupData?.jwt) {
        throw new Error('Registration failed. Please try again');
      }
      
      const profileResponse = await fetch(`${process.env.API_HOST}/api/user/profile`, {
        method: 'GET',
        headers: {
          'Authorization': "Bearer " + signupData.jwt,
          'Content-Type': 'application/json',
        },
      });
      
      if (!profileResponse.ok) {
        throw new Error('Failed to load profile after registration');
      }
      
      const profileData = await profileResponse.json();
      
      if (profileData?.error) {
        throw new Error(`Profile error: ${profileData.error}`);
      }
      
      const user = {
        id: profileData.id,
        email: profileData.email,
        username: profileData.username,
        avatar: /*profileData.profilePicture ||*/ await getRandomPfp()
      };
      
      await signIn(signupData.jwt, user);
      toast.success('Account created successfully!');
      
      return { success: true };
      
    } catch (error: any) {
      if (error.name === 'TypeError' && error.message.includes('Network')) {
        toast.error("Network error. Please check your connection");
        return { success: false };
      }
      
      if (error instanceof SyntaxError) {
        toast.error("Server invalid. Please try again later!");
        return { success: false };
      }
      
      const errorMessage = error.message || "Registration failed. Please try again";
      toast.error(errorMessage);
      return { success: false };
      
    } finally {
      setLoading(false);
    }
  };

  return { loading, signup };
};

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const { loading: loginLoading, login } = useLogin();
  const { loading: signupLoading, signup } = useSignup();
  
  const loading = loginLoading || signupLoading;
  
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAuth = async () => {
    if (!validateEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (isLogin) {
      await login(email, password);
    } else {
      if (!email || !password || !confirmPassword) {
        toast.error('Please fill in all fields');
        return;
      }
      if (password !== confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
      if (password.length < 8) {
        toast.error('Password must be at least 8 characters');
        return;
      }
      setShowProfileSetup(true);
    }
  };  
  
  const handleProfileComplete = async ({ 
    username, 
    profileImage 
  }: { 
    username: string; 
    profileImage: string;
  }) => {
    const result = await signup(email, password, username, profileImage);
    
    if (result?.success) {
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setShowProfileSetup(false);
    }
  };

  const handleGoogleAuth = () => {
    toast.error('Google Sign In is not available yet', { duration: 2500 });
    setTimeout(() => {
      toast.error('Google Sign In will be available in the next update', { duration: 2500 }); 
    }, 3500); 
  };

  if (showProfileSetup) {
    return (
      <ProfileSetupScreen
        email={email}
        password={password}
        onComplete={handleProfileComplete}
        onBack={() => setShowProfileSetup(false)}
        loading={signupLoading}
      />
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
      <View style={styles.header}>
        <Image
          source={{ uri: 'https://imagedelivery.net/N-wC4umAd0dRtzKF6AjDrQ/40353caa-c7b8-49c6-d778-1fed6aea4300/public' }}
          style={styles.logo}
        />
        <Text style={styles.title}>{isLogin ? 'Welcome Back!' : 'Create Account on TeamSphere'}</Text>
        <Text style={styles.subtitle}>
          {isLogin ? 'Please Login to Continue' : 'Sign Up to get Started'}
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <MaterialIcons name="email" size={24} color="#666" style={styles.inputIcon} />
          <TextInput
            placeholder="Email"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />
        </View>

        <View style={styles.inputContainer}>
          <MaterialIcons name="lock-outline" size={24} color="#666" style={styles.inputIcon} />
          <TextInput
            placeholder="Password"
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />
        </View>

        {!isLogin && (
          <View style={styles.inputContainer}>
            <MaterialIcons name="lock-outline" size={24} color="#666" style={styles.inputIcon} />
            <TextInput
              placeholder="Confirm Password"
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
              editable={!loading}
            />
          </View>
        )}

        <TouchableOpacity 
          style={[styles.authButton, loading && styles.authButtonDisabled]} 
          onPress={handleAuth}
          disabled={loading}
        >
          <Text style={styles.authButtonText}>
            {loading ? 'Loading...' : (isLogin ? 'Login' : 'Continue')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.googleButton, loading && styles.googleButtonDisabled]} 
          onPress={handleGoogleAuth}
          disabled={loading}
        >
          <AntDesign name="google" size={24} />
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.switchAuth}
          onPress={() => {
            setIsLogin(!isLogin);
            setEmail('');
            setPassword('');
            setConfirmPassword('');
          }}
          disabled={loading}
        >
          <Text style={styles.switchAuthText}>
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
          </Text>
        </TouchableOpacity>
      </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  authButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  authButtonDisabled: {
    backgroundColor: '#ccc',
  },
  authButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  googleButton: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  googleButtonDisabled: {
    opacity: 0.5,
  },
  googleButtonText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  switchAuth: {
    marginTop: 24,
    alignItems: 'center',
  },
  switchAuthText: {
    color: '#007AFF',
    fontSize: 16,
  },
});