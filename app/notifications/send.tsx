import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, Paperclip as PaperClip } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNotifications } from '@/context/NotificationContext';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import Card from '@/components/Card';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Select from '@/components/Select';

// Dummy users for notification recipients
const users = [
  { label: 'All Users', value: 'all' },
  { label: 'John Smith', value: 'john.smith' },
  { label: 'Emma Johnson', value: 'emma.johnson' },
  { label: 'Michael Chen', value: 'michael.chen' },
  { label: 'Sarah Williams', value: 'sarah.williams' },
];

export default function SendNotificationScreen() {
  const { sendNotification } = useNotifications();
  
  const [recipients, setRecipients] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const validateForm = () => {
    if (recipients.length === 0) {
      setError('Please select at least one recipient');
      return false;
    }
    if (!subject) {
      setError('Please enter a subject');
      return false;
    }
    if (!message) {
      setError('Please enter a message');
      return false;
    }
    
    return true;
  };

  const handleSend = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const success = await sendNotification(recipients, subject, message, attachments);
      
      if (success) {
        Alert.alert('Success', 'Notification sent successfully');
        // Reset form
        setRecipients([]);
        setSubject('');
        setMessage('');
        setAttachments([]);
      } else {
        Alert.alert('Error', 'Failed to send notification');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      Alert.alert('Error', 'Failed to send notification');
    } finally {
      setIsSubmitting(false);
    }
  };

  const pickAttachments = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Media library permission is required to select files');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: true,
        quality: 0.7,
      });
      
      if (!result.canceled) {
        const newAttachments = result.assets.map(asset => asset.uri);
        setAttachments([...attachments, ...newAttachments]);
      }
    } catch (error) {
      console.error('Error selecting files:', error);
      Alert.alert('Error', 'Failed to select files');
    }
  };

  const removeAttachment = (index: number) => {
    const updatedAttachments = [...attachments];
    updatedAttachments.splice(index, 1);
    setAttachments(updatedAttachments);
  };

  const getAttachmentName = (uri: string) => {
    // Extract filename from URI
    const parts = uri.split('/');
    return parts[parts.length - 1];
  };

  const handleRecipientsChange = (value: string) => {
    if (value === 'all') {
      // If "All Users" is selected, include all user values except 'all'
      setRecipients(users.filter(user => user.value !== 'all').map(user => user.value));
    } else {
      // Toggle selection for the specific user
      if (recipients.includes(value)) {
        setRecipients(recipients.filter(r => r !== value));
      } else {
        setRecipients([...recipients, value]);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.light.background} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={Colors.light.text} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Send Notification</Text>
        
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Card variant="elevated" style={styles.card}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          
          <View style={styles.recipientsContainer}>
            <Text style={styles.recipientsLabel}>To:</Text>
            
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.recipientsList}
            >
              {users.map(user => (
                <TouchableOpacity
                  key={user.value}
                  style={[
                    styles.recipientChip,
                    recipients.includes(user.value) && styles.selectedRecipientChip,
                  ]}
                  onPress={() => handleRecipientsChange(user.value)}
                >
                  <Text
                    style={[
                      styles.recipientChipText,
                      recipients.includes(user.value) && styles.selectedRecipientChipText,
                    ]}
                  >
                    {user.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          <Input
            label="Subject"
            placeholder="Enter notification subject"
            value={subject}
            onChangeText={setSubject}
          />
          
          <Input
            label="Message"
            placeholder="Enter notification message"
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={5}
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
            
            {attachments.length > 0 && (
              <View style={styles.attachmentsList}>
                {attachments.map((attachment, index) => (
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
          
          <Button
            title="Send Notification"
            onPress={handleSend}
            loading={isSubmitting}
            fullWidth
            style={styles.sendButton}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.l,
    paddingTop: Layout.spacing.l,
    paddingBottom: Layout.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  backButton: {
    padding: Layout.spacing.xs,
  },
  headerTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: Colors.light.text,
  },
  placeholder: {
    width: 32,
    height: 32,
  },
  scrollContent: {
    padding: Layout.spacing.l,
    paddingBottom: Layout.spacing.xxl,
  },
  card: {
    marginBottom: Layout.spacing.m,
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.light.error,
    marginBottom: Layout.spacing.m,
    textAlign: 'center',
  },
  recipientsContainer: {
    marginBottom: Layout.spacing.m,
  },
  recipientsLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: Layout.spacing.xs,
  },
  recipientsList: {
    flexDirection: 'row',
  },
  recipientChip: {
    backgroundColor: Colors.light.inputBackground,
    borderRadius: Layout.borderRadius.medium,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  selectedRecipientChip: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  recipientChipText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.light.text,
  },
  selectedRecipientChipText: {
    color: 'white',
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
    borderRadius: Layout.borderRadius.medium,
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
  sendButton: {
    marginTop: Layout.spacing.m,
  },
});