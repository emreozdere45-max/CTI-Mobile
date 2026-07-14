import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { listFavorites } from "../api/favorites";
import { listNotifications } from "../api/notifications";
import { listThreats } from "../api/threats";
import { MainTabBar, type MainTab } from "../components/MainTabBar";
import type { AuthSession, Threat } from "../types/api";

type HomeScreenProps = {
  session: AuthSession;
  onOpenNotifications: () => void;
  onSelectTab: (tab: MainTab) => void;
  onSelectThreat: (threat: Threat) => void;
};

const severityColors: Record<string, string> = {
  critical: "#ff6b6b",
  high: "#ffb020",
  medium: "#58a6ff",
  low: "#58d68d",
  info: "#9fb0c7",
};

export function HomeScreen({
  session,
  onOpenNotifications,
  onSelectTab,
  onSelectThreat,
}: HomeScreenProps) {
  const [threats, setThreats] = useState<Threat[]>([]);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const criticalCount = useMemo(
    () => threats.filter((threat) => threat.severity === "critical").length,
    [threats],
  );
  const recentThreats = useMemo(() => threats.slice(0, 3), [threats]);

  async function loadDashboard(isRefresh = false) {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setErrorMessage(null);

    try {
      const [threatResult, favoriteResult, notificationResult] = await Promise.all([
        listThreats(session.accessToken),
        listFavorites(session.accessToken),
        listNotifications(session.accessToken),
      ]);

      setThreats(threatResult.data);
      setFavoriteCount(favoriteResult.meta.total);
      setUnreadCount(notificationResult.meta.unread_count);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Dashboard could not be loaded.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>CTI Mobile</Text>
            <Text style={styles.title}>Home</Text>
            <Text style={styles.subtitle}>Welcome, {session.user.full_name}</Text>
          </View>
          <Pressable onPress={onOpenNotifications} style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={23} color="#d7e2f0" />
          </Pressable>
        </View>

        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color="#58d68d" />
            <Text style={styles.loadingText}>Loading dashboard</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                onRefresh={() => void loadDashboard(true)}
                refreshing={isRefreshing}
                tintColor="#58d68d"
              />
            }
          >
            {errorMessage ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            <View style={styles.statGrid}>
              <StatBox label="Threats" value={threats.length} />
              <StatBox isCritical label="Critical" value={criticalCount} />
              <StatBox label="Favorites" value={favoriteCount} />
              <StatBox label="Unread" value={unreadCount} />
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent threats</Text>
              <Pressable onPress={() => onSelectTab("threats")}>
                <Text style={styles.sectionLink}>View all</Text>
              </Pressable>
            </View>

            <View style={styles.recentList}>
              {recentThreats.map((threat) => (
                <RecentThreatCard
                  key={threat.id}
                  onPress={() => onSelectThreat(threat)}
                  threat={threat}
                />
              ))}
            </View>
          </ScrollView>
        )}

        <MainTabBar activeTab="home" onSelectTab={onSelectTab} />
      </View>
    </SafeAreaView>
  );
}

function StatBox({
  isCritical = false,
  label,
  value,
}: {
  isCritical?: boolean;
  label: string;
  value: number;
}) {
  return (
    <View style={styles.statBox}>
      <Text style={[styles.statValue, isCritical ? styles.criticalValue : null]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function RecentThreatCard({ onPress, threat }: { onPress: () => void; threat: Threat }) {
  const severityColor = severityColors[threat.severity] ?? "#9fb0c7";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.recentCard, pressed ? styles.recentCardPressed : null]}
    >
      <View style={styles.recentHeader}>
        <View style={[styles.severityDot, { backgroundColor: severityColor }]} />
        <Text style={[styles.severityText, { color: severityColor }]}>{threat.severity}</Text>
      </View>
      <Text style={styles.recentTitle}>{threat.title}</Text>
      <Text style={styles.recentSummary}>{threat.summary}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#06111f",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  eyebrow: {
    color: "#58d68d",
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  title: {
    color: "#f7fbff",
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: 0,
  },
  subtitle: {
    color: "#9fb0c7",
    fontSize: 14,
    marginTop: 2,
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: "#0d1b2d",
    borderColor: "#263a55",
    borderRadius: 8,
    borderWidth: 1,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  loadingBox: {
    alignItems: "center",
    flex: 1,
    gap: 12,
    justifyContent: "center",
  },
  loadingText: {
    color: "#9fb0c7",
  },
  scrollContent: {
    paddingBottom: 18,
  },
  errorBox: {
    backgroundColor: "#3b1620",
    borderColor: "#8e2f45",
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 14,
    padding: 12,
  },
  errorText: {
    color: "#ffd9df",
  },
  statGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 14,
  },
  statBox: {
    backgroundColor: "#0d1b2d",
    borderColor: "#263a55",
    borderRadius: 8,
    borderWidth: 1,
    padding: 14,
    width: "48%",
  },
  statValue: {
    color: "#f7fbff",
    fontSize: 26,
    fontWeight: "800",
  },
  criticalValue: {
    color: "#ff6b6b",
  },
  statLabel: {
    color: "#9fb0c7",
    fontSize: 13,
    marginTop: 2,
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionTitle: {
    color: "#f7fbff",
    fontSize: 18,
    fontWeight: "900",
  },
  sectionLink: {
    color: "#58d68d",
    fontSize: 13,
    fontWeight: "900",
  },
  recentList: {
    gap: 10,
  },
  recentCard: {
    backgroundColor: "#0d1b2d",
    borderColor: "#263a55",
    borderRadius: 8,
    borderWidth: 1,
    padding: 14,
  },
  recentCardPressed: {
    opacity: 0.82,
  },
  recentHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  severityDot: {
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  severityText: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  recentTitle: {
    color: "#f7fbff",
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 22,
  },
  recentSummary: {
    color: "#b7c4d6",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
});
