import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppStatusBar from './StatusBar';

export const ErrorPreview = ({ error }: { error: string }) => {
  return (
    <SafeAreaView style={styles.container}>
      <AppStatusBar />

      <View style={styles.errorContainer}>
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
  },
});
