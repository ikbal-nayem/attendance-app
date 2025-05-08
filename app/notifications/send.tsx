import { zodResolver } from '@hookform/resolvers/zod';
import { FileText, History, Send } from 'lucide-react-native';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { z } from 'zod';

import { sendNotification, useNotificationData } from '@/api/notification.api';
import Button from '@/components/Button';
import Card from '@/components/Card';
import AppHeader from '@/components/Header';
import Input from '@/components/Input';
import MultipleFilePicker from '@/components/MultipleFilePicker';
import SearchableMultiSelect from '@/components/SearchableMultiSelect';
import AppStatusBar from '@/components/StatusBar';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { makeFormData } from '@/utils/form-actions';
import { router } from 'expo-router';

const notificationSchema = z.object({
  sMessageTo: z.array(z.string()).min(1, 'Please select at least one recipient'),
  sMessageTitle: z.string().min(1, 'Subject is required'),
  sMessageDetails: z.string().min(1, 'Message is required'),
  sAttachmentFile01: z
    .array(
      z.object({
        uri: z.string(),
        name: z.string(),
      })
    )
    .optional(),
});

type NotificationFormData = z.infer<typeof notificationSchema>;

const defaultValues: NotificationFormData = {
  sMessageTo: [],
  sMessageTitle: '',
  sMessageDetails: '',
  sAttachmentFile01: [],
};

export default function SendNotificationScreen() {
  const { showToast } = useToast();
  const { user } = useAuth();
  const { notificationData } = useNotificationData(user?.companyID || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSchema),
    defaultValues,
  });

  const onSubmit = async (data: NotificationFormData) => {
    setIsSubmitting(true)
    const reqData = {
      ...data,
      sUserID: user?.userID,
      sSessionID: user?.sessionID,
      sCompanyID: user?.companyID,
    };

    sendNotification(makeFormData(reqData))
      .then((res) => {
        if (res.success) {
          showToast({
            type: 'success',
            message: res?.message || `Notification sent successfully`,
          });
          reset(defaultValues);
          return;
        }
        showToast({
          type: 'error',
          message: res?.message || `Failed to send notification`,
        });
      })
      .catch((err) => {
        console.error('Error submitting notification:', err);
        showToast({
          type: 'error',
          message: `An unexpected error occurred. Please try again later.`,
        });
      })
      .finally(() => setIsSubmitting(false));
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppStatusBar />
      <AppHeader
        title="Send Notification"
        withBackButton={true}
        bg="primary"
        rightContent={
          <TouchableOpacity onPress={() => router.push('/notifications/history')}>
            <History size={22} color={Colors.dark.text} />
          </TouchableOpacity>
        }
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
        style={styles.keyboardAvoidingContainer}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Card variant="outlined" style={styles.formCard}>
            {/* Recipients Field */}
            <Controller
              control={control}
              name="sMessageTo"
              render={({ field: { onChange, value } }) => (
                <SearchableMultiSelect
                  label="To"
                  required
                  options={notificationData?.messageToList || []}
                  modalTitle="Select Recipients"
                  value={value}
                  onChange={onChange}
                  placeholder="Select recipients"
                  error={errors.sMessageTo?.message}
                />
              )}
            />

            {/* Subject Input */}
            <Controller
              control={control}
              name="sMessageTitle"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Subject"
                  required
                  placeholder="Enter notification subject"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.sMessageTitle?.message}
                />
              )}
            />

            {/* Message Input */}
            <Controller
              control={control}
              name="sMessageDetails"
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
                  error={errors.sMessageDetails?.message}
                />
              )}
            />

            {/* Attachments Section using MultipleFilePicker */}
            <Controller
              control={control}
              name="sAttachmentFile01"
              render={({ field: { onChange, value } }) => (
                <MultipleFilePicker
                  label="Attachments"
                  value={value ?? []}
                  onChange={onChange}
                  error={errors.sAttachmentFile01?.message as string | undefined}
                  maxFiles={10}
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
              style={styles.actionButton}
              icon={<Send size={20} color={Colors.dark.text} />}
              iconPosition="right"
            />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Layout.spacing.l,
    paddingBottom: Layout.spacing.xl,
  },
  formCard: {
    marginBottom: Layout.spacing.xl,
  },
  actionButton: {
    marginTop: Layout.spacing.l,
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.light.error,
    marginBottom: Layout.spacing.m,
    textAlign: 'center',
  },
});
