import { SplashScreen, Stack} from "expo-router";
import { useFonts } from "expo-font";
import {useEffect} from "react";

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

  return <Stack screenOptions={{ headerShown: false }} />;
}
