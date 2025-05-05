import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { X } from 'lucide-react-native';
import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

interface ChipProps {
  label: string;
  onClose?: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  closeIconColor?: string;
  variant?: 'default' | 'outline' | 'light';
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
}

const Chip: React.FC<ChipProps> = ({
  label,
  onClose,
  style,
  textStyle,
  closeIconColor,
  variant = 'default',
  color = 'primary',
}) => {
  const containerDynamicStyle: ViewStyle = {};
  const textDynamicStyle: TextStyle = {};
  let currentCloseIconColor = closeIconColor;

  const selectedColor = Colors.light[color as keyof typeof Colors.light];
  const selectedLightColor =
    Colors.light[`${color}Light` as keyof typeof Colors.light] || selectedColor;

  if (variant === 'default') {
    containerDynamicStyle.backgroundColor = selectedColor;
    textDynamicStyle.color = Colors.light.background;
    currentCloseIconColor = currentCloseIconColor ?? Colors.light.background;
  } else if (variant === 'outline') {
    containerDynamicStyle.borderWidth = 1;
    containerDynamicStyle.borderColor = selectedColor;
    containerDynamicStyle.backgroundColor = 'transparent';
    textDynamicStyle.color = selectedColor;
    currentCloseIconColor = currentCloseIconColor ?? selectedColor;
  } else if (variant === 'light') {
    containerDynamicStyle.backgroundColor = selectedLightColor;
    textDynamicStyle.color = selectedColor;
    currentCloseIconColor = currentCloseIconColor ?? selectedColor;
  }

  return (
    <View style={[styles.chipContainer, containerDynamicStyle, style]}>
      <Text style={[styles.chipText, textDynamicStyle, textStyle]}>{label}</Text>
      {onClose && (
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <X size={14} color={currentCloseIconColor} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  chipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Layout.borderRadius.xl,
    paddingVertical: Layout.spacing.xs,
    paddingHorizontal: Layout.spacing.s,
    marginRight: Layout.spacing.s,
    marginBottom: Layout.spacing.s,
  },
  chipText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginRight: Layout.spacing.xs,
  },
  closeButton: {
    padding: Layout.spacing.xs / 2,
  },
});

export default Chip;
