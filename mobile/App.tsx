import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { FavoritesScreen } from "./src/screens/FavoritesScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { ThreatDetailScreen } from "./src/screens/ThreatDetailScreen";
import { ThreatsScreen } from "./src/screens/ThreatsScreen";
import type { AuthSession, Threat } from "./src/types/api";

export default function App() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [selectedThreat, setSelectedThreat] = useState<Threat | null>(null);
  const [activeScreen, setActiveScreen] = useState<"threats" | "favorites">("threats");

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
      ) : session ? (
        <ThreatsScreen
          onOpenFavorites={() => setActiveScreen("favorites")}
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
