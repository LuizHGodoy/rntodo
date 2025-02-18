import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as Updates from "expo-updates";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from "react-native-paper";
import AnimatedSplash from "../src/components/AnimatedSplash";
import { useAuthStore } from "../src/store/authStore";
import { useThemeStore } from "../src/store/themeStore";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const { isDarkMode } = useThemeStore();
  const { initialize, isAuthenticated, isLoading } = useAuthStore();
  const theme = isDarkMode ? MD3DarkTheme : MD3LightTheme;
  const segments = useSegments();
  const [showAnimatedSplash, setShowAnimatedSplash] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await initialize();
      } finally {
        await SplashScreen.hideAsync();
      }
    };

    init();
  }, []);

  useEffect(() => {
    const checkUpdates = async () => {
      if (process.env.NODE_ENV === "development") return;

      try {
        if (!Updates.isEnabled) {
          console.log("Expo Updates não está habilitado");
          return;
        }

        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          Alert.alert(
            "Atualização Disponível",
            "Uma nova versão do aplicativo está disponível. Deseja atualizar agora?",
            [
              {
                text: "Cancelar",
                style: "cancel",
              },
              {
                text: "Atualizar",
                onPress: async () => {
                  try {
                    await Updates.fetchUpdateAsync();
                    await Updates.reloadAsync();
                  } catch (error) {
                    console.error("Erro ao atualizar:", error);
                    Alert.alert(
                      "Erro de Atualização",
                      "Não foi possível atualizar o aplicativo. Tente novamente mais tarde."
                    );
                  }
                },
              },
            ]
          );
        }
      } catch (error) {
        console.error("Erro ao verificar atualizações:", error);
      }
    };

    const prepare = async () => {
      try {
        await initialize();
        await checkUpdates();
        await new Promise((resolve) => setTimeout(resolve, 500));
        await SplashScreen.hideAsync();
      } catch (e) {
        console.error("Erro durante inicialização:", e);
      } finally {
        setIsInitialized(true);
        setShowAnimatedSplash(false);
      }
    };

    prepare();
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (!isInitialized || isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(app)");
    }
  }, [isLoading, isAuthenticated, segments, isInitialized]);

  if (showAnimatedSplash) {
    return (
      <AnimatedSplash
        onAnimationComplete={() => setShowAnimatedSplash(false)}
      />
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={theme}>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "fade",
            contentStyle: {
              backgroundColor: theme.colors.background,
            },
          }}
        />
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
