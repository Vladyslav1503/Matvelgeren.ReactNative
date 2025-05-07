import { SplashScreen, Stack} from "expo-router";
import { useFonts } from "expo-font";
import { useEffect} from "react";
import { View } from "react-native";
import { SafeAreaView  } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, error] = useFonts({
    'Inter-Regular': require('../assets/fonts/Inter-Regular.otf'),
    'Inter-SemiBold': require('../assets/fonts/Inter-SemiBold.otf'),
  });

  useEffect(() => {
  if (error) throw error;
  if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded, error]);

  if (!fontsLoaded && !error) return null;

  return (
      <View style={{ flex: 1, backgroundColor: 'white' }}>
          <StatusBar style="dark" />
        <SafeAreaView style={{ flex: 1 }}>
          <Stack screenOptions={{ headerShown: false }} />
        </SafeAreaView>
      </View>
    );
}
