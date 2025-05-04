import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { Check, ChevronDown, X } from 'lucide-react-native';
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

type SelectProps = {
  label?: string;
  options: IObject[];
  keyProp: string;
  valueProp: string;
  value?: string;
  placeholder?: string;
  onChange: (value: string) => void;
  error?: string;
  helper?: string;
  containerStyle?: StyleProp<ViewStyle>;
  selectStyle?: StyleProp<ViewStyle>; // Style for the touchable area
  modalTitle?: string;
  disabled?: boolean;
  required?: boolean;
};

const Select: React.FC<SelectProps> = ({
  label,
  options,
  keyProp,
  valueProp,
  value,
  placeholder = 'Select an option',
  onChange,
  error,
  helper,
  containerStyle,
  selectStyle,
  modalTitle = 'Select an option',
  disabled = false,
  required = false,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const selectedOption = options.find((option) => option?.[keyProp] == value);
  const hasError = !!error;

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setModalVisible(false);
  };

  const renderItem = ({ item }: { item: IObject }) => (
    <TouchableOpacity
      style={styles.optionItem}
      onPress={() => handleSelect(item?.[keyProp])}
    >
      <Text
        style={[styles.optionText, item?.[keyProp] == value && styles.selectedOption]}
      >
        {item?.[valueProp]}
      </Text>
      {item?.[keyProp] == value && <Check size={20} color={Colors.light.primary} />}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={styles.label}>
          {label} {required && <Text style={{ color: Colors.light.error }}>*</Text>}
        </Text>
      )}

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
          {selectedOption ? selectedOption?.[valueProp] : placeholder}
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
                {options.length === 0 && (
                  <Text style={styles.noOptionsText}>No options available</Text>
                )}
                <FlatList
                  data={options}
                  renderItem={renderItem}
                  keyExtractor={(item) => item?.[keyProp]}
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
  optionItem: {
    paddingVertical: Layout.spacing.m,
    paddingHorizontal: Layout.spacing.l,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  optionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.light.text,
  },
  selectedOption: {
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
});

export default Select;
