// gpt slop to get websockets working in the mean time
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner-native';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
}

interface WebSocketContextType {
  sendMessage: (message: any) => void;
  isConnected: boolean;
  messages: Message[];
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Array<Message>>([]);

  // Simulate Socket.IO connection for demo
  useEffect(() => {
    if (token) {
      // In a real app, replace with your Socket.IO server URL
      const mockSocket = io('http://localhost:3000', {
        auth: { token },
        autoConnect: false // Prevent actual connection attempts in demo
      });

      // Simulate successful connection
      setIsConnected(true);
      setSocket(mockSocket);

      // Simulate receiving messages every 30 seconds
      const messageInterval = setInterval(() => {
        const mockMessage = {
          id: Date.now().toString(),
          sender: 'DemoUser',
          content: 'This is a simulated Socket.IO message. This is a simulated Socket.IO message. This is a simulated Socket.IO message. This is a simulated Socket.IO message. This is a simulated Socket.IO message. This is a simulated Socket.IO message. This is a simulated Socket.IO message. This is a simulated Socket.IO message. ',
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, mockMessage]);
      }, 30000);

      // Cleanup
      return () => {
        clearInterval(messageInterval);
        setIsConnected(false);
        if (socket) {
          socket.close();
        }
      };
    }
  }, [token]);

  const sendMessage = (message: any) => {
    if (!isConnected) {
      toast.error('Not connected to chat server');
      return;
    }

    // Simulate sending a message
    const mockResponse = {
      id: Date.now().toString(),
      sender: 'You',
      content: message.content,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, mockResponse]);
    toast.success('Message sent!');    // Simulate response
    setTimeout(() => {
      // Simulate response


      setTimeout(() => {
        const responseMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'DemoUser',
          content: 'Thanks for your message!',
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, responseMessage]);
      }, 2000);
    }, 1000);
  };

  return (
    <WebSocketContext.Provider value={{ sendMessage, isConnected, messages }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}