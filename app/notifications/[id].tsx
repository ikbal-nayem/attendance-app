import Card from '@/components/Card';
import AppHeader from '@/components/Header';
import AppStatusBar from '@/components/StatusBar';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { useNotifications } from '@/context/NotificationContext';
import { useLocalSearchParams } from 'expo-router';
import { Download, Paperclip } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface Attachment {
  uri: string;
  name: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  date: Date;
  read: boolean;
  type?: string;
  attachments?: Attachment[];
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
      const supported = await Linking.canOpenURL(attachment.uri);
      if (supported) {
        await Linking.openURL(attachment.uri);
      } else {
        console.warn(`Don't know how to open URI: ${attachment.uri}`);
      }
    } catch (error) {
      console.error('Failed to open attachment:', error);
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
          <Text style={styles.errorText}>
            The requested notification could not be found.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppStatusBar />
      <AppHeader
        title="Notification Details"
        withBackButton={true}
        bg="primary"
        rightContent={<View style={{ width: 24 }} />}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card variant="outlined">
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
                  <Download
                    size={18}
                    color={Colors.light.primary}
                    style={styles.downloadIcon}
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}
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
  scrollContent: {
    padding: Layout.spacing.l,
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
