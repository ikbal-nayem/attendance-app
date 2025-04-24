import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { Picker } from '@react-native-picker/picker';
import { ChevronDown } from 'lucide-react-native';
import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

type SelectOption = {
  label: string;
  value: string;
};

type SelectProps = {
  label?: string;
  options: SelectOption[];
  value?: string;
  placeholder?: string;
  onChange: (value: string) => void;
  error?: string;
  helper?: string;
  containerStyle?: StyleProp<ViewStyle>;
  selectStyle?: StyleProp<ViewStyle>;
  modalTitle?: string;
  searchable?: boolean;
  disabled?: boolean;
};

const Select: React.FC<SelectProps> = ({
  label,
  options,
  value,
  placeholder = 'Select an option',
  onChange,
  error,
  helper,
  containerStyle,
  selectStyle,
  modalTitle = 'Select an option',
  disabled = false,
}) => {
  const selectedOption = options.find((option) => option.value === value);
  const hasError = !!error;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View
        style={[
          styles.selectContainer,
          hasError && styles.selectContainerError,
          disabled && styles.selectContainerDisabled,
          selectStyle,
        ]}
      >
        <Picker
          selectedValue={value}
          onValueChange={onChange}
          style={styles.picker}
          enabled={!disabled}
          dropdownIconRippleColor="transparent"
        >
          <Picker.Item label={placeholder} value="" />
          {options.map((option) => (
            <Picker.Item
              key={option.value}
              label={option.label}
              value={option.value}
            />
          ))}
        </Picker>
        <ChevronDown
          size={20}
          color={disabled ? Colors.light.subtext : Colors.light.text}
          style={styles.chevron}
        />
      </View>

      {(error || helper) && (
        <Text style={[styles.helperText, hasError && styles.errorText]}>
          {error || helper}
        </Text>
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
  selectContainer: {
    borderWidth: 1,
    borderColor: Colors.light.inputBorder,
    borderRadius: Layout.borderRadius.medium,
    backgroundColor: Colors.light.inputBackground,
    height: Layout.inputHeight,
    justifyContent: 'center',
  },
  picker: {
    flex: 1,
    color: Colors.light.text,
  },
  chevron: {
    position: 'absolute',
    right: Layout.spacing.m,
  },
  selectContainerError: {
    borderColor: Colors.light.error,
  },
  selectContainerDisabled: {
    backgroundColor: Colors.light.border,
    borderColor: Colors.light.border,
    opacity: 0.6,
  },
  selectText: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.light.text,
  },
  selectTextDisabled: {
    color: Colors.light.subtext,
  },
  placeholderText: {
    color: Colors.light.subtext,
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

export default Select;
