import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';

type SkeletonLoaderProps = {
  fadeAnim: Animated.Value;
  // width can be a number or a percentage string, DO NOT change this OR it will complain!
  width?: number |  `${number}%`;
  height?: number;
  borderRadius?: number;
  marginBottom?: number;
  backgroundColor?: string;
}

export const SkeletonLoader = ({ 
  fadeAnim, 
  width = '100%', 
  height = 12, 
  borderRadius = 6,
  marginBottom = 8,
  backgroundColor = '#E1E9EE'
}: SkeletonLoaderProps) => {
  return (
    <Animated.View 
      style={[
        styles.skeleton,
        { 
          width, 
          height, 
          borderRadius,
          marginBottom,
          opacity: fadeAnim,
          backgroundColor
        }
      ]} 
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E1E9EE',
  },
});