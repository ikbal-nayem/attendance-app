import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Loading from './Loading';

type CardProps = {
  children: React.ReactNode;
  variant?: 'default' | 'outlined' | 'elevated';
  style?: StyleProp<ViewStyle>;
  isLoading?: boolean;
};

const Card: React.FC<CardProps> = ({ children, variant = 'default', style, isLoading }) => {
  const getCardStyles = () => {
    let cardStyles: StyleProp<ViewStyle> = [styles.card];

    switch (variant) {
      case 'default':
        cardStyles = [...cardStyles];
        break;
      case 'outlined':
        cardStyles = [...cardStyles, styles.outlined];
        break;
      case 'elevated':
        cardStyles = [...cardStyles, styles.elevated];
        break;
    }

    return cardStyles;
  };

  if (isLoading) {
    return (
      <View style={[getCardStyles(), style]}>
        <Loading />
      </View>
    );
  }

  return <View style={[getCardStyles(), style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: Layout.borderRadius.large,
    padding: Layout.spacing.l,
  },
  outlined: {
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  elevated: {
    ...Layout.shadow.medium,
  },
});

export default Card;
