import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';

type CardProps = {
  children: React.ReactNode;
  variant?: 'default' | 'outlined' | 'elevated';
  style?: StyleProp<ViewStyle>;
};

const Card: React.FC<CardProps> = ({ children, variant = 'default', style }) => {
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