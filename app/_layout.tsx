import { useEffect, useState } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { PaperProvider, MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import { useThemeStore } from './store/themeStore';
import { useAuthStore } from './store/authStore';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AnimatedSplash from './components/AnimatedSplash';
import * as SplashScreen from 'expo-splash-screen';
import * as Updates from 'expo-updates';
import { Alert } from 'react-native';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const { isDarkMode } = useThemeStore();
  const { session, isLoading, initialize } = useAuthStore();
  const theme = isDarkMode ? MD3DarkTheme : MD3LightTheme;
  const [isReady, setIsReady] = useState(false);
  const [showAnimatedSplash, setShowAnimatedSplash] = useState(true);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      return;
    }
    
    async function checkForUpdates() {
      try {
        if (!Updates.isEnabled) {
          return;
        }

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
                    console.log('Error updating:', error);
                  }
                },
              },
            ]
          );
        }
      } catch (error) {
        console.log('Error checking for updates:', error);
      }
    }

    setTimeout(checkForUpdates, 3000);
  }, []);

  useEffect(() => {
    const prepare = async () => {
      try {
        await initialize();
        await new Promise(resolve => setTimeout(resolve, 500));
        await SplashScreen.hideAsync();
      } catch (e) {
        console.warn(e);
      } finally {
        setIsReady(true);
      }
    };

    prepare();
  }, [initialize]);

  useEffect(() => {
    if (!isReady || isLoading) return;

    if (session) {
      router.replace('/(app)');
    } else {
      router.replace('/(auth)/login');
    }
  }, [isReady, isLoading, session, router]);

  const handleAnimationComplete = () => {
    setShowAnimatedSplash(false);
  };

  if (!isReady || isLoading) {
    return showAnimatedSplash ? (
      <AnimatedSplash onAnimationComplete={handleAnimationComplete} />
    ) : null;
  }

  return (
    <PaperProvider theme={theme}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Slot />
      </GestureHandlerRootView>
    </PaperProvider>
  );
}
