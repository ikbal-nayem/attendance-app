import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { ChevronDown, X } from 'lucide-react-native';
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
  View,
  ViewStyle,
  TouchableWithoutFeedback, // Import TouchableWithoutFeedback
} from 'react-native';

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
  selectStyle?: StyleProp<ViewStyle>; // Style for the touchable area
  modalTitle?: string;
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

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setModalVisible(false);
  };

  const renderItem = ({ item }: { item: SelectOption }) => (
    <TouchableOpacity
      style={styles.optionItem}
      onPress={() => handleSelect(item.value)}
    >
      <Text style={styles.optionText}>{item.label}</Text>
    </TouchableOpacity>
  );

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
        onPress={() => !disabled && setModalVisible(true)}
        disabled={disabled}
        activeOpacity={0.7}
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
          style={styles.chevron}
        />
      </TouchableOpacity>

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
        {/* Wrap with TouchableWithoutFeedback to detect taps outside the modal content */}
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <SafeAreaView style={styles.modalOverlay}>
            {/* Wrap content with another Touchable to prevent closing when tapping inside */}
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
                <FlatList
                  data={options}
                  renderItem={renderItem}
                  keyExtractor={(item) => item.value}
                  style={styles.optionsList}
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
  // Mimics Input component's container
  selectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.inputBorder,
    borderRadius: Layout.borderRadius.xl, // Match Input component
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
  // Mimics Input component's text style
  selectText: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.light.text,
    marginRight: Layout.spacing.m, // Space for the chevron
  },
  selectTextDisabled: {
    color: Colors.light.subtext,
  },
  placeholderText: {
    color: Colors.light.subtext,
  },
  chevron: {
    // Position handled by flex alignment in container
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
  // Modal Styles
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
    maxHeight: '60%', // Limit modal height
    paddingBottom: Layout.spacing.l, // Padding at the bottom
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
    padding: Layout.spacing.xs, // Make it easier to tap
  },
  optionsList: {
    // Takes remaining space
  },
  optionItem: {
    paddingVertical: Layout.spacing.m,
    paddingHorizontal: Layout.spacing.l,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  optionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.light.text,
  },
});

export default Select;
