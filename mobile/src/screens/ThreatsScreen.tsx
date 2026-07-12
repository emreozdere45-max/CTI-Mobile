import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { listThreats } from "../api/threats";
import type { AuthSession, Threat } from "../types/api";

type ThreatsScreenProps = {
  session: AuthSession;
  onLogout: () => void;
  onOpenCreateThreat: () => void;
  onOpenFavorites: () => void;
  onOpenIocSearch: () => void;
  onOpenNotifications: () => void;
  onSelectThreat: (threat: Threat) => void;
};

const severityColors: Record<string, string> = {
  critical: "#ff6b6b",
  high: "#ffb020",
  medium: "#58a6ff",
  low: "#58d68d",
  info: "#9fb0c7",
};

export function ThreatsScreen({
  session,
  onLogout,
  onOpenCreateThreat,
  onOpenFavorites,
  onOpenIocSearch,
  onOpenNotifications,
  onSelectThreat,
}: ThreatsScreenProps) {
  const [threats, setThreats] = useState<Threat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const criticalCount = useMemo(
    () => threats.filter((threat) => threat.severity === "critical").length,
    [threats],
  );

  async function loadThreats(isRefresh = false) {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setErrorMessage(null);

    try {
      const result = await listThreats(session.accessToken);
      setThreats(result.data);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Threats could not be loaded.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    void loadThreats();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>CTI dashboard</Text>
            <Text style={styles.title}>Threats</Text>
            <Text style={styles.subtitle}>{session.user.full_name}</Text>
          </View>

          <View style={styles.headerActions}>
            <Pressable onPress={onOpenCreateThreat} style={styles.iconButton}>
              <Ionicons name="add" size={24} color="#d7e2f0" />
            </Pressable>
            <Pressable onPress={onOpenNotifications} style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={22} color="#d7e2f0" />
            </Pressable>
            <Pressable onPress={onOpenFavorites} style={styles.iconButton}>
              <Ionicons name="star-outline" size={22} color="#d7e2f0" />
            </Pressable>
            <Pressable onPress={onLogout} style={styles.iconButton}>
              <Ionicons name="log-out-outline" size={22} color="#d7e2f0" />
            </Pressable>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{threats.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, styles.criticalValue]}>{criticalCount}</Text>
            <Text style={styles.statLabel}>Critical</Text>
          </View>
        </View>

        <Pressable
          onPress={onOpenIocSearch}
          style={({ pressed }) => [styles.lookupButton, pressed ? styles.lookupButtonPressed : null]}
        >
          <View style={styles.lookupIcon}>
            <Ionicons name="search-outline" size={20} color="#06111f" />
          </View>
          <View style={styles.lookupTextBlock}>
            <Text style={styles.lookupTitle}>Search IOC</Text>
            <Text style={styles.lookupSubtitle}>Check a domain, IP, URL, hash or email</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#9fb0c7" />
        </Pressable>

        {errorMessage ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color="#58d68d" />
            <Text style={styles.loadingText}>Loading threats</Text>
          </View>
        ) : (
          <FlatList
            contentContainerStyle={styles.listContent}
            data={threats}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl
                onRefresh={() => void loadThreats(true)}
                refreshing={isRefreshing}
                tintColor="#58d68d"
              />
            }
            renderItem={({ item }) => (
              <ThreatCard onPress={() => onSelectThreat(item)} threat={item} />
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

function ThreatCard({ onPress, threat }: { onPress: () => void; threat: Threat }) {
  const severityColor = severityColors[threat.severity] ?? "#9fb0c7";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed ? styles.cardPressed : null]}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.severityDot, { backgroundColor: severityColor }]} />
        <Text style={[styles.severityText, { color: severityColor }]}>{threat.severity}</Text>
      </View>

      <Text style={styles.cardTitle}>{threat.title}</Text>
      <Text style={styles.cardSummary}>{threat.summary}</Text>

      <View style={styles.cardFooter}>
        <Text style={styles.metaText}>{threat.confidence_score}% confidence</Text>
        <Text style={styles.metaText}>{threat.tags.slice(0, 2).join(" / ")}</Text>
        <Ionicons name="chevron-forward" size={16} color="#9fb0c7" />
      </View>
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
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
  },
  statBox: {
    backgroundColor: "#0d1b2d",
    borderColor: "#263a55",
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    padding: 14,
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
  lookupButton: {
    alignItems: "center",
    backgroundColor: "#0d1b2d",
    borderColor: "#263a55",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
    padding: 12,
  },
  lookupButtonPressed: {
    opacity: 0.82,
  },
  lookupIcon: {
    alignItems: "center",
    backgroundColor: "#58d68d",
    borderRadius: 8,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  lookupTextBlock: {
    flex: 1,
  },
  lookupTitle: {
    color: "#f7fbff",
    fontSize: 15,
    fontWeight: "900",
  },
  lookupSubtitle: {
    color: "#9fb0c7",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
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
  loadingBox: {
    alignItems: "center",
    flex: 1,
    gap: 12,
    justifyContent: "center",
  },
  loadingText: {
    color: "#9fb0c7",
  },
  listContent: {
    gap: 12,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: "#0d1b2d",
    borderColor: "#263a55",
    borderRadius: 8,
    borderWidth: 1,
    padding: 14,
  },
  cardPressed: {
    opacity: 0.82,
  },
  cardHeader: {
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
  cardTitle: {
    color: "#f7fbff",
    fontSize: 17,
    fontWeight: "800",
    lineHeight: 23,
  },
  cardSummary: {
    color: "#b7c4d6",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  cardFooter: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 12,
  },
  metaText: {
    color: "#9fb0c7",
    fontSize: 12,
  },
});
