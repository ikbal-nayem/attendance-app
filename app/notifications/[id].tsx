import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { useNotifications } from '@/context/NotificationContext';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Paperclip, Download } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
  ActivityIndicator,
} from 'react-native';

// Assuming Notification type from context includes attachments
interface Attachment {
  uri: string;
  name: string;
  // Add other potential fields like type, size if available
}

interface Notification {
  id: string;
  title: string;
  message: string;
  date: Date;
  read: boolean;
  type?: string;
  attachments?: Attachment[]; // Based on send.tsx sAttachmentFile01
}

export default function NotificationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { notifications, markAsRead } = useNotifications();
  const [notification, setNotification] = useState<Notification | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const foundNotification = notifications.find((n) => n.id === id);
      if (foundNotification) {
        setNotification(foundNotification as Notification); // Cast to include attachments
        if (!foundNotification.read) {
          markAsRead(id);
        }
      }
      setLoading(false);
    }
  }, [id, notifications, markAsRead]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString([], {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleAttachmentPress = async (attachment: Attachment) => {
    try {
      // For web or local URIs, Linking.openURL might work directly
      // For other cases (e.g., base64, or requiring download), more complex handling is needed
      const supported = await Linking.canOpenURL(attachment.uri);
      if (supported) {
        await Linking.openURL(attachment.uri);
      } else {
        // Fallback or error message
        console.warn(`Don't know how to open URI: ${attachment.uri}`);
        // Potentially show a toast message to the user
      }
    } catch (error) {
      console.error('Failed to open attachment:', error);
      // Potentially show a toast message to the user
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!notification) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader title="Notification Not Found" />
        <View style={styles.centered}>
          <Text style={styles.errorText}>The requested notification could not be found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.light.background} />
      <AppHeader title="Notification Details" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.title}>{notification.title}</Text>
          <Text style={styles.date}>{formatDate(new Date(notification.date))}</Text>
          <View style={styles.separator} />
          <Text style={styles.message}>{notification.message}</Text>

          {notification.attachments && notification.attachments.length > 0 && (
            <View style={styles.attachmentsContainer}>
              <Text style={styles.attachmentsTitle}>Attachments:</Text>
              {notification.attachments.map((att, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.attachmentItem}
                  onPress={() => handleAttachmentPress(att)}
                >
                  <Paperclip size={18} color={Colors.light.primary} />
                  <Text style={styles.attachmentName} numberOfLines={1}>
                    {att.name}
                  </Text>
                  <Download size={18} color={Colors.light.primary} style={styles.downloadIcon} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// A simple header component for this screen
const AppHeader = ({ title }: { title: string }) => (
  <View style={styles.header}>
    <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/notifications')} style={styles.backButton}>
      <ChevronLeft size={24} color={Colors.light.text} />
    </TouchableOpacity>
    <Text style={styles.headerTitle}>{title}</Text>
    <View style={{ width: 24 }} /> 
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.spacing.l,
  },
  errorText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.light.subtext,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.m,
    paddingVertical: Layout.spacing.m,
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
  scrollContent: {
    padding: Layout.spacing.l,
  },
  card: {
    backgroundColor: Colors.light.card, // Use light card background for consistency
    borderRadius: Layout.borderRadius.large,
    padding: Layout.spacing.l,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: Layout.borderRadius.medium,
    elevation: 3,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 22,
    color: Colors.light.text, // Use light text color
    marginBottom: Layout.spacing.s,
  },
  date: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: Colors.light.subtext, // Use light subtext color
    marginBottom: Layout.spacing.m,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.light.border, // Use light border color
    marginVertical: Layout.spacing.m,
  },
  message: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.light.text, // Use light text color
    lineHeight: 24,
  },
  attachmentsContainer: {
    marginTop: Layout.spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border, // Use light border color
    paddingTop: Layout.spacing.m,
  },
  attachmentsTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: Colors.light.text, // Use light text color
    marginBottom: Layout.spacing.m,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${Colors.light.primary}20`,
    paddingVertical: Layout.spacing.s,
    paddingHorizontal: Layout.spacing.m,
    borderRadius: Layout.borderRadius.medium,
    marginBottom: Layout.spacing.s,
  },
  attachmentName: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.light.primary,
    marginLeft: Layout.spacing.s,
    flex: 1,
  },
  downloadIcon: {
    marginLeft: Layout.spacing.s,
  },
});