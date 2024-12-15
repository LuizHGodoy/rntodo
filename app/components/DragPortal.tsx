// biome-ignore lint/style/useImportType: <explanation>
import React from 'react';
import { StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { Portal } from 'react-native-paper';

interface DragPortalProps {
  children: React.ReactNode;
  isVisible: boolean;
}

export default function DragPortal({ children, isVisible }: DragPortalProps) {
  if (!isVisible) return null;

  return (
    <Portal>
      <Animated.View style={StyleSheet.absoluteFill} pointerEvents="none">
        {children}
      </Animated.View>
    </Portal>
  );
}
