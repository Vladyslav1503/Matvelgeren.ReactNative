import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { Text, View } from 'react-native';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Inter-Regular': require('../assets/fonts/Inter-Regular.otf'),
    'Inter-SemiBold': require('../assets/fonts/Inter-SemiBold.otf'),
  });

  if (!fontsLoaded) {
    // Optional: Add your own splash or fallback here
    return <View><Text>Loading...</Text></View>;
  }

  return <Stack />;
}
