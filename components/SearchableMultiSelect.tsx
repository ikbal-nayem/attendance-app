import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { Check, ChevronDown, Search, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from 'react-native';

import Chip from './Chip'; // Import the Chip component
import Input from './Input';

interface Option {
  code: string;
  name: string;
}

type SearchableMultiSelectProps = {
  label?: string;
  options: Option[];
  value: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  error?: string;
  helper?: string;
  containerStyle?: StyleProp<ViewStyle>;
  selectStyle?: StyleProp<ViewStyle>;
  modalTitle?: string;
  disabled?: boolean;
  required?: boolean;
};

const SearchableMultiSelect: React.FC<SearchableMultiSelectProps> = ({
  label,
  options,
  value = [],
  onChange,
  placeholder = 'Select options',
  error,
  helper,
  containerStyle,
  selectStyle,
  modalTitle = 'Select Options',
  disabled = false,
  required = false,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const hasError = !!error;

  const filteredOptions = options.filter((option) =>
    option.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleOption = (optionValue: string) => {
    const isSelected = value.includes(optionValue);
    if (isSelected) {
      onChange(value.filter((val) => val !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const renderItem = ({ item }: { item: Option }) => {
    const isSelected = value.includes(item.code);
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.optionItem}
        onPress={() => handleToggleOption(item.code)}
      >
        <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
          {item.name}
        </Text>
        {isSelected && <Check size={20} color={Colors.light.primary} />}
      </TouchableOpacity>
    );
  };

  const selectedLabels = options
    .filter((option) => value.includes(option.code))
    .map((option) => option.name);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={styles.label}>
          {label} {required && <Text style={{ color: Colors.light.error }}>*</Text>}
        </Text>
      )}

      <TouchableOpacity
        style={[
          styles.selectInputContainer,
          hasError && styles.selectContainerError,
          disabled && styles.selectContainerDisabled,
          selectStyle,
        ]}
        onPress={() => !disabled && setModalVisible(true)}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.selectText,
            selectedLabels.length === 0 && styles.placeholderText,
            disabled && styles.selectTextDisabled,
          ]}
          numberOfLines={1}
        >
          {selectedLabels.length > 0 ? placeholder : placeholder}
        </Text>
        <ChevronDown
          size={20}
          color={disabled ? Colors.light.subtext : Colors.light.text}
        />
      </TouchableOpacity>

      {/* Display selected options as chips */}
      {value.length > 0 && (
        <View style={styles.selectedChipsContainer}>
          {value.map((selectedValue) => {
            const selectedOption = options.find((opt) => opt.code === selectedValue);
            if (!selectedOption) return null;

            return (
              <Chip
                key={selectedValue}
                label={selectedOption.name}
                onClose={() => handleToggleOption(selectedValue)}
                variant="light"
                color="primary"
              />
            );
          })}
        </View>
      )}

      {(error || helper) && (
        <Text style={[styles.helperText, hasError && styles.errorText]}>
          {error || helper}
        </Text>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <SafeAreaView style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{modalTitle}</Text>
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    style={styles.closeButton}
                  >
                    <X size={24} color={Colors.light.text} />
                  </TouchableOpacity>
                </View>
                <View style={styles.searchContainer}>
                  <Input
                    placeholder="Search..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    leftIcon={<Search size={20} color={Colors.light.subtext} />}
                  />
                </View>
                {filteredOptions.length === 0 && (
                  <Text style={styles.noOptionsText}>No options found</Text>
                )}
                <FlatList
                  data={filteredOptions}
                  renderItem={renderItem}
                  keyExtractor={(item) => item.code}
                  keyboardShouldPersistTaps="handled"
                />
              </View>
            </TouchableWithoutFeedback>
          </SafeAreaView>
        </TouchableWithoutFeedback>
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
  selectInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.inputBorder,
    borderRadius: Layout.borderRadius.xl,
    backgroundColor: Colors.light.inputBackground,
    height: Layout.inputHeight,
    paddingHorizontal: Layout.spacing.m,
  },
  selectContainerError: {
    borderColor: Colors.light.error,
  },
  selectContainerDisabled: {
    backgroundColor: Colors.light.border,
    opacity: 0.6,
  },
  selectText: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.light.text,
    marginRight: Layout.spacing.m,
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
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  modalContent: {
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: Layout.borderRadius.large,
    borderTopRightRadius: Layout.borderRadius.large,
    maxHeight: '60%',
    paddingBottom: Layout.spacing.l,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Layout.spacing.m,
    paddingHorizontal: Layout.spacing.l,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  modalTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: Colors.light.text,
  },
  closeButton: {
    padding: Layout.spacing.xs,
  },
  searchContainer: {
    marginVertical: Layout.spacing.s,
    paddingHorizontal: Layout.spacing.s,
  },
  optionItem: {
    paddingVertical: Layout.spacing.m,
    paddingHorizontal: Layout.spacing.l,
    borderWidth: 1,
    borderColor: Colors.light.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.light.text,
    flex: 1,
    marginRight: Layout.spacing.s,
  },
  selectedOptionText: {
    color: Colors.light.primary,
    fontFamily: 'Inter-SemiBold',
  },
  noOptionsText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.light.subtext,
    textAlign: 'center',
    padding: Layout.spacing.l,
  },
  selectedChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: Layout.spacing.s,
  },
  removeChipButton: {
    padding: Layout.spacing.xs / 2,
  },
});

export default SearchableMultiSelect;
