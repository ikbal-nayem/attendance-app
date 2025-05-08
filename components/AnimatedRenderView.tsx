import React from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
  withSequence,
  withDelay,
  runOnJS
} from 'react-native-reanimated';
import { ViewStyle, StyleProp } from 'react-native';

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
  duration = 500,
  delay = 0,
  direction = 'center',
  index = 0,
  onAnimationEnd
}) => {
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(0.8);

  React.useEffect(() => {
    const animationDelay = delay + (index * 100);
    const animationDuration = duration;

    let translateXValue = 0;
    let translateYValue = 0;
    const scaleValue = 0.8;

    switch (direction) {
      case 'left':
        translateXValue = -50;
        break;
      case 'right':
        translateXValue = 50;
        break;
      case 'top':
        translateYValue = -50;
        break;
      case 'bottom':
        translateYValue = 50;
        break;
      case 'center':
      default:
        break;
    }

    const animation = withDelay(
      animationDelay,
      withSequence(
        withTiming(1, {
          duration: animationDuration,
          easing: Easing.out(Easing.exp)
        }),
        withSpring(1.05, {
          damping: 5,
          stiffness: 100,
          mass: 1,
          overshootClamping: false
        }, () => {
          if (onAnimationEnd) {
            runOnJS(onAnimationEnd)();
          }
        })
      )
    );

    opacity.value = withTiming(1, { duration: animationDuration });
    translateX.value = withTiming(translateXValue, { duration: animationDuration });
    translateY.value = withTiming(translateYValue, { duration: animationDuration });
    scale.value = withTiming(1, { duration: animationDuration });

    return () => {
      opacity.value = 0;
      translateX.value = 0;
      translateY.value = 0;
      scale.value = 0.8;
    };
  }, [delay, duration, direction, index, onAnimationEnd]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value }
      ]
    };
  });

  return (
    <Animated.View style={[style, animatedStyle]}>
      {children}
    </Animated.View>
  );
};

export default AnimatedRenderView;