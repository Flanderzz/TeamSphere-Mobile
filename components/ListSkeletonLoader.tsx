import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { SkeletonLoader } from './SkeletonLoader';

interface ListSkeletonLoaderProps {
  fadeAnim: Animated.Value;
  count?: number;
  showAvatar?: boolean;
}

export const ListSkeletonLoader = ({ 
  fadeAnim, 
  count = 5,
  showAvatar = true 
}: ListSkeletonLoaderProps) => {
  return (
    <View style={styles.container}>
      {[...Array(count)].map((_, index) => (
        <View key={index} style={styles.itemContainer}>
          {showAvatar && (
            <SkeletonLoader 
              fadeAnim={fadeAnim}
              width={50}
              height={50}
              borderRadius={25}
              marginBottom={0}
            />
          )}
          <View style={styles.contentContainer}>
            <SkeletonLoader 
              fadeAnim={fadeAnim}
              width="60%"
              height={16}
            />
            <SkeletonLoader 
              fadeAnim={fadeAnim}
              width="40%"
              height={12}
            />
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  itemContainer: {
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
  contentContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
});