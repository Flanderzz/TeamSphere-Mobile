import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { SkeletonLoader } from './SkeletonLoader';
import { useTheme } from '../contexts/ThemeContext';
import { lightTheme, darkTheme } from '../constants/theme';

interface ChatSkeletonLoaderProps {
  fadeAnim: Animated.Value;
}

export const ChatSkeletonLoader = ({ fadeAnim }: ChatSkeletonLoaderProps) => {
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;

  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map((key) => (
        <View key={key} 
        style={[
          styles.messageContainer,
          key % 2 === 0 ? styles.rightMessage : styles.leftMessage
        ]}>
          {key % 2 !== 0 && (
            <SkeletonLoader 
              fadeAnim={fadeAnim}
              width={40}
              height={40}
              borderRadius={20}
              marginBottom={0}
              backgroundColor={colors.card}
            />
          )}
          <View style={[
            styles.messageContent,
            key % 2 === 0 ? styles.rightContent : styles.leftContent,
            { backgroundColor: key % 2 === 0 ? colors.primary : colors.surface }
          ]}>
            <SkeletonLoader 
              fadeAnim={fadeAnim}
              width={200}
              height={16}
              backgroundColor={key % 2 === 0 ? 'rgba(255, 255, 255, 0.3)' : colors.card}
            />
            <SkeletonLoader 
              fadeAnim={fadeAnim}
              width={100}
              height={12}
              backgroundColor={key % 2 === 0 ? 'rgba(255, 255, 255, 0.3)' : colors.card}
            />
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  leftMessage: {
    alignSelf: 'flex-start',
  },
  rightMessage: {
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
  },
  messageContent: {
    padding: 12,
    borderRadius: 16,
    maxWidth: '70%',
  },
  leftContent: {
    marginLeft: 8,
    borderTopLeftRadius: 4,
  },
  rightContent: {
    borderTopRightRadius: 4,
  },
});