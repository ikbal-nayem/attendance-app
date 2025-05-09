import { Stack } from 'expo-router';

export default function ActivityStack() {
  return (
    <Stack initialRouteName="index" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index"  />
      <Stack.Screen name="history" />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}