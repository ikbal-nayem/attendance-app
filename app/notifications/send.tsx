import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { FileText } from 'lucide-react-native'; // Keep FileText for message input
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import AppHeader from '@/components/Header'; // Use AppHeader
import AppStatusBar from '@/components/StatusBar'; // Use AppStatusBar
import Card from '@/components/Card';
import Input from '@/components/Input';
import Button from '@/components/Button';
import SearchableMultiSelect from '@/components/SearchableMultiSelect'; // Import new component
import MultipleFilePicker, { AttachmentAsset } from '@/components/MultipleFilePicker'; // Import MultipleFilePicker and AttachmentAsset
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { useNotifications } from '@/context/NotificationContext';
import { useToast } from '@/context/ToastContext'; // Use useToast
import { makeFormData } from '@/utils/form-actions'; // Assuming makeFormData is needed for attachments

// Dummy users for notification recipients (as Option type)
const users = [
  { label: 'All Users', value: 'all' },
  { label: 'John Smith', value: 'john.smith' },
  { label: 'Emma Johnson', value: 'emma.johnson' },
  { label: 'Michael Chen', value: 'michael.chen' },
  { label: 'Sarah Williams', value: 'sarah.williams' },
];

// Zod schema for notification form validation
const notificationSchema = z.object({
  recipients: z.array(z.string()).min(1, 'Please select at least one recipient'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(1, 'Message is required'),
  attachments: z
    .array(
      z.object({
        uri: z.string(),
        name: z.string(),
      })
    )
    .optional(), // Schema for AttachmentAsset array
});

type NotificationFormData = z.infer<typeof notificationSchema>;

export default function SendNotificationScreen() {
  const { sendNotification } = useNotifications();
  const { showToast } = useToast(); // Use toast for feedback

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      recipients: [],
      subject: '',
      message: '',
      attachments: [],
    },
  });

  const onSubmit = async (data: NotificationFormData) => {
    console.log('Submitting Notification Data:', data);

    // Prepare data for API
    const reqData = {
      ...data,
      // Extract URIs for attachments if needed by the API
      attachments: data.attachments?.map(asset => asset.uri),
      // Add any other required fields for the API (e.g., sender ID)
      // senderId: user?.userID, // Example
    };

    // --- Replace with actual API call ---
    // try {
    //   // If sending attachments as files, you might need makeFormData
    //   // const formData = makeFormData(reqData);
    //   // const response = await api.post('/send-notification', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    //   // if (response.data.success) { ... } else { ... }
    //
    //   // Mock success for demonstration
       await new Promise((resolve) => setTimeout(resolve, 1500));
       showToast({ type: 'success', message: 'Notification sent successfully' });
       reset(); // Reset form on success
    // } catch (error) {
    //   console.error('Error sending notification:', error);
    //   showToast({ type: 'error', message: 'Failed to send notification' });
    //   // Alert.alert('Error', 'An unexpected error occurred while sending notification.');
    // }
    // --- End of API call section ---
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppStatusBar />
      <AppHeader
        title="Send Notification"
        withBackButton={true} // Add back button as it's not a tab screen
        bg="primary"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Card variant="elevated" style={styles.formCard}>
          {/* Recipients Field */}
          <Controller
            control={control}
            name="recipients"
            render={({ field: { onChange, value } }) => (
              <SearchableMultiSelect
                label="To"
                required
                options={users} // Use dummy users as options
                value={value}
                onChange={onChange}
                placeholder="Select recipients"
                error={errors.recipients?.message}
              />
            )}
          />

          {/* Subject Input */}
          <Controller
            control={control}
            name="subject"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Subject"
                required
                placeholder="Enter notification subject"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.subject?.message}
              />
            )}
          />

          {/* Message Input */}
          <Controller
            control={control}
            name="message"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Message"
                required
                placeholder="Enter notification message"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                multiline
                numberOfLines={5}
                leftIcon={<FileText size={20} color={Colors.light.subtext} />}
                error={errors.message?.message}
              />
            )}
          />

          {/* Attachments Section using MultipleFilePicker */}
          <Controller
            control={control}
            name="attachments"
            render={({ field: { onChange, value } }) => (
              <MultipleFilePicker
                label="Attachments"
                value={value ?? []} // Ensure value is always an array
                onChange={onChange}
                error={errors.attachments?.message as string | undefined} // Cast error message type if needed
                maxFiles={10} // Example limit
                // mimeTypes={['image/*', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']} // Example allowed types
              />
            )}
          />

          {/* Submit Button */}
          <Button
            title="Send Notification"
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
            disabled={isSubmitting}
            fullWidth
            style={styles.actionButton} // Use consistent style name
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

// Adapted styles from attendance.tsx and merged relevant notification styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    padding: Layout.spacing.l,
    paddingBottom: Layout.spacing.xl, // Adjusted padding
  },
  formCard: { // Consistent card style name
    marginBottom: Layout.spacing.xl, // Added more bottom margin
  },
  actionButton: { // Consistent button style
    marginTop: Layout.spacing.l,
  },
  errorText: { // General error text style (if needed for root errors)
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.light.error,
    marginBottom: Layout.spacing.m,
    textAlign: 'center',
  },
  // Removed old header, recipients, attachments, and send button styles
});