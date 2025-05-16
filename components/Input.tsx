import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { Eye, EyeOff } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  helper?: string;
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  inputContainerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  rightIcon?: React.ReactNode;
  leftIcon?: React.ReactNode;
  secureTextEntry?: boolean;
  onRightIconPress?: () => void;
  onLeftIconPress?: () => void;
  showPasswordToggle?: boolean;
  required?: boolean;
  size?: 'small' | 'medium' | 'large';
};

const Input: React.FC<InputProps> = ({
  label,
  error,
  helper,
  containerStyle,
  labelStyle,
  inputContainerStyle,
  inputStyle,
  rightIcon,
  leftIcon,
  secureTextEntry,
  onRightIconPress,
  onLeftIconPress,
  showPasswordToggle = false,
  required = false,
  size = 'medium',
  ...rest
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const hasError = !!error;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text
          style={[
            styles.label,
            size === 'small' && styles.labelSmall,
            size === 'large' && styles.labelLarge,
            labelStyle,
          ]}
        >
          {label} {required && <Text style={{ color: Colors.light.error }}>*</Text>}
        </Text>
      )}

      <View
        style={[
          styles.inputContainer,
          size === 'small' && styles.inputContainerSmall,
          size === 'medium' && styles.inputContainerMedium,
          size === 'large' && styles.inputContainerLarge,
          hasError && styles.inputContainerError,
          inputContainerStyle,
        ]}
      >
        {leftIcon && (
          <TouchableOpacity
            style={[
              styles.leftIcon,
              size === 'small' && styles.iconSmall,
              size === 'large' && styles.iconLarge,
            ]}
            onPress={onLeftIconPress}
            disabled={!onLeftIconPress}
          >
            {React.cloneElement(leftIcon as React.ReactElement, {
              size: size === 'small' ? 16 : size === 'large' ? 22 : 20,
            })}
          </TouchableOpacity>
        )}

        <TextInput
          style={[
            styles.input,
            size === 'small' && styles.inputSmall,
            size === 'medium' && styles.inputMedium,
            size === 'large' && styles.inputLarge,
            !!leftIcon && styles.inputWithLeftIcon,
            !!(rightIcon || showPasswordToggle) && {
              paddingRight: size === 'small' ? 35 : size === 'large' ? 45 : 40,
            },
            rest.readOnly && styles.inputReadOnly,
            inputStyle,
          ]}
          placeholderTextColor={Colors.light.subtext}
          secureTextEntry={showPasswordToggle ? !isPasswordVisible : secureTextEntry}
          {...rest}
        />

        {showPasswordToggle && (
          <TouchableOpacity
            style={[
              styles.rightIcon,
              size === 'small' && styles.iconSmall,
              size === 'large' && styles.iconLarge,
            ]}
            onPress={togglePasswordVisibility}
          >
            {isPasswordVisible ? (
              <EyeOff
                size={size === 'small' ? 16 : size === 'large' ? 22 : 20}
                color={Colors.light.subtext}
              />
            ) : (
              <Eye
                size={size === 'small' ? 16 : size === 'large' ? 22 : 20}
                color={Colors.light.subtext}
              />
            )}
          </TouchableOpacity>
        )}

        {rightIcon && !showPasswordToggle && (
          <TouchableOpacity
            style={[
              styles.rightIcon,
              size === 'small' && styles.iconSmall,
              size === 'large' && styles.iconLarge,
            ]}
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
          >
            {React.cloneElement(rightIcon as React.ReactElement, {
              size: size === 'small' ? 16 : size === 'large' ? 22 : 20,
            })}
          </TouchableOpacity>
        )}
      </View>

      {(error || helper) && (
        <Text style={[styles.helperText, hasError && styles.errorText]}>{error || helper}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Layout.spacing.m,
  },
  label: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: Layout.spacing.xs,
  },
  labelSmall: {
    fontSize: 12,
    marginBottom: Layout.spacing.xs,
  },
  labelLarge: {
    fontSize: 16,
    marginBottom: Layout.spacing.s,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.inputBorder,
    borderRadius: Layout.borderRadius.xxl,
    backgroundColor: Colors.light.inputBackground,
    overflow: 'hidden',
  },
  inputContainerSmall: {
    height: 36,
  },
  inputContainerMedium: {
    height: Layout.inputHeight, // Default height
  },
  inputContainerLarge: {
    height: 60,
  },
  inputContainerError: {
    borderColor: Colors.light.error,
  },
  input: {
    flex: 1,
    height: '100%',
    color: Colors.light.text,
    fontFamily: 'Inter-Regular',
  },
  inputReadOnly: {
    backgroundColor: Colors.light.subtext + '10',
    color: Colors.light.subtext,
  },
  inputSmall: {
    fontSize: 14,
    paddingHorizontal: Layout.spacing.s,
  },
  inputMedium: {
    fontSize: 16, // Default font size
    paddingHorizontal: Layout.spacing.m,
  },
  inputLarge: {
    fontSize: 18,
    paddingHorizontal: Layout.spacing.l,
  },
  inputWithLeftIcon: {
    paddingLeft: 0,
  },
  inputWithRightIcon: {
    paddingRight: 0,
  },
  leftIcon: {
    paddingHorizontal: Layout.spacing.m,
  },
  rightIcon: {
    position: 'absolute',
    right: Layout.spacing.m,
  },
  iconSmall: {
    paddingHorizontal: Layout.spacing.s,
    right: Layout.spacing.s,
  },
  iconLarge: {
    paddingHorizontal: Layout.spacing.l,
    right: Layout.spacing.l,
  },
  helperText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: Colors.light.subtext,
    marginTop: Layout.spacing.xs,
  },
  errorText: {
    color: Colors.light.error,
  },
});

export default Input;
