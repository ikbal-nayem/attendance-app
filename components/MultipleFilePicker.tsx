import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import * as DocumentPicker from 'expo-document-picker';
import { Paperclip as PaperClip, XCircle } from 'lucide-react-native';
import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export interface AttachmentAsset {
  uri: string;
  name: string;
}

interface MultipleFilePickerProps {
  label: string;
  value: AttachmentAsset[];
  onChange: (assets: AttachmentAsset[]) => void;
  error?: string;
  required?: boolean;
  maxFiles?: number;
  mimeTypes?: string[]; // e.g., ['application/pdf', 'image/*']
}

const MultipleFilePicker: React.FC<MultipleFilePickerProps> = ({
  label,
  value = [],
  onChange,
  error,
  required = false,
  maxFiles = 5,
  mimeTypes,
}) => {
  const pickAttachments = async () => {
    if (value.length >= maxFiles) {
      Alert.alert('Limit Reached', `You can only upload up to ${maxFiles} files.`);
      return;
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: mimeTypes ?? '*/*',
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets) {
        const currentCount = value.length;
        const remainingSlots = maxFiles - currentCount;
        const filesToAdd = result.assets.slice(0, remainingSlots);

        if (result.assets.length > remainingSlots) {
          Alert.alert(
            'Limit Exceeded',
            `You selected ${result.assets.length} files, but can only add ${remainingSlots} more.`
          );
        }

        const newAttachments: AttachmentAsset[] = filesToAdd.map((asset) => ({
          uri: asset.uri,
          name: asset.name || 'unknown_file',
        }));
        const currentValue = Array.isArray(value) ? value : [];
        onChange([...currentValue, ...newAttachments]);
      }
    } catch (error) {
      console.error('Error picking documents:', error);
      Alert.alert('Error', 'Failed to select files.');
    }
  };

  const removeAttachment = (index: number) => {
    const updatedAttachments = [...value];
    updatedAttachments.splice(index, 1);
    onChange(updatedAttachments);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label} {required && <Text style={{ color: Colors.light.error }}>*</Text>}
      </Text>
      <TouchableOpacity
        style={styles.attachmentButton}
        onPress={pickAttachments}
        disabled={value.length >= maxFiles}
      >
        <PaperClip size={20} color={Colors.light.primary} />
        <Text style={styles.attachmentButtonText}>
          Add Files ({value.length}/{maxFiles})
        </Text>
      </TouchableOpacity>

      {value && value.length > 0 && (
        <View style={styles.attachmentsListContainer}>
          <ScrollView nestedScrollEnabled={true}>
            {value.map((attachment, index) => (
              <View key={attachment.uri} style={styles.attachmentItem}>
                <PaperClip
                  size={16}
                  color={Colors.light.subtext}
                  style={styles.attachmentIcon}
                />
                <Text
                  style={styles.attachmentName}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {attachment.name}
                </Text>
                <TouchableOpacity
                  onPress={() => removeAttachment(index)}
                  style={styles.removeAttachmentButton}
                >
                  <XCircle size={18} color={Colors.light.error} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
      {!!error && <Text style={styles.errorText}>{error}</Text>}
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
  attachmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.light.primary,
    borderRadius: Layout.borderRadius.xxl,
    backgroundColor: `${Colors.light.primary}1A`,
    height: Layout.inputHeight,
    marginBottom: Layout.spacing.s,
  },
  attachmentButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.light.primary,
    marginLeft: Layout.spacing.s,
  },
  attachmentsListContainer: {
    marginTop: Layout.spacing.s,
    borderWidth: 1,
    borderColor: Colors.light.inputBorder,
    borderRadius: Layout.borderRadius.medium,
    maxHeight: 150,
    padding: Layout.spacing.xs,
    overflow: 'hidden',
  },
  attachmentItem: {
    flexDirection: 'row',
    paddingVertical: Layout.spacing.s,
    paddingHorizontal: Layout.spacing.s,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.light.background,
    borderRadius: Layout.borderRadius.small,
    marginBottom: Layout.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.inputBorder,
  },
  attachmentIcon: {
    marginRight: Layout.spacing.s,
  },
  attachmentName: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.light.text,
    flex: 1,
    marginRight: Layout.spacing.s,
  },
  removeAttachmentButton: {
    padding: Layout.spacing.xs,
  },
  errorText: {
    color: Colors.light.error,
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: Layout.spacing.xs,
    marginLeft: Layout.spacing.xs,
  },
});

export default MultipleFilePicker;
