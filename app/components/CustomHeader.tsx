import React from "react"
import { StyleSheet, View } from "react-native"
import {
  Text,
  IconButton,
  useTheme,
  SegmentedButtons,
} from "react-native-paper"
import { useThemeStore } from "../store/themeStore"
import { useViewStore, type ViewMode } from "../store/viewStore"
import { useAuthStore } from "../store/authStore"

export default function CustomHeader() {
  const theme = useTheme()
  const { isDarkMode, toggleTheme } = useThemeStore()
  const { viewMode, setViewMode } = useViewStore()
  const { signOut } = useAuthStore()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
    }
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.elevation.level2 },
      ]}
    >
      <View style={styles.topRow}>
        <Text
          variant="headlineMedium"
          style={[styles.title, { color: theme.colors.onBackground }]}
        >
          Tarefas teste
        </Text>
        <View style={styles.actions}>
          <IconButton
            icon={isDarkMode ? "white-balance-sunny" : "moon-waning-crescent"}
            iconColor={theme.colors.onBackground}
            size={24}
            onPress={toggleTheme}
          />
          <IconButton
            icon="logout"
            iconColor={theme.colors.onBackground}
            size={24}
            onPress={handleSignOut}
          />
        </View>
      </View>
      <View style={styles.bottomRow}>
        <SegmentedButtons
          value={viewMode}
          onValueChange={(value) => setViewMode(value as ViewMode)}
          buttons={[
            { value: "list", icon: "format-list-bulleted", label: "List" },
            { value: "kanban", icon: "view-column", label: "Kanban" },
          ]}
          style={[
            styles.viewSwitch,
            { backgroundColor: theme.colors.elevation.level1 },
          ]}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 40,
    paddingBottom: 8,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  bottomRow: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  title: {
    marginLeft: 8,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewSwitch: {
    borderRadius: 8,
  },
})
