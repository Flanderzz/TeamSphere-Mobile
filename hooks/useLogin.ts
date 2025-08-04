import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner-native";
import { getRandomPfp } from "../utils/getRandomPfp";

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
          avatar: /*profileData.profilePicture || */await getRandomPfp()
        };
        
        await signIn(loginData.jwt, user);
        
  
      } catch (error: any) {
        // network errors
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          toast.error("Network error. Please check your connection");
          return;
        }
        
        // JSON parsing errors
        if (error instanceof SyntaxError) {
          toast.error("Server returned invalid response. Please try again");
          return;
        }
        
        // Use the specific error message we threw, or fallback
        const errorMessage = error.message || "Login failed. Please try again";
        toast.error(errorMessage);
        
      } finally {
        setLoading(false);
      }
    };
}

export default useLogin;