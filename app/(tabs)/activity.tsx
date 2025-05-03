import Button from '@/components/Button';
import Card from '@/components/Card';
import DateTimePicker from '@/components/DateTimePicker';
import Input from '@/components/Input';
import Select from '@/components/Select';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { useActivity } from '@/context/ActivityContext';
import { useAuth } from '@/context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import {
  ChevronDown,
  FileText,
  Paperclip as PaperClip,
  XCircle, // Import icon for removing attachments
} from 'lucide-react-native';
import React, { useState, useEffect } from 'react'; // Added useEffect
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform, // Import Platform for permission checks
} from 'react-native';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Zod schema for activity form validation
const activitySchema = z
  .object({
    activityType: z.string().min(1, 'Activity type is required'),
    client: z.string().min(1, 'Client is required'),
    territory: z.string().min(1, 'Territory is required'),
    details: z.string().min(1, 'Activity details are required'),
    date: z.date(),
    startTime: z.date(),
    endTime: z.date(),
    attachments: z.array(z.string()).optional(), // Array of attachment URIs
    note: z.string().optional(),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: 'End time must be after start time',
    path: ['endTime'], // Specify the path of the error
  });

type ActivityFormData = z.infer<typeof activitySchema>;

export default function ActivityScreen() {
  const { user } = useAuth();
  const { activityTypes, clients, territories, addActivity } = useActivity();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ActivityFormData>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      activityType: '',
      client: '',
      territory: '',
      details: '',
      date: new Date(),
      startTime: new Date(),
      endTime: new Date(new Date().getTime() + 60 * 60 * 1000), // Default to 1 hour later
      attachments: [],
      note: '',
    },
  });

  const attachments = watch('attachments', []); // Watch attachments array

  // Handle form submission
  const onSubmit = async (data: ActivityFormData) => {
    console.log('Submitting Activity Data:', data);

    // --- Replace with actual API call ---
    // try {
    //   const success = await addActivity({
    //     ...data,
    //     userId: user?.userID || '', // Include necessary user info
    //     // Add other required fields for the API
    //   });
    //
    //   if (success) {
    //     Alert.alert('Success', 'Activity has been logged successfully');
    //     reset(); // Reset form on success
    //   } else {
    //     Alert.alert('Error', 'Failed to log activity. Please try again.');
    //   }
    // } catch (error) {
    //   console.error('Error submitting activity:', error);
    //   Alert.alert('Error', 'An unexpected error occurred while logging activity.');
    // }
    // --- End of API call section ---

    // Mock success for demonstration
    await new Promise((resolve) => setTimeout(resolve, 1500));
    Alert.alert('Success (Mock)', 'Activity submitted');
    reset({ // Reset with default values
        activityType: '', client: '', territory: '', details: '',
        date: new Date(), startTime: new Date(),
        endTime: new Date(new Date().getTime() + 60 * 60 * 1000),
        attachments: [], note: ''
    });
  };

  // Function to pick attachments
  const pickAttachments = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Media library permission is required to select files.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All, // Allow all types or specify (Images, Videos)
        allowsMultipleSelection: true,
        quality: 0.7, // Adjust quality as needed
      });

      if (!result.canceled && result.assets) {
        const newAttachments = result.assets.map((asset) => asset.uri);
        setValue('attachments', [...(attachments || []), ...newAttachments], {
          shouldValidate: true, // Optional: validate if needed after adding attachments
        });
      }
    } catch (error) {
      console.error('Error selecting files:', error);
      Alert.alert('Error', 'Failed to select files.');
    }
  };

  // Function to remove an attachment
  const removeAttachment = (index: number) => {
    const updatedAttachments = [...(attachments || [])];
    updatedAttachments.splice(index, 1);
    setValue('attachments', updatedAttachments, { shouldValidate: true });
  };

  // Helper to get attachment name from URI
  const getAttachmentName = (uri: string) => {
    try {
      const decodedUri = decodeURIComponent(uri);
      const parts = decodedUri.split('/');
      return parts[parts.length - 1] || 'unknown_file';
    } catch (e) {
      console.error("Error decoding URI:", e);
      return 'invalid_uri_file';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Colors.light.background}
      />

      {/* Header remains the same */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Activity Log</Text>
        <TouchableOpacity onPress={() => router.push('/enquiry/activities')}>
          <Text style={styles.historyText}>History</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Card variant="elevated" style={styles.activityCard}>
          {/* Display general form errors if any (e.g., from refine) */}
          {errors.root?.message && (
             <Text style={styles.errorText}>{errors.root.message}</Text>
          )}
           {/* Display specific field error if needed and not shown by component */}
           {errors.endTime && !errors.root?.message && (
             <Text style={styles.errorText}>{errors.endTime.message}</Text>
           )}


          {/* Activity Type Select */}
          <Controller
            control={control}
            name="activityType"
            render={({ field: { onChange, value } }) => (
              <Select
                label="Activity Type *"
                options={activityTypes.map((type) => ({ label: type, value: type }))}
                value={value}
                onChange={onChange}
                placeholder="Select activity type"
                error={errors.activityType?.message}
                keyProp="value" // Added keyProp
                valueProp="label" // Added valueProp
              />
            )}
          />

          {/* Client Select */}
          <Controller
            control={control}
            name="client"
            render={({ field: { onChange, value } }) => (
              <Select
                label="Client *"
                options={clients.map((client) => ({ label: client, value: client }))}
                value={value}
                onChange={onChange}
                placeholder="Select client"
                error={errors.client?.message}
                keyProp="value" // Added keyProp
                valueProp="label" // Added valueProp
              />
            )}
          />

          {/* Territory Select */}
          <Controller
            control={control}
            name="territory"
            render={({ field: { onChange, value } }) => (
              <Select
                label="Territory *"
                options={territories.map((territory) => ({ label: territory, value: territory }))}
                value={value}
                onChange={onChange}
                placeholder="Select territory"
                error={errors.territory?.message}
                keyProp="value" // Added keyProp
                valueProp="label" // Added valueProp
              />
            )}
          />

          {/* Activity Details Input */}
          <Controller
            control={control}
            name="details"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Activity Details *"
                placeholder="Enter activity details"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                multiline
                numberOfLines={4}
                leftIcon={<FileText size={20} color={Colors.light.subtext} />}
                error={errors.details?.message}
              />
            )}
          />

          {/* Date Picker */}
          <Controller
            control={control}
            name="date"
            render={({ field: { onChange, value } }) => (
              <DateTimePicker
                label="Activity Date *"
                value={value}
                onChange={onChange}
                mode="date"
                error={errors.date?.message}
              />
            )}
          />

          {/* Start Time Picker */}
          <Controller
            control={control}
            name="startTime"
            render={({ field: { onChange, value } }) => (
              <DateTimePicker
                label="Start Time *"
                value={value}
                onChange={onChange}
                mode="time"
                error={errors.startTime?.message}
              />
            )}
          />

          {/* End Time Picker */}
          <Controller
            control={control}
            name="endTime"
            render={({ field: { onChange, value } }) => (
              <DateTimePicker
                label="End Time *"
                value={value}
                onChange={onChange}
                mode="time"
                // Error handled globally by refine or shown above
              />
            )}
          />

          {/* Attachments Section */}
          <View style={styles.attachmentsContainer}>
            <Text style={styles.attachmentsLabel}>Attachments</Text>
            <TouchableOpacity
              style={styles.attachmentButton}
              onPress={pickAttachments}
            >
              <PaperClip size={20} color={Colors.light.primary} />
              <Text style={styles.attachmentButtonText}>Add Files</Text>
            </TouchableOpacity>

            {attachments && attachments.length > 0 && (
              <View style={styles.attachmentsList}>
                {attachments.map((attachment, index) => (
                  <View key={index} style={styles.attachmentItem}>
                    <PaperClip size={16} color={Colors.light.subtext} style={styles.attachmentIcon} />
                    <Text
                      style={styles.attachmentName}
                      numberOfLines={1}
                      ellipsizeMode="middle"
                    >
                      {getAttachmentName(attachment)}
                    </Text>
                    <TouchableOpacity
                      onPress={() => removeAttachment(index)}
                      style={styles.removeAttachmentButton}
                    >
                      <XCircle size={18} color={Colors.light.error} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
             {errors.attachments && (
                <Text style={styles.errorText}>{errors.attachments.message}</Text>
             )}
          </View>

          {/* Note Input */}
          <Controller
            control={control}
            name="note"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Note"
                placeholder="Add a note (optional)"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                multiline
                numberOfLines={2}
                error={errors.note?.message}
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
            style={styles.submitButton}
          />
        </Card>

        {/* History Button remains the same */}
        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => router.push('/enquiry/activities')}
        >
          <Text style={styles.historyButtonText}>View Activity History</Text>
          <ChevronDown size={18} color={Colors.light.primary} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// Styles remain largely the same, with minor additions/adjustments
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.l,
    paddingTop: Layout.spacing.l,
    paddingBottom: Layout.spacing.m,
    borderBottomWidth: 1, // Optional: Add a separator
    borderBottomColor: Colors.light.inputBorder,
  },
  backButton: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.light.primary,
  },
  headerTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: Colors.light.text,
  },
  historyText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.light.primary,
  },
  scrollContent: {
    padding: Layout.spacing.l,
    paddingBottom: Layout.spacing.xxl, // Ensure space for history button
  },
  activityCard: {
    marginBottom: Layout.spacing.xl, // Increase spacing before history button
  },
  errorText: { // General error text style
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.light.error,
    marginBottom: Layout.spacing.m,
    textAlign: 'center',
  },
  attachmentsContainer: {
    marginBottom: Layout.spacing.m,
  },
  attachmentsLabel: {
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
    borderRadius: Layout.borderRadius.medium, // Consistent border radius
    backgroundColor: `${Colors.light.primary}1A`, // Lighter background
    height: Layout.inputHeight,
    marginBottom: Layout.spacing.s, // Add margin below button
  },
  attachmentButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.light.primary,
    marginLeft: Layout.spacing.s,
  },
  attachmentsList: {
    marginTop: Layout.spacing.s,
    borderWidth: 1,
    borderColor: Colors.light.inputBorder,
    borderRadius: Layout.borderRadius.medium,
    padding: Layout.spacing.s,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.light.background, // Use background color
    borderRadius: Layout.borderRadius.small,
    paddingVertical: Layout.spacing.s,
    paddingHorizontal: Layout.spacing.xs,
    marginBottom: Layout.spacing.xs,
    borderBottomWidth: 1, // Separator for items
    borderBottomColor: Colors.light.inputBorder,
  },
   attachmentIcon: {
    marginRight: Layout.spacing.s,
  },
  attachmentName: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.light.text,
    flex: 1, // Take available space
    marginRight: Layout.spacing.s, // Space before remove button
  },
  removeAttachmentButton: {
    padding: Layout.spacing.xs, // Make touch target larger
  },
  submitButton: {
    marginTop: Layout.spacing.l, // Increase top margin for submit button
  },
  historyButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Layout.spacing.m,
  },
  historyButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.light.primary,
    marginRight: Layout.spacing.xs,
  },
});
