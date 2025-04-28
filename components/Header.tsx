import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { useNavigation } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { MotiView } from 'moti';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type HeaderProps = {
  title: string;
  withBackButton?: boolean;
  bg?: 'primary' | 'default';
  isSticky?: boolean;
};

const AppHeader = ({
  title,
  withBackButton = true,
  bg = 'default',
  isSticky = true,
}: HeaderProps) => {
  const navigation = useNavigation();

  return (
    <MotiView
      from={{ opacity: 0, translateY: -50 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 500, delay: 100 }}
    >
      <View
        style={[
          styles.headerWrapStyle,
          bg === 'primary'
            ? styles.primaryHeaderWrapper
            : styles.defaultHeaderWrapper,
          isSticky && { position: 'sticky' },
        ]}
      >
        {withBackButton && (
          <ArrowLeft
            size={22}
            color={bg === 'primary' ? Colors.dark.text : Colors.light.text}
            onPress={() => navigation.goBack()}
            style={styles.navigator}
          />
        )}
        <Text
          numberOfLines={1}
          style={[styles.text, bg === 'primary' && styles.textWithPrimary]}
        >
          {title}
        </Text>
      </View>
    </MotiView>
  );
};

export default AppHeader;

const styles = StyleSheet.create({
  headerWrapStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.m,
    paddingVertical: Layout.spacing.m,
    zIndex: 100,
    borderEndEndRadius: Layout.borderRadius.xl,
    borderStartEndRadius: Layout.borderRadius.xl,
  },
  defaultHeaderWrapper: {
    backgroundColor: Colors.light.card,
    color: Colors.light.text,
  },
  primaryHeaderWrapper: {
    backgroundColor: Colors.light.primary,
    color: Colors.dark.text,
  },
  navigator: {
    marginRight: Layout.spacing.m,
  },
  text: {
    fontSize: 18,
  },
  textWithPrimary: {
    color: Colors.dark.text,
  },
});
