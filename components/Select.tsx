import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { Check, ChevronDown, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import Button from './Button';

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
  const [modalVisible, setModalVisible] = useState(false);

  const selectedOption = options.find((option) => option.value === value);
  const hasError = !!error;

  const openModal = () => {
    if (!disabled) {
      setModalVisible(true);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const handleSelect = (option: SelectOption) => {
    onChange(option.value);
    closeModal();
  };

  const renderItem = ({ item }: { item: SelectOption }) => {
    const isSelected = item.value === value;

    return (
      <TouchableOpacity
        style={[styles.optionItem, isSelected && styles.selectedOptionItem]}
        onPress={() => handleSelect(item)}
      >
        <Text
          style={[styles.optionText, isSelected && styles.selectedOptionText]}
        >
          {item.label}
        </Text>
        {isSelected && <Check size={20} color={Colors.light.primary} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity
        style={[
          styles.selectContainer,
          hasError && styles.selectContainerError,
          disabled && styles.selectContainerDisabled,
          selectStyle,
        ]}
        onPress={openModal}
        disabled={disabled}
      >
        <Text
          style={[
            styles.selectText,
            !selectedOption && styles.placeholderText,
            disabled && styles.selectTextDisabled,
          ]}
          numberOfLines={1}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <ChevronDown
          size={20}
          color={disabled ? Colors.light.subtext : Colors.light.text}
        />
      </TouchableOpacity>

      {(error || helper) && (
        <Text style={[styles.helperText, hasError && styles.errorText]}>
          {error || helper}
        </Text>
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{modalTitle}</Text>
              <TouchableOpacity onPress={closeModal}>
                <X size={24} color={Colors.light.text} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={options}
              renderItem={renderItem}
              keyExtractor={(item) => item.value}
              contentContainerStyle={styles.optionsList}
              showsVerticalScrollIndicator={false}
            />

            <View style={styles.modalFooter}>
              <Button
                title="Close"
                variant="outline"
                onPress={closeModal}
                fullWidth
              />
            </View>
          </View>
        </View>
      </Modal>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.light.inputBorder,
    borderRadius: Layout.borderRadius.medium,
    backgroundColor: Colors.light.inputBackground,
    height: Layout.inputHeight,
    paddingHorizontal: Layout.spacing.m,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.light.card,
    borderTopLeftRadius: Layout.borderRadius.large,
    borderTopRightRadius: Layout.borderRadius.large,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Layout.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  modalTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: Colors.light.text,
  },
  optionsList: {
    paddingVertical: Layout.spacing.s,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Layout.spacing.m,
    paddingHorizontal: Layout.spacing.l,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  selectedOptionItem: {
    backgroundColor: `${Colors.light.primary}10`,
  },
  optionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.light.text,
  },
  selectedOptionText: {
    fontFamily: 'Inter-Medium',
    color: Colors.light.primary,
  },
  modalFooter: {
    padding: Layout.spacing.m,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
});

export default Select;
