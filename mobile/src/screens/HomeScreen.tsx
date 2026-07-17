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
  critical: "#dc2626",
  high: "#ea580c",
  medium: "#2563eb",
  low: "#16a34a",
  info: "#64748b",
};

const severityLabels: Record<string, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
  info: "Info",
};

export function HomeScreen({
  session,
  onOpenNotifications,
  onSelectTab,
  onSelectThreat,
}: HomeScreenProps) {
  const [threats, setThreats] = useState<Threat[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const criticalCount = useMemo(
    () => threats.filter((threat) => threat.severity === "critical").length,
    [threats],
  );
  const highCount = useMemo(
    () => threats.filter((threat) => threat.severity === "high").length,
    [threats],
  );
  const recentThreats = useMemo(() => threats.slice(0, 4), [threats]);
  const firstName = session.user.full_name.split(" ")[0] || "Analyst";
  const todayLabel = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
  }).format(new Date());

  async function loadDashboard(isRefresh = false) {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setErrorMessage(null);

    try {
      const [threatResult, notificationResult] = await Promise.all([
        listThreats(session.accessToken),
        listNotifications(session.accessToken),
      ]);

      setThreats(threatResult.data);
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
          <View style={styles.headerTitleBlock}>
            <Text style={styles.eyebrow}>CTI-Mobile</Text>
            <Text style={styles.title}>Good afternoon, {firstName}</Text>
            <Text style={styles.dateTitle}>{todayLabel}</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable onPress={onOpenNotifications} style={styles.roundIconButton}>
              <Ionicons name="notifications-outline" size={23} color="#101828" />
              {unreadCount > 0 ? <View style={styles.notificationDot} /> : null}
            </Pressable>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color="#101828" />
            <Text style={styles.loadingText}>Dashboard loading</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                onRefresh={() => void loadDashboard(true)}
                refreshing={isRefreshing}
                tintColor="#101828"
              />
            }
          >
            {errorMessage ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            <View style={styles.briefingPanel}>
              <View style={styles.briefingTopRow}>
                <Text style={styles.briefingLabel}>Operational briefing</Text>
                <Text style={styles.briefingDate}>{todayLabel}</Text>
              </View>
              <Text style={styles.briefingTitle}>
                {criticalCount > 0
                  ? `${criticalCount} critical threat needs attention`
                  : "No critical threat waiting"}
              </Text>
              <Text style={styles.briefingBody}>
                Review high-risk campaigns, validate related IOCs, and save the items your team
                should keep tracking.
              </Text>
            </View>

            <View style={styles.metricGrid}>
              <MetricCard icon="shield-checkmark-outline" label="Tracked" value={`${threats.length}`} />
              <MetricCard alert icon="flame-outline" label="Urgent" value={`${criticalCount + highCount}`} />
              <MetricCard icon="notifications-outline" label="Unread" value={`${unreadCount}`} />
            </View>

            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Threat feed</Text>
                <Text style={styles.sectionSubtitle}>Latest intelligence from your workspace</Text>
              </View>
              <Pressable onPress={() => onSelectTab("threats")}>
                <Text style={styles.viewAllText}>View all</Text>
              </Pressable>
            </View>

            <View style={styles.threatList}>
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

function MetricCard({
  alert = false,
  icon,
  label,
  value,
}: {
  alert?: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.metricCard}>
      <View style={[styles.metricIcon, alert ? styles.metricIconAlert : null]}>
        <Ionicons name={icon} size={18} color={alert ? "#b42318" : "#175cd3"} />
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function RecentThreatCard({ onPress, threat }: { onPress: () => void; threat: Threat }) {
  const severityColor = severityColors[threat.severity] ?? "#64748b";
  const severityLabel = severityLabels[threat.severity] ?? threat.severity;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.threatCard,
        { borderLeftColor: severityColor },
        pressed ? styles.pressed : null,
      ]}
    >
      <View style={styles.threatTopRow}>
        <View style={[styles.severityPill, { backgroundColor: `${severityColor}18` }]}>
          <View style={[styles.severityDot, { backgroundColor: severityColor }]} />
          <Text style={[styles.severityText, { color: severityColor }]}>{severityLabel}</Text>
        </View>
        <Text style={styles.confidenceText}>{threat.confidence_score}% confidence</Text>
      </View>

      <Text numberOfLines={2} style={styles.threatTitle}>
        {threat.title}
      </Text>
      <Text numberOfLines={2} style={styles.threatSummary}>
        {threat.summary}
      </Text>

      <View style={styles.threatBottomRow}>
        <Text numberOfLines={1} style={styles.sourceText}>
          {threat.source?.name ?? "Internal CTI"}
        </Text>
        <Ionicons name="chevron-forward" size={20} color="#98a2b3" />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f4f7fb",
  },
  container: {
    flex: 1,
    paddingTop: 16,
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
    paddingHorizontal: 20,
  },
  headerTitleBlock: {
    flex: 1,
    paddingRight: 14,
  },
  eyebrow: {
    color: "#667085",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  title: {
    color: "#101828",
    fontSize: 27,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 33,
  },
  dateTitle: {
    color: "#475467",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 0,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
    gap: 10,
  },
  roundIconButton: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#e4e7ec",
    borderRadius: 999,
    borderWidth: 1,
    height: 46,
    justifyContent: "center",
    position: "relative",
    width: 46,
  },
  notificationDot: {
    backgroundColor: "#d92d20",
    borderColor: "#ffffff",
    borderRadius: 999,
    borderWidth: 2,
    height: 11,
    position: "absolute",
    right: 9,
    top: 9,
    width: 11,
  },
  loadingBox: {
    alignItems: "center",
    flex: 1,
    gap: 12,
    justifyContent: "center",
  },
  loadingText: {
    color: "#667085",
  },
  scrollContent: {
    paddingBottom: 18,
  },
  errorBox: {
    backgroundColor: "#fef3f2",
    borderColor: "#fecdca",
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 14,
    marginHorizontal: 20,
    padding: 12,
  },
  errorText: {
    color: "#b42318",
  },
  briefingPanel: {
    backgroundColor: "#101828",
    borderRadius: 8,
    marginHorizontal: 20,
    padding: 20,
  },
  briefingTopRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  briefingLabel: {
    color: "#d0d5dd",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  briefingDate: {
    color: "#98a2b3",
    fontSize: 13,
    fontWeight: "700",
  },
  briefingTitle: {
    color: "#ffffff",
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 32,
  },
  briefingBody: {
    color: "#d0d5dd",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
  },
  metricGrid: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  metricCard: {
    backgroundColor: "#ffffff",
    borderColor: "#e4e7ec",
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    padding: 13,
  },
  metricIcon: {
    alignItems: "center",
    backgroundColor: "#eff8ff",
    borderRadius: 999,
    height: 32,
    justifyContent: "center",
    marginBottom: 10,
    width: 32,
  },
  metricIconAlert: {
    backgroundColor: "#fef3f2",
  },
  metricValue: {
    color: "#101828",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 0,
  },
  metricLabel: {
    color: "#667085",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 2,
  },
  sectionHeader: {
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: "#101828",
    fontSize: 25,
    fontWeight: "900",
    letterSpacing: 0,
  },
  sectionSubtitle: {
    color: "#667085",
    fontSize: 14,
    marginTop: 2,
  },
  viewAllText: {
    color: "#175cd3",
    fontSize: 14,
    fontWeight: "900",
    paddingBottom: 3,
  },
  threatList: {
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  threatCard: {
    backgroundColor: "#ffffff",
    borderColor: "#e4e7ec",
    borderLeftWidth: 4,
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
  },
  threatTopRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 13,
  },
  severityPill: {
    alignItems: "center",
    borderRadius: 999,
    flexDirection: "row",
    gap: 7,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  severityDot: {
    borderRadius: 999,
    height: 7,
    width: 7,
  },
  severityText: {
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  confidenceText: {
    color: "#667085",
    fontSize: 12,
    fontWeight: "800",
  },
  threatTitle: {
    color: "#101828",
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 25,
  },
  threatSummary: {
    color: "#475467",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
  threatBottomRow: {
    alignItems: "center",
    borderTopColor: "#eef2f6",
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
    paddingTop: 12,
  },
  sourceText: {
    color: "#667085",
    flex: 1,
    fontSize: 13,
    fontWeight: "800",
  },
  pressed: {
    opacity: 0.82,
  },
});
