import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { ActivityIcon, FileText, History } from 'lucide-react-native';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { z } from 'zod';

import { submitActivity, useActivityData } from '@/api/activity.api';
import Button from '@/components/Button';
import Card from '@/components/Card';
import DateTimePicker from '@/components/DateTimePicker';
import AppHeader from '@/components/Header';
import Input from '@/components/Input';
import MultipleFilePicker from '@/components/MultipleFilePicker';
import Select from '@/components/Select';
import AppStatusBar from '@/components/StatusBar';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { makeFormData } from '@/utils/form-actions';

const activitySchema = z
  .object({
    sActivityType: z.string().min(1, 'Activity type is required'),
    sClient: z.string().min(1, 'Client type is required'),
    sContactPerson: z.string(),
    sTerritory: z.string().min(1, 'Territory type is required'),
    sActivityDetails: z.string().min(1, 'Activity details are required'),
    sActivityDate: z.date(),
    sActivityStartTime: z.date(),
    sActivityStopTime: z.date(),
    sAttachmentFile01: z
      .array(
        z.object({
          uri: z.string(),
          name: z.string(),
        })
      )
      .optional(),
    sActivityNote: z.string().optional(),
  })
  .refine((data) => data.sActivityStopTime > data.sActivityStartTime, {
    message: 'End time must be after start time',
    path: ['endTime'],
  });

type ActivityFormData = z.infer<typeof activitySchema>;

const defaultValues: ActivityFormData = {
  sActivityType: '',
  sClient: '',
  sContactPerson: '',
  sTerritory: '',
  sActivityDetails: '',
  sActivityDate: new Date(),
  sActivityStartTime: new Date(),
  sActivityStopTime: new Date(new Date().getTime() + 60 * 60 * 1000),
  sAttachmentFile01: [],
  sActivityNote: '',
};

export default function ActivityScreen() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { activityData } = useActivityData(user?.companyID || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ActivityFormData>({
    resolver: zodResolver(activitySchema),
    defaultValues,
  });

  const onSubmit = async (data: ActivityFormData) => {
    setIsSubmitting(true);
    const reqData = {
      ...data,
      sUserID: user?.userID,
      sSessionID: user?.sessionID,
      sCompanyID: user?.companyID,
      sActivityDate: data.sActivityDate.toISOString().split('T')[0],
      sActivityStartTime: data.sActivityStartTime.toTimeString().split(' ')[0],
      sActivityStopTime: data.sActivityStopTime.toTimeString().split(' ')[0],
    };

    submitActivity(makeFormData(reqData))
      .then((res) => {
        if (res.success) {
          showToast({
            type: 'success',
            message: res?.message || `Check-in successfully`,
          });
          reset(defaultValues);
          return;
        }
        showToast({
          type: 'error',
          message: res?.message || `Failed to submit check-in`,
        });
      })
      .catch((err) => {
        console.error('Error submitting check-in:', err);
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
        title="Activity"
        rightContent={
          <TouchableOpacity onPress={() => router.push('/(tabs)/activity/history')}>
            <History color={Colors.light.background} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Card variant="outlined" style={styles.formCard}>
          {errors.root?.message && <Text style={styles.errorText}>{errors.root.message}</Text>}
          {errors.sActivityStopTime && !errors.root?.message && (
            <Text style={styles.errorText}>{errors.sActivityStopTime.message}</Text>
          )}

          {/* Activity Type Select */}
          <Controller
            control={control}
            name="sActivityType"
            render={({ field: { onChange, value } }) => (
              <Select
                label="Activity Type"
                required
                options={activityData?.activityTypeList || []}
                value={value}
                onChange={onChange}
                placeholder="Select activity type"
                error={errors.sActivityType?.message}
                keyProp="code"
                valueProp="name"
              />
            )}
          />

          {/* Client Select */}
          <Controller
            control={control}
            name="sClient"
            render={({ field: { onChange, value } }) => (
              <Select
                label="Client"
                required
                options={activityData?.clientList || []}
                value={value}
                onChange={onChange}
                placeholder="Select client"
                error={errors.sClient?.message}
                keyProp="code"
                valueProp="name"
              />
            )}
          />

          {/* Contact person */}
          <Controller
            control={control}
            name="sContactPerson"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Contact Person"
                placeholder="Enter contact person"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.sContactPerson?.message}
              />
            )}
          />

          {/* Territory Select */}
          <Controller
            control={control}
            name="sTerritory"
            render={({ field: { onChange, value } }) => (
              <Select
                label="Territory"
                required
                options={activityData?.territoryList || []}
                value={value}
                onChange={onChange}
                placeholder="Select territory"
                error={errors.sTerritory?.message}
                keyProp="code"
                valueProp="name"
              />
            )}
          />

          {/* Activity Details Input */}
          <Controller
            control={control}
            name="sActivityDetails"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Activity Details"
                required
                placeholder="Enter activity details"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                multiline
                numberOfLines={4}
                leftIcon={<FileText size={20} color={Colors.light.subtext} />}
                error={errors.sActivityDetails?.message}
              />
            )}
          />

          {/* Date Picker */}
          <Controller
            control={control}
            name="sActivityDate"
            render={({ field: { onChange, value } }) => (
              <DateTimePicker
                label="Activity Date"
                value={value}
                onChange={onChange}
                mode="date"
                error={errors.sActivityDate?.message}
              />
            )}
          />

          {/* Start Time Picker */}
          <Controller
            control={control}
            name="sActivityStartTime"
            render={({ field: { onChange, value } }) => (
              <DateTimePicker
                label="Start Time"
                value={value}
                onChange={onChange}
                mode="time"
                error={errors.sActivityStartTime?.message}
              />
            )}
          />

          {/* End Time Picker */}
          <Controller
            control={control}
            name="sActivityStopTime"
            render={({ field: { onChange, value } }) => (
              <DateTimePicker
                label="End Time"
                value={value}
                onChange={onChange}
                mode="time"
                error={
                  errors.sActivityStopTime?.message && !errors.root?.message
                    ? errors.sActivityStopTime.message
                    : undefined
                }
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
                maxFiles={5}
              />
            )}
          />

          {/* Note Input */}
          <Controller
            control={control}
            name="sActivityNote"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Note"
                placeholder="Add a note (optional)"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                multiline
                numberOfLines={2}
                error={errors.sActivityNote?.message}
              />
            )}
          />

          {/* Submit Button */}
          <Button
            title="Submit Activity"
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
            disabled={isSubmitting}
            fullWidth
            style={styles.actionButton}
            icon={<ActivityIcon size={20} color={Colors.dark.text} />}
            iconPosition="right"
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    padding: Layout.spacing.m,
    paddingBottom: Layout.spacing.xl,
  },
  formCard: {
    marginBottom: Layout.spacing.xl,
  },
  inputGroup: {
    marginBottom: Layout.spacing.m,
  },
  inputLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: Layout.spacing.xs,
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
