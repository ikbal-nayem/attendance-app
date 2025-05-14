import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { ServerCrash } from 'lucide-react-native';
import { ReactElement } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import AppStatusBar from './StatusBar';

export const ErrorPreview = ({ error, header }: { error: string; header?: ReactElement }) => {
  return (
    <SafeAreaView style={styles.container}>
      <AppStatusBar />
      {header}

      <View style={styles.errorContainer}>
        <ServerCrash size={Layout.spacing.xxl} color={Colors.light.error} />
        <Text style={styles.errorMessage}>{error || 'Something went wrong!'}</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.spacing.l,
  },
  errorMessage: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.light.subtext,
    textAlign: 'center',
    marginTop: Layout.spacing.m,
  },
});
