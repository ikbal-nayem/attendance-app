import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect to the auth stack initially
  return <Redirect href="/auth/login" />;
}
