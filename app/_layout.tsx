import { useEffect, useState } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { PaperProvider, MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import { useThemeStore } from './store/themeStore';
import supabase from './lib/supabase';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AnimatedSplash from './components/AnimatedSplash';
import * as SplashScreen from 'expo-splash-screen';
import * as Updates from 'expo-updates';
import { Alert } from 'react-native';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const segments = useSegments();
  const router = useRouter();
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? MD3DarkTheme : MD3LightTheme;
  const [isReady, setIsReady] = useState(false);
  const [showAnimatedSplash, setShowAnimatedSplash] = useState(true);

  // Check for updates
  useEffect(() => {
    checkForUpdates();
  }, []);

  async function checkForUpdates() {
    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        Alert.alert(
          "Update Available",
          "A new version is available. Would you like to update now?",
          [
            { text: "No" },
            {
              text: "Yes",
              onPress: async () => {
                try {
                  await Updates.fetchUpdateAsync();
                  await Updates.reloadAsync();
                } catch (error) {
                  Alert.alert(
                    "Error",
                    "An error occurred while updating. Please try again later."
                  );
                }
              },
            },
          ]
        );
      }
    } catch (error) {
      // Handle or log error
      console.log('Error checking for updates:', error);
    }
  }

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make API calls, etc.
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate loading
        await SplashScreen.hideAsync();
      } catch (e) {
        console.warn(e);
      } finally {
        setIsReady(true);
      }
    }

    prepare();
  }, []);

  const handleAnimationComplete = () => {
    setShowAnimatedSplash(false);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/(app)');
      } else {
        router.replace('/(auth)/login');
      }
    });

    supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        router.replace('/(app)');
      } else {
        router.replace('/(auth)/login');
      }
    });
  }, [segments]);

  if (!isReady) {
    return null;
  }

  return (
    <PaperProvider theme={theme}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        {showAnimatedSplash ? (
          <AnimatedSplash onAnimationComplete={handleAnimationComplete} />
        ) : (
          <Slot />
        )}
      </GestureHandlerRootView>
    </PaperProvider>
  );
}