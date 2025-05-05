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
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from 'react-native';

import Chip from './Chip'; // Import the Chip component

interface Option {
  label: string;
  value: string;
}

type SearchableMultiSelectProps = {
  label?: string;
  options: Option[];
  value: string[]; // Array of selected values
  onChange: (values: string[]) => void;
  placeholder?: string;
  error?: string;
  helper?: string;
  containerStyle?: StyleProp<ViewStyle>;
  selectStyle?: StyleProp<ViewStyle>; // Style for the touchable area
  modalTitle?: string;
  disabled?: boolean;
  required?: boolean;
};

const SearchableMultiSelect: React.FC<SearchableMultiSelectProps> = ({
  label,
  options,
  value = [], // Default to empty array
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
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
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
    const isSelected = value.includes(item.value);
    return (
      <TouchableOpacity
        style={styles.optionItem}
        onPress={() => handleToggleOption(item.value)}
      >
        <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
          {item.label}
        </Text>
        {isSelected && <Check size={20} color={Colors.light.primary} />}
      </TouchableOpacity>
    );
  };

  const selectedLabels = options
    .filter((option) => value.includes(option.value))
    .map((option) => option.label);

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
            const selectedOption = options.find(opt => opt.value === selectedValue);
            if (!selectedOption) return null;

            return (
              <Chip
                key={selectedValue}
                label={selectedOption.label}
                onClose={() => handleToggleOption(selectedValue)} // Use existing toggle logic to remove
                variant="light" // Use the light variant
                color="primary" // Use the primary color
                // No need to pass style or textStyle if using variant/color props
                // closeIconColor is handled by the Chip component based on variant/color
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
                  <Search size={20} color={Colors.light.subtext} style={styles.searchIcon} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search..."
                    placeholderTextColor={Colors.light.subtext}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                </View>
                {filteredOptions.length === 0 && (
                  <Text style={styles.noOptionsText}>No options found</Text>
                )}
                <FlatList
                  data={filteredOptions}
                  renderItem={renderItem}
                  keyExtractor={(item) => item.value}
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
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.inputBorder,
    borderRadius: Layout.borderRadius.medium,
    marginHorizontal: Layout.spacing.l,
    marginVertical: Layout.spacing.m,
    paddingHorizontal: Layout.spacing.s,
  },
  searchIcon: {
    marginRight: Layout.spacing.s,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.light.text,
    paddingVertical: Platform.OS === 'ios' ? Layout.spacing.s : 0,
  },
  optionItem: {
    paddingVertical: Layout.spacing.m,
    paddingHorizontal: Layout.spacing.l,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
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
    paddingHorizontal: Layout.spacing.m,
  },
  // Removed selectedChip and selectedChipText styles as they are now handled by the Chip component
  // selectedChip: { // Keep this style to override default Chip background/text if needed
  //   backgroundColor: Colors.light.primary,
  // },
  // selectedChipText: { // Keep this style to override default Chip text color if needed
  //   color: Colors.light.background,
  // },
  // Removed selectedChip and selectedChipText styles from here as they are now in Chip.tsx
  // selectedChip: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   backgroundColor: Colors.light.primaryLight,
  //   borderRadius: Layout.borderRadius.xl,
  //   paddingVertical: Layout.spacing.xs,
  //   paddingHorizontal: Layout.spacing.s,
  //   marginRight: Layout.spacing.s,
  //   marginBottom: Layout.spacing.s,
  // },
  // selectedChipText: {
  //   fontFamily: 'Inter-Regular',
  //   fontSize: 14,
  //   color: Colors.light.primary,
  //   marginRight: Layout.spacing.xs,
  // },
  removeChipButton: { // This style is still needed for the button within the Chip
    padding: Layout.spacing.xs / 2,
  },
});

export default SearchableMultiSelect;