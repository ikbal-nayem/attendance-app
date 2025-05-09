import React, { useEffect } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

interface AnimatedRenderViewProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  duration?: number;
  delay?: number;
  direction?: 'left' | 'right' | 'top' | 'bottom' | 'center';
  index?: number;
  onAnimationEnd?: () => void;
}

const AnimatedRenderView: React.FC<AnimatedRenderViewProps> = ({
  children,
  style,
  duration = 700,
  delay = 0,
  direction = 'center',
  index = 0,
  onAnimationEnd,
}) => {
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(direction === 'center' ? 0.85 : 0.9);

  useEffect(() => {
    const animationDelay = delay + index * 100;

    let initialTranslateX = 0;
    let initialTranslateY = 0;
    const targetTranslateX = 0;
    const targetTranslateY = 0;

    // Set initial positions based on direction for the slide-in effect
    switch (direction) {
      case 'left':
        initialTranslateX = -50;
        break;
      case 'right':
        initialTranslateX = 50;
        break;
      case 'top':
        initialTranslateY = -50;
        break;
      case 'bottom':
        initialTranslateY = 50;
        break;
      case 'center':
      default:
        // For center, we might rely more on scale and opacity
        break;
    }

    // Set initial values before animation starts
    opacity.value = 0;
    translateX.value = initialTranslateX;
    translateY.value = initialTranslateY;
    scale.value = direction === 'center' ? 0.85 : 0.9;

    const animationSequence = withSequence(
      withTiming(1, {
        duration: duration * 0.7,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }),
      withSpring(1.0, {
        damping: 15,
        stiffness: 100,
        mass: 1,
        overshootClamping: false,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01,
      })
    );

    opacity.value = withDelay(
      animationDelay,
      withTiming(1, {
        duration: duration * 0.7,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      })
    );

    translateX.value = withDelay(
      animationDelay,
      withTiming(targetTranslateX, {
        duration: duration,
        easing: Easing.bezier(0.33, 1, 0.68, 1),
      })
    );

    translateY.value = withDelay(
      animationDelay,
      withTiming(targetTranslateY, {
        duration: duration,
        easing: Easing.bezier(0.33, 1, 0.68, 1),
      })
    );

    // The scale animation will use the sequence with the spring effect
    scale.value = withDelay(
      animationDelay,
      withSequence(
        withTiming(1.05, {
          duration: duration * 0.7,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        }),
        withSpring(
          1,
          {
            damping: 12,
            stiffness: 90,
            mass: 0.8,
            overshootClamping: false,
          },
          () => {
            if (onAnimationEnd) {
              runOnJS(onAnimationEnd)();
            }
          }
        )
      )
    );
    return () => {};
  }, [delay, duration, direction, index, onAnimationEnd, opacity, scale, translateX, translateY]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
};

export default AnimatedRenderView;
