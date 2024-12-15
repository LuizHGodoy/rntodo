import React from 'react';
import { StyleSheet, Platform, type TextStyle } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  runOnJS,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import type Todo from '../types/todo';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';

const AnimatedCard = Animated.createAnimatedComponent(Card);
const SWIPE_THRESHOLD = 80;

interface DraggableCardProps {
  todo: Todo;
  onDragEnd: (completed: boolean) => void;
  onToggle: () => void;
  onRemove: () => void;
  onEdit: () => void;
  onDragUpdate: (x: number) => void;
}

export default function DraggableCard({ todo, onDragEnd, onToggle, onRemove, onEdit, onDragUpdate }: DraggableCardProps) {
  const theme = useTheme();
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const isDragging = useSharedValue(false);
  const isDeleting = useSharedValue(false);
  const zIndex = useSharedValue(1);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

  const handleRemove = React.useCallback(() => {
    setShowDeleteDialog(true);
  }, []);

  const handleConfirmDelete = React.useCallback(() => {
    setShowDeleteDialog(false);
    opacity.value = withTiming(0, { duration: 200 }, () => {
      runOnJS(onRemove)();
    });
  }, [onRemove, opacity]);

  const handleCancelDelete = React.useCallback(() => {
    setShowDeleteDialog(false);
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
    scale.value = withSpring(1);
    isDeleting.value = false;
  }, [translateX, translateY, scale, isDeleting]);

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      'worklet';
      isDragging.value = true;
      scale.value = withSpring(1.05);
      zIndex.value = 999;
    })
    .onUpdate((event) => {
      'worklet';
      if (Math.abs(event.translationY) > 20 && Math.abs(event.translationX) < 20) {
        isDeleting.value = true;
        translateY.value = event.translationY;
        scale.value = withSpring(0.95);
      } else if (!isDeleting.value) {
        translateX.value = event.translationX;
        translateY.value = event.translationY;
        runOnJS(onDragUpdate)(event.translationX);
      }
    })
    .onEnd((event) => {
      'worklet';
      if (isDeleting.value && Math.abs(event.translationY) > SWIPE_THRESHOLD) {
        runOnJS(handleRemove)();
      } else {
        const moveToCompleted = event.translationX > 100;
        const moveToPending = event.translationX < -100;

        if (moveToCompleted || moveToPending) {
          runOnJS(onDragEnd)(!todo.completed);
        }

        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        scale.value = withSpring(1);
      }
      
      isDragging.value = false;
      isDeleting.value = false;
      zIndex.value = 1;
      runOnJS(onDragUpdate)(0);
    })
    .onFinalize(() => {
      'worklet';
      scale.value = withSpring(1);
      isDragging.value = false;
      isDeleting.value = false;
      zIndex.value = 1;
      runOnJS(onDragUpdate)(0);
    });

  const tapGesture = Gesture.Tap().onEnd(() => {
    'worklet';
    if (!isDragging.value) {
      runOnJS(onEdit)();
    }
  });

  const longPressGesture = Gesture.LongPress().onEnd(() => {
    'worklet';
    runOnJS(handleRemove)();
  });

  const gesture = Gesture.Race(panGesture, tapGesture, longPressGesture);

  const animatedStyle = useAnimatedStyle(() => {
    const rotateZ = interpolate(
      translateY.value,
      [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD],
      [-15, 0, 15],
      'clamp'
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
        { rotateZ: `${rotateZ}deg` },
      ],
      opacity: opacity.value,
      zIndex: zIndex.value,
      ...(Platform.OS === 'ios' ? {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: isDragging.value ? 4 : 0,
        },
        shadowOpacity: isDragging.value ? 0.3 : 0,
        shadowRadius: isDragging.value ? 4 : 0,
      } : {
        elevation: isDragging.value ? 8 : 1,
      }),
      backgroundColor: isDeleting.value 
        ? theme.colors.errorContainer 
        : theme.colors.elevation.level2,
    };
  });

  const cardTextStyle = React.useMemo((): TextStyle => ({
    color: isDeleting.value 
      ? theme.colors.error
      : theme.colors.onSurface,
    textDecorationLine: todo.completed ? 'line-through' as const : 'none' as const,
  }), [isDeleting, theme, todo]);

  return (
    <>
      <GestureDetector gesture={gesture}>
        <AnimatedCard style={[styles.card, animatedStyle]}>
          <Card.Content>
            <Text
              style={[
                styles.cardText,
                cardTextStyle,
              ]}
            >
              {todo.title}
            </Text>
          </Card.Content>
        </AnimatedCard>
      </GestureDetector>

      <DeleteConfirmationDialog
        visible={showDeleteDialog}
        onDismiss={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Todo"
        content={`Are you sure you want to delete "${todo.title}"?`}
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 8,
  },
  cardText: {
    fontSize: 16,
  },
});
