import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

type HeaderProps = {
  title: string;
  withBackButton?: boolean;
  bg?: 'primary' | 'default';
  rightContent?: React.ReactNode;
  leftContent?: React.ReactNode;
};

const FadeInView = ({
  children,
  duration = 500,
}: {
  children: React.ReactNode;
  duration?: number;
}) => {
  const [isVisible, setVisible] = React.useState(false);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-50);

  useEffect(() => {
    opacity.value = withTiming(isVisible ? 1 : 0, {
      duration,
      easing: Easing.linear,
    });
    translateY.value = withTiming(isVisible ? 0 : 50, {
      duration,
      easing: Easing.linear,
    });
  }, [isVisible]);

  React.useEffect(() => {
    setVisible(true);
    return () => {
      setVisible(false);
    };
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
};

const AppHeader = ({
  title,
  withBackButton = true,
  bg = 'primary',
  rightContent,
  leftContent,
}: HeaderProps) => {
  return (
    <FadeInView duration={300}>
      <LinearGradient
        colors={['#0096c7', '#00b4d8']}
        style={[
          styles.headerWrapStyle,
          bg === 'primary' ? styles.primaryHeaderWrapper : styles.defaultHeaderWrapper,
        ]}
      >
        <View style={styles.leftView}>
          {withBackButton && (
            <TouchableOpacity
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
            >
              <ChevronLeft
                size={24}
                color={bg === 'primary' ? Colors.dark.text : Colors.light.text}
              />
            </TouchableOpacity>
          )}
          {leftContent}
        </View>
        <View style={styles.centerView}>
          <Text numberOfLines={1} style={[styles.text, bg === 'primary' && styles.textWithPrimary]}>
            {title}
          </Text>
        </View>
        <View style={styles.rightView}>{rightContent}</View>
      </LinearGradient>
    </FadeInView>
  );
};

export default AppHeader;

const styles = StyleSheet.create({
  headerWrapStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.m,
    paddingVertical: Layout.spacing.m,
    zIndex: 100,
    borderBottomLeftRadius: Layout.borderRadius.xl,
    borderBottomRightRadius: Layout.borderRadius.xl,
  },
  defaultHeaderWrapper: {
    backgroundColor: Colors.light.card,
    color: Colors.light.text,
  },
  primaryHeaderWrapper: {
    backgroundColor: Colors.light.primary,
    color: Colors.dark.text,
  },
  leftView: { flexDirection: 'row', alignItems: 'center', gap: Layout.spacing.m },
  rightView: {},
  centerView: { flex: 1, alignItems: 'center' },

  text: {
    fontSize: 18,
    color: Colors.light.text,
    fontWeight: 'bold',
  },
  textWithPrimary: {
    color: Colors.dark.text,
  },
});
