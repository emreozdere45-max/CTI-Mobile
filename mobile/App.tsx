import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AccountScreen } from "./src/screens/AccountScreen";
import { FavoritesScreen } from "./src/screens/FavoritesScreen";
import { IocSearchScreen, type IocSearchScreenState } from "./src/screens/IocSearchScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { NotificationsScreen } from "./src/screens/NotificationsScreen";
import { CreateThreatScreen } from "./src/screens/CreateThreatScreen";
import { EditThreatScreen } from "./src/screens/EditThreatScreen";
import { HomeScreen } from "./src/screens/HomeScreen";
import { ThreatDetailScreen } from "./src/screens/ThreatDetailScreen";
import { ThreatsScreen } from "./src/screens/ThreatsScreen";
import type { MainTab } from "./src/components/MainTabBar";
import type { AuthSession, Threat, ThreatDetail, ThreatIOC } from "./src/types/api";

export default function App() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [selectedThreat, setSelectedThreat] = useState<Threat | null>(null);
  const [editingThreat, setEditingThreat] = useState<ThreatDetail | null>(null);
  const [iocSearchReturnThreat, setIocSearchReturnThreat] = useState<Threat | null>(null);
  const [iocSearchState, setIocSearchState] = useState<IocSearchScreenState | null>(null);
  const [activeScreen, setActiveScreen] = useState<MainTab | "createThreat" | "notifications">(
    "home",
  );

  function openMainTab(tab: MainTab) {
    setEditingThreat(null);
    setIocSearchReturnThreat(null);
    setSelectedThreat(null);
    setActiveScreen(tab);
  }

  function handleLogout() {
    setEditingThreat(null);
    setIocSearchReturnThreat(null);
    setSelectedThreat(null);
    setIocSearchState(null);
    setActiveScreen("home");
    setSession(null);
  }

  function openIocSearchFromThreat(ioc: ThreatIOC) {
    setIocSearchReturnThreat(selectedThreat);
    setIocSearchState({
      autoSearch: true,
      favoriteIdsByIocId: {},
      query: ioc.value,
      result: null,
      selectedType: ioc.type,
    });
    setSelectedThreat(null);
    setActiveScreen("iocSearch");
  }

  return (
    <SafeAreaProvider>
      {session && editingThreat ? (
        <EditThreatScreen
          onBack={() => setEditingThreat(null)}
          onUpdated={(threat) => {
            setEditingThreat(null);
            setSelectedThreat(threat);
          }}
          session={session}
          threat={editingThreat}
        />
      ) : session && selectedThreat ? (
        <ThreatDetailScreen
          onBack={() => setSelectedThreat(null)}
          onDeleted={() => {
            setEditingThreat(null);
            setIocSearchReturnThreat(null);
            setSelectedThreat(null);
            setActiveScreen("threats");
          }}
          onEdit={setEditingThreat}
          onOpenIoc={openIocSearchFromThreat}
          session={session}
          threat={selectedThreat}
        />
      ) : session && activeScreen === "favorites" ? (
        <FavoritesScreen
          activeTab="favorites"
          onBack={() => setActiveScreen("home")}
          onSelectTab={openMainTab}
          onSelectThreat={setSelectedThreat}
          session={session}
        />
      ) : session && activeScreen === "notifications" ? (
        <NotificationsScreen
          activeTab={null}
          onBack={() => setActiveScreen("home")}
          onSelectTab={openMainTab}
          onSelectThreat={(threat) => {
            setSelectedThreat(threat);
          }}
          session={session}
        />
      ) : session && activeScreen === "iocSearch" ? (
        <IocSearchScreen
          initialState={iocSearchState}
          onBack={() => {
            if (iocSearchReturnThreat) {
              setSelectedThreat(iocSearchReturnThreat);
              setIocSearchReturnThreat(null);
            } else {
              setActiveScreen("home");
            }
          }}
          activeTab="iocSearch"
          onSelectThreat={(threat) => {
            setIocSearchReturnThreat(null);
            setSelectedThreat(threat);
          }}
          onSelectTab={openMainTab}
          onStateChange={setIocSearchState}
          session={session}
        />
      ) : session && activeScreen === "createThreat" ? (
        <CreateThreatScreen
          onBack={() => setActiveScreen("threats")}
          onCreated={(threat) => {
            setActiveScreen("threats");
            setSelectedThreat(threat);
          }}
          session={session}
        />
      ) : session && activeScreen === "account" ? (
        <AccountScreen
          onBack={() => setActiveScreen("home")}
          onLogout={handleLogout}
          onSelectTab={openMainTab}
          onSelectThreat={setSelectedThreat}
          session={session}
        />
      ) : session && activeScreen === "threats" ? (
        <ThreatsScreen
          onOpenFavorites={() => setActiveScreen("favorites")}
          onOpenHome={() => setActiveScreen("home")}
          onOpenIocSearch={() => setActiveScreen("iocSearch")}
          onOpenNotifications={() => setActiveScreen("notifications")}
          onSelectTab={openMainTab}
          onSelectThreat={setSelectedThreat}
          session={session}
        />
      ) : session ? (
        <HomeScreen
          onOpenNotifications={() => setActiveScreen("notifications")}
          onSelectTab={openMainTab}
          onSelectThreat={setSelectedThreat}
          session={session}
        />
      ) : (
        <LoginScreen
          onLoginSuccess={(nextSession) => {
            setEditingThreat(null);
            setIocSearchReturnThreat(null);
            setSelectedThreat(null);
            setIocSearchState(null);
            setActiveScreen("home");
            setSession(nextSession);
          }}
        />
      )}
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}
