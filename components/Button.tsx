import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  View,
  StyleProp,
  ViewStyle,
  TextStyle
} from 'react-native';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
}) => {
  const getButtonStyles = () => {
    let buttonStyles: StyleProp<ViewStyle> = [styles.button];
    
    // Variant styles
    switch (variant) {
      case 'primary':
        buttonStyles = [...buttonStyles, styles.primary];
        break;
      case 'secondary':
        buttonStyles = [...buttonStyles, styles.secondary];
        break;
      case 'outline':
        buttonStyles = [...buttonStyles, styles.outline];
        break;
      case 'ghost':
        buttonStyles = [...buttonStyles, styles.ghost];
        break;
    }
    
    // Size styles
    switch (size) {
      case 'small':
        buttonStyles = [...buttonStyles, styles.small];
        break;
      case 'medium':
        buttonStyles = [...buttonStyles, styles.medium];
        break;
      case 'large':
        buttonStyles = [...buttonStyles, styles.large];
        break;
    }
    
    // Full width
    if (fullWidth) {
      buttonStyles = [...buttonStyles, styles.fullWidth];
    }
    
    // Disabled state
    if (disabled || loading) {
      buttonStyles = [...buttonStyles, styles.disabled];
    }
    
    return buttonStyles;
  };
  
  const getTextStyles = () => {
    let textStyles: StyleProp<TextStyle> = [styles.text];
    
    switch (variant) {
      case 'primary':
        textStyles = [...textStyles, styles.primaryText];
        break;
      case 'secondary':
        textStyles = [...textStyles, styles.secondaryText];
        break;
      case 'outline':
        textStyles = [...textStyles, styles.outlineText];
        break;
      case 'ghost':
        textStyles = [...textStyles, styles.ghostText];
        break;
    }
    
    switch (size) {
      case 'small':
        textStyles = [...textStyles, styles.smallText];
        break;
      case 'medium':
        textStyles = [...textStyles, styles.mediumText];
        break;
      case 'large':
        textStyles = [...textStyles, styles.largeText];
        break;
    }
    
    if (disabled || loading) {
      textStyles = [...textStyles, styles.disabledText];
    }
    
    return textStyles;
  };

  return (
    <TouchableOpacity
      style={[getButtonStyles(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? 'white' : Colors.light.primary}
          size="small"
        />
      ) : (
        <View style={styles.contentContainer}>
          {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
          <Text style={[getTextStyles(), textStyle]}>{title}</Text>
          {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: Layout.borderRadius.xxl,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: Colors.light.primary,
  },
  secondary: {
    backgroundColor: Colors.light.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  small: {
    height: 36,
    paddingHorizontal: Layout.spacing.m,
  },
  medium: {
    height: Layout.buttonHeight,
    paddingHorizontal: Layout.spacing.l,
  },
  large: {
    height: 60,
    paddingHorizontal: Layout.spacing.xl,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  primaryText: {
    color: 'white',
  },
  secondaryText: {
    color: 'white',
  },
  outlineText: {
    color: Colors.light.primary,
  },
  ghostText: {
    color: Colors.light.primary,
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
  disabledText: {
    opacity: 0.6,
  },
  iconLeft: {
    marginRight: Layout.spacing.s,
  },
  iconRight: {
    marginLeft: Layout.spacing.s,
  },
});

export default Button;