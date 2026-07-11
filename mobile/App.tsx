import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { LoginScreen } from "./src/screens/LoginScreen";
import { ThreatsScreen } from "./src/screens/ThreatsScreen";
import type { AuthSession } from "./src/types/api";

export default function App() {
  const [session, setSession] = useState<AuthSession | null>(null);

  return (
    <SafeAreaProvider>
      {session ? (
        <ThreatsScreen onLogout={() => setSession(null)} session={session} />
      ) : (
        <LoginScreen onLoginSuccess={setSession} />
      )}
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}
