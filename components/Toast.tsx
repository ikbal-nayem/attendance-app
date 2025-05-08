import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { BlurView } from 'expo-blur';
import { AlertTriangle, CheckCircle, CircleX, Info, X } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface ToastProps {
  isVisible: boolean;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  onHide: () => void;
}

const Toast: React.FC<ToastProps> = ({
  isVisible,
  message,
  type = 'info',
  duration = 3000,
  onHide,
}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-150);
  const insets = useSafeAreaInsets();

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    };
  });

  useEffect(() => {
    if (isVisible) {
      opacity.value = withTiming(1, { duration: 200 });
      translateY.value = withSpring(insets.top + 10, {
        damping: 15,
        stiffness: 120,
      });

      const timer = setTimeout(() => {
        if (opacity.value === 1) {
          opacity.value = withTiming(0, { duration: 300 });
          translateY.value = withTiming(-150, { duration: 300 }, (finished) => {
            if (finished) {
              runOnJS(onHide)();
            }
          });
        }
      }, duration);

      return () => clearTimeout(timer);
    } else if (opacity.value > 0) {
      opacity.value = withTiming(0, { duration: 300 });
      translateY.value = withTiming(-150, { duration: 300 }, (finished) => {
        if (finished) {
          runOnJS(onHide)();
        }
      });
    }
  }, [isVisible, duration, onHide, opacity, translateY, insets.top]);

  if (!isVisible && opacity.value === 0) {
    return null;
  }

  const textColor = Colors.dark.text;
  const iconColor =
    type === 'success'
      ? Colors.dark.success
      : type === 'error'
      ? Colors.dark.error
      : type === 'warning'
      ? Colors.dark.warning
      : Colors.dark.info;
  const closeIconColor = Colors.dark.subtext;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle color={iconColor} size={20} />;
      case 'error':
        return <CircleX color={iconColor} size={20} />;
      case 'warning':
        return <AlertTriangle color={iconColor} size={20} />;
      case 'info':
      default:
        return <Info color={iconColor} size={20} />;
    }
  };

  return (
    <Animated.View style={[styles.container, { top: 0 }, animatedStyle]}>
      <BlurView
        intensity={Platform.OS === 'ios' ? 50 : 80}
        tint="dark"
        style={styles.blurContainer}
      >
        <View style={[styles.toast]}>
          <View style={styles.iconContainer}>{getIcon()}</View>
          <Text style={[styles.message, { color: textColor }]}>{message}</Text>
          <TouchableOpacity onPress={onHide} style={styles.closeButton}>
            <X color={closeIconColor} size={18} />
          </TouchableOpacity>
        </View>
      </BlurView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1000,
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  blurContainer: {
    borderRadius: Layout.borderRadius.large,
    overflow: 'hidden',
    width: '100%',
    marginTop: 5,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '100%',
    backgroundColor: 'rgba(30, 30, 30, 0.85)',
  },
  iconContainer: {
    marginRight: 12,
  },
  message: {
    flex: 1,
    fontSize: 14,
    marginRight: 10,
  },
  closeButton: {
    padding: 5,
    marginLeft: 5,
  },
});

export default Toast;
