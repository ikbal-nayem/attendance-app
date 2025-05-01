import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type SwitchSize = 'small' | 'medium' | 'large';

type SwitchProps = {
  value: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  size?: SwitchSize;
};

const sizeStyles = {
  small: {
    trackWidth: 40,
    trackHeight: 24,
    trackBorderRadius: 12,
    thumbSize: 20,
    thumbBorderRadius: 10,
    thumbTranslateX: 16,
  },
  medium: {
    trackWidth: 50,
    trackHeight: 30,
    trackBorderRadius: 15,
    thumbSize: 26,
    thumbBorderRadius: 13,
    thumbTranslateX: 20,
  },
  large: {
    trackWidth: 60,
    trackHeight: 36,
    trackBorderRadius: 18,
    thumbSize: 30,
    thumbBorderRadius: 15,
    thumbTranslateX: 26,
  },
};

export default function Switch({
  value,
  onChange,
  label,
  size = 'medium',
}: SwitchProps) {
  const thumbTranslateX = useRef(
    new Animated.Value(value ? sizeStyles[size].thumbTranslateX : 0)
  ).current;

  useEffect(() => {
    Animated.timing(thumbTranslateX, {
      toValue: value ? sizeStyles[size].thumbTranslateX : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [value, size, thumbTranslateX]);

  const currentSizeStyles = sizeStyles[size];

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={[
          styles.track,
          {
            width: currentSizeStyles.trackWidth,
            height: currentSizeStyles.trackHeight,
            borderRadius: currentSizeStyles.trackBorderRadius,
          },
          value && styles.trackActive,
        ]}
        onPress={() => onChange(!value)}
        activeOpacity={0.8}
      >
        <Animated.View
          style={[
            styles.thumb,
            {
              width: currentSizeStyles.thumbSize,
              height: currentSizeStyles.thumbSize,
              borderRadius: currentSizeStyles.thumbBorderRadius,
              transform: [{ translateX: thumbTranslateX }],
            },
          ]}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Layout.spacing.m,
  },
  label: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.light.text,
  },
  track: {
    backgroundColor: Colors.light.border,
    padding: 2,
    justifyContent: 'center',
  },
  trackActive: {
    backgroundColor: Colors.light.primary,
  },
  thumb: {
    backgroundColor: Colors.light.card,
    ...Layout.shadow.light,
  },
});
