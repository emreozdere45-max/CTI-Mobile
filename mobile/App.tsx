import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { FavoritesScreen } from "./src/screens/FavoritesScreen";
import { IocSearchScreen } from "./src/screens/IocSearchScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { NotificationsScreen } from "./src/screens/NotificationsScreen";
import { ThreatDetailScreen } from "./src/screens/ThreatDetailScreen";
import { ThreatsScreen } from "./src/screens/ThreatsScreen";
import type { AuthSession, Threat } from "./src/types/api";

export default function App() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [selectedThreat, setSelectedThreat] = useState<Threat | null>(null);
  const [activeScreen, setActiveScreen] = useState<
    "threats" | "favorites" | "notifications" | "iocSearch"
  >("threats");

  return (
    <SafeAreaProvider>
      {session && selectedThreat ? (
        <ThreatDetailScreen
          onBack={() => setSelectedThreat(null)}
          session={session}
          threat={selectedThreat}
        />
      ) : session && activeScreen === "favorites" ? (
        <FavoritesScreen
          onBack={() => setActiveScreen("threats")}
          onSelectThreat={setSelectedThreat}
          session={session}
        />
      ) : session && activeScreen === "notifications" ? (
        <NotificationsScreen onBack={() => setActiveScreen("threats")} session={session} />
      ) : session && activeScreen === "iocSearch" ? (
        <IocSearchScreen onBack={() => setActiveScreen("threats")} session={session} />
      ) : session ? (
        <ThreatsScreen
          onOpenFavorites={() => setActiveScreen("favorites")}
          onOpenIocSearch={() => setActiveScreen("iocSearch")}
          onOpenNotifications={() => setActiveScreen("notifications")}
          onLogout={() => {
            setSelectedThreat(null);
            setActiveScreen("threats");
            setSession(null);
          }}
          onSelectThreat={setSelectedThreat}
          session={session}
        />
      ) : (
        <LoginScreen
          onLoginSuccess={(nextSession) => {
            setSelectedThreat(null);
            setActiveScreen("threats");
            setSession(nextSession);
          }}
        />
      )}
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}
