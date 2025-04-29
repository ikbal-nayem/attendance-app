import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Calendar, Clock } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';

type CustomDateTimePickerProps = {
  label?: string;
  value: Date;
  onChange: (date: Date) => void;
  mode?: 'date' | 'time' | 'datetime';
  error?: string;
  helper?: string;
  containerStyle?: StyleProp<ViewStyle>;
  pickerStyle?: StyleProp<ViewStyle>;
  formatDate?: (date: Date) => string;
  formatTime?: (date: Date) => string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
};

const CustomDateTimePicker: React.FC<CustomDateTimePickerProps> = ({
  label,
  value,
  onChange,
  mode = 'date',
  error,
  helper,
  containerStyle,
  pickerStyle,
  formatDate = date => date.toLocaleDateString(),
  formatTime = date => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  minDate,
  maxDate,
  disabled = false,
}) => {
  const [show, setShow] = useState(false);
  const [tempDate, setTempDate] = useState(value);
  const [currentMode, setCurrentMode] = useState<'date' | 'time'>(mode === 'datetime' ? 'date' : mode);
  
  const hasError = !!error;

  const showPicker = () => {
    if (!disabled) {
      setShow(true);
    }
  };

  const handleChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || value;
    
    if (Platform.OS === 'android') {
      setShow(false);
      
      if (selectedDate) {
        if (mode === 'datetime' && currentMode === 'date') {
          // On Android, after selecting the date, show the time picker
          setTempDate(currentDate);
          setCurrentMode('time');
          setShow(true);
        } else {
          onChange(currentDate);
        }
      }
    } else {
      // iOS: Update the temporary date
      setTempDate(currentDate);
    }
  };

  const handleIOSConfirm = () => {
    onChange(tempDate);
    setShow(false);
  };

  const handleIOSCancel = () => {
    setShow(false);
  };

  const toggleMode = () => {
    if (mode === 'datetime') {
      setCurrentMode(currentMode === 'date' ? 'time' : 'date');
    }
  };

  const getDisplayText = () => {
    if (mode === 'date') {
      return formatDate(value);
    } else if (mode === 'time') {
      return formatTime(value);
    } else {
      return `${formatDate(value)} ${formatTime(value)}`;
    }
  };

  const getIcon = () => {
    if (mode === 'date') {
      return <Calendar size={20} color={disabled ? Colors.light.subtext : Colors.light.text} />;
    } else if (mode === 'time') {
      return <Clock size={20} color={disabled ? Colors.light.subtext : Colors.light.text} />;
    } else {
      return currentMode === 'date' ? (
        <Calendar size={20} color={disabled ? Colors.light.subtext : Colors.light.text} />
      ) : (
        <Clock size={20} color={disabled ? Colors.light.subtext : Colors.light.text} />
      );
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <TouchableOpacity
        style={[
          styles.pickerContainer,
          hasError && styles.pickerContainerError,
          disabled && styles.pickerContainerDisabled,
          pickerStyle,
        ]}
        onPress={showPicker}
        disabled={disabled}
      >
        <Text
          style={[styles.pickerText, disabled && styles.pickerTextDisabled]}
          numberOfLines={1}
        >
          {getDisplayText()}
        </Text>
        {getIcon()}
      </TouchableOpacity>
      
      {(error || helper) && (
        <Text style={[styles.helperText, hasError && styles.errorText]}>
          {error || helper}
        </Text>
      )}
      
      {show && (
        <>
          {Platform.OS === 'ios' && (
            <View style={styles.iosPickerContainer}>
              <View style={styles.iosPickerHeader}>
                <TouchableOpacity onPress={handleIOSCancel}>
                  <Text style={styles.iosPickerCancel}>Cancel</Text>
                </TouchableOpacity>
                {mode === 'datetime' && (
                  <TouchableOpacity onPress={toggleMode}>
                    <Text style={styles.iosPickerToggle}>
                      {currentMode === 'date' ? 'Show Time' : 'Show Date'}
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={handleIOSConfirm}>
                  <Text style={styles.iosPickerDone}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          
          <DateTimePicker
            value={Platform.OS === 'ios' ? tempDate : value}
            mode={currentMode}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleChange}
            minimumDate={minDate}
            maximumDate={maxDate}
          />
        </>
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
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.light.inputBorder,
    borderRadius: Layout.borderRadius.xl, // Match Input component
    backgroundColor: Colors.light.inputBackground,
    height: Layout.inputHeight,
    paddingHorizontal: Layout.spacing.m,
  },
  pickerContainerError: {
    borderColor: Colors.light.error,
  },
  pickerContainerDisabled: {
    backgroundColor: Colors.light.border,
    borderColor: Colors.light.border,
    opacity: 0.6,
  },
  pickerText: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.light.text,
  },
  pickerTextDisabled: {
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
  iosPickerContainer: {
    backgroundColor: Colors.light.card,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  iosPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Layout.spacing.m,
  },
  iosPickerCancel: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.light.error,
  },
  iosPickerToggle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.light.primary,
  },
  iosPickerDone: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: Colors.light.primary,
  },
});

export default CustomDateTimePicker;