import React, { useCallback, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedProps,
  useSharedValue,  
  withTiming,
  withDelay,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { Path, Svg, Circle } from 'react-native-svg';
import { useTheme } from 'react-native-paper';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface AnimatedSplashProps {
  onAnimationComplete: () => void;
}

export default function AnimatedSplash({ onAnimationComplete }: AnimatedSplashProps) {
  const theme = useTheme();  
  const circleScale = useSharedValue(0);
  const circleOpacity = useSharedValue(1);
  const checkProgress = useSharedValue(0);

  const SIZE = 200;
  const STROKE_WIDTH = SIZE / 16;
  const CENTER = SIZE / 2;
  const RADIUS = SIZE / 3;

  const checkPath = `M ${CENTER - SIZE/6} ${CENTER} l ${SIZE/8} ${SIZE/8} l ${SIZE/4} -${SIZE/4}`;

  const animatedCircleProps = useAnimatedProps(() => ({
    r: RADIUS * circleScale.value,
    opacity: circleOpacity.value,
  }));

  const animatedCheckProps = useAnimatedProps(() => ({
    strokeDashoffset: 100 * (1 - checkProgress.value),
  }));

  const startAnimation = useCallback(() => {
    circleScale.value = withTiming(1, {
      duration: 600,
      easing: Easing.bezierFn(0.25, 0.1, 0.25, 1),
    });

    checkProgress.value = withDelay(
      400,
      withTiming(1, {
        duration: 800,
        easing: Easing.bezierFn(0.16, 1, 0.3, 1),
      })
    );

    circleOpacity.value = withDelay(
      1600,
      withTiming(0, {
        duration: 400,
        easing: Easing.out(Easing.ease),
      }, (finished) => {
        if (finished) {
          runOnJS(onAnimationComplete)();
        }
      })
    );
  }, [circleScale, checkProgress, circleOpacity, onAnimationComplete]);

  useEffect(() => {
    startAnimation();
  }, [startAnimation]);

  return (
    <View style={styles.container}>
      <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <AnimatedCircle
          cx={CENTER}
          cy={CENTER}
          fill={theme.colors.primary}
          animatedProps={animatedCircleProps}
        />
        <AnimatedPath
          d={checkPath}
          stroke="white"
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          strokeDasharray={[100, 100]}
          animatedProps={animatedCheckProps}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1B1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
