import Card from '@/components/Card';
import AppHeader from '@/components/Header';
import AppStatusBar from '@/components/StatusBar';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { parseDate } from '@/utils/date-time';
import { isNull } from '@/utils/validation';
import { UnknownOutputParams, useLocalSearchParams } from 'expo-router';
import { Download, Paperclip } from 'lucide-react-native';
import React from 'react';
import { Linking, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

interface Attachment {
  uri: string;
  name: string;
}

export default function NotificationDetailScreen() {
  // const { id } = useLocalSearchParams<{ id: string }>();
  const notification = useLocalSearchParams<UnknownOutputParams & INotification>();

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

  if (isNull(notification)) {
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
      <AppStatusBar />
      <AppHeader
        title="Notification Details"
        withBackButton={true}
        bg="primary"
        rightContent={<View style={{ width: 24 }} />}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card variant="outlined">
          <Text style={styles.title}>{notification.messageTitle}</Text>
          <Text style={styles.date}>
            {parseDate(notification?.referenceDate).toLocaleString('en-US', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
          <View style={styles.separator} />
          <Text style={styles.message}>{notification.messageDetails}</Text>

          {notification.attachments && notification.attachments.length > 0 && (
            <View style={styles.attachmentsContainer}>
              <Text style={styles.attachmentsTitle}>Attachments:</Text>
              {notification.attachmentFile01.map((att, index) => (
                <Pressable
                  key={index}
                  style={styles.attachmentItem}
                  onPress={() => handleAttachmentPress(att)}
                >
                  <Paperclip size={18} color={Colors.light.primary} />
                  <Text style={styles.attachmentName} numberOfLines={1}>
                    {att.name}
                  </Text>
                  <Download size={18} color={Colors.light.primary} style={styles.downloadIcon} />
                </Pressable>
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
