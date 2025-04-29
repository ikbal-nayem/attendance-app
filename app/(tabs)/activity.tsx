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
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ActivityScreen() {
  const { user } = useAuth();
  const { activityTypes, clients, territories, addActivity } = useActivity();

  const [formData, setFormData] = useState({
    activityType: '',
    client: '',
    territory: '',
    details: '',
    date: new Date(),
    startTime: new Date(),
    endTime: new Date(new Date().getTime() + 60 * 60 * 1000), // Default to 1 hour later
    attachments: [] as string[],
    note: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const updateFormData = (key: string, value: any) => {
    setFormData({
      ...formData,
      [key]: value,
    });
  };

  const validateForm = () => {
    if (!formData.activityType) {
      setError('Please select an activity type');
      return false;
    }
    if (!formData.client) {
      setError('Please select a client');
      return false;
    }
    if (!formData.territory) {
      setError('Please select a territory');
      return false;
    }
    if (!formData.details) {
      setError('Please enter activity details');
      return false;
    }
    if (formData.startTime >= formData.endTime) {
      setError('End time must be after start time');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await addActivity({
        ...formData,
        userId: user?.sUserID || '1',
      });

      if (success) {
        Alert.alert('Success', 'Activity has been logged successfully');
        // Reset form
        setFormData({
          activityType: '',
          client: '',
          territory: '',
          details: '',
          date: new Date(),
          startTime: new Date(),
          endTime: new Date(new Date().getTime() + 60 * 60 * 1000),
          attachments: [],
          note: '',
        });
      } else {
        Alert.alert('Error', 'Failed to log activity');
      }
    } catch (error) {
      console.error('Error submitting activity:', error);
      Alert.alert('Error', 'Failed to log activity');
    } finally {
      setIsSubmitting(false);
    }
  };

  const pickAttachments = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Media library permission is required to select files'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: true,
        quality: 0.7,
      });

      if (!result.canceled) {
        const newAttachments = result.assets.map((asset) => asset.uri);
        updateFormData('attachments', [
          ...formData.attachments,
          ...newAttachments,
        ]);
      }
    } catch (error) {
      console.error('Error selecting files:', error);
      Alert.alert('Error', 'Failed to select files');
    }
  };

  const removeAttachment = (index: number) => {
    const updatedAttachments = [...formData.attachments];
    updatedAttachments.splice(index, 1);
    updateFormData('attachments', updatedAttachments);
  };

  const getAttachmentName = (uri: string) => {
    const parts = uri.split('/');
    return parts[parts.length - 1];
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Colors.light.background}
      />

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
      >
        <Card variant="elevated" style={styles.activityCard}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Select
            label="Activity Type"
            options={activityTypes.map((type) => ({
              label: type,
              value: type,
            }))}
            value={formData.activityType}
            onChange={(value) => updateFormData('activityType', value)}
            placeholder="Select activity type"
          />

          <Select
            label="Client"
            options={clients.map((client) => ({
              label: client,
              value: client,
            }))}
            value={formData.client}
            onChange={(value) => updateFormData('client', value)}
            placeholder="Select client"
          />

          <Select
            label="Territory"
            options={territories.map((territory) => ({
              label: territory,
              value: territory,
            }))}
            value={formData.territory}
            onChange={(value) => updateFormData('territory', value)}
            placeholder="Select territory"
          />

          <Input
            label="Activity Details"
            placeholder="Enter activity details"
            value={formData.details}
            onChangeText={(value) => updateFormData('details', value)}
            multiline
            numberOfLines={4}
            leftIcon={<FileText size={20} color={Colors.light.subtext} />}
          />

          <DateTimePicker
            label="Activity Date"
            value={formData.date}
            onChange={(date) => updateFormData('date', date)}
            mode="date"
          />

          <DateTimePicker
            label="Start Time"
            value={formData.startTime}
            onChange={(time) => updateFormData('startTime', time)}
            mode="time"
          />

          <DateTimePicker
            label="End Time"
            value={formData.endTime}
            onChange={(time) => updateFormData('endTime', time)}
            mode="time"
          />

          <View style={styles.attachmentsContainer}>
            <Text style={styles.attachmentsLabel}>Attachments</Text>

            <TouchableOpacity
              style={styles.attachmentButton}
              onPress={pickAttachments}
            >
              <PaperClip size={20} color={Colors.light.primary} />
              <Text style={styles.attachmentButtonText}>Add Files</Text>
            </TouchableOpacity>

            {formData.attachments.length > 0 && (
              <View style={styles.attachmentsList}>
                {formData.attachments.map((attachment, index) => (
                  <View key={index} style={styles.attachmentItem}>
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
                      <Text style={styles.removeAttachmentText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          <Input
            label="Note"
            placeholder="Add a note (optional)"
            value={formData.note}
            onChangeText={(value) => updateFormData('note', value)}
            multiline
            numberOfLines={2}
          />

          <Button
            title="Submit Activity"
            onPress={handleSubmit}
            loading={isSubmitting}
            fullWidth
            style={styles.submitButton}
          />
        </Card>

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
    paddingBottom: Layout.spacing.xxl,
  },
  activityCard: {
    marginBottom: Layout.spacing.m,
  },
  errorText: {
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
    borderRadius: Layout.borderRadius.xl,
    backgroundColor: `${Colors.light.primary}10`,
    height: Layout.inputHeight,
  },
  attachmentButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.light.primary,
    marginLeft: Layout.spacing.s,
  },
  attachmentsList: {
    marginTop: Layout.spacing.s,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.light.inputBackground,
    borderRadius: Layout.borderRadius.small,
    padding: Layout.spacing.s,
    marginBottom: Layout.spacing.xs,
  },
  attachmentName: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.light.text,
    flex: 1,
  },
  removeAttachmentButton: {
    paddingHorizontal: Layout.spacing.s,
  },
  removeAttachmentText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.light.error,
  },
  submitButton: {
    marginTop: Layout.spacing.m,
  },
  historyButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.light.primary,
    marginRight: Layout.spacing.xs,
  },
});
