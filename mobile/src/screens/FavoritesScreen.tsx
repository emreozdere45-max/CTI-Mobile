import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
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

import { listFavorites } from "../api/favorites";
import { MainTabBar, type MainTab } from "../components/MainTabBar";
import type { AuthSession, Favorite, Threat } from "../types/api";

type FavoritesScreenProps = {
  session: AuthSession;
  activeTab: MainTab;
  onBack: () => void;
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

export function FavoritesScreen({
  activeTab,
  session,
  onBack,
  onSelectTab,
  onSelectThreat,
}: FavoritesScreenProps) {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function loadFavorites(isRefresh = false) {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setErrorMessage(null);

    try {
      const result = await listFavorites(session.accessToken);
      setFavorites(result.data);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Favorites could not be loaded.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    void loadFavorites();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={onBack} style={styles.iconButton}>
            <Ionicons name="arrow-back" size={22} color="#111827" />
          </Pressable>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>Saved intelligence</Text>
            <Text style={styles.title}>Favorites</Text>
          </View>
          <View style={styles.iconButtonPlaceholder} />
        </View>

        {errorMessage ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color="#111827" />
            <Text style={styles.loadingText}>Loading favorites</Text>
          </View>
        ) : (
          <FlatList
            ListEmptyComponent={<EmptyState />}
            contentContainerStyle={styles.listContent}
            data={favorites}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl
                onRefresh={() => void loadFavorites(true)}
                refreshing={isRefreshing}
                tintColor="#111827"
              />
            }
            renderItem={({ item }) => (
              <FavoriteCard favorite={item} onSelectThreat={onSelectThreat} />
            )}
          />
        )}

        <MainTabBar activeTab={activeTab} onSelectTab={onSelectTab} />
      </View>
    </SafeAreaView>
  );
}

function toThreat(favorite: Favorite): Threat {
  return {
    id: favorite.target_id,
    title: typeof favorite.target.title === "string" ? favorite.target.title : "Untitled threat",
    summary: typeof favorite.target.summary === "string" ? favorite.target.summary : "",
    severity: typeof favorite.target.severity === "string" ? favorite.target.severity : "info",
    confidence_score:
      typeof favorite.target.confidence_score === "number" ? favorite.target.confidence_score : 0,
    source: undefined,
    tags: [],
    published_at: favorite.created_at,
    is_favorite: true,
  };
}

function FavoriteCard({
  favorite,
  onSelectThreat,
}: {
  favorite: Favorite;
  onSelectThreat: (threat: Threat) => void;
}) {
  const isThreat = favorite.target_type === "threat";
  const threat = isThreat ? toThreat(favorite) : null;
  const severityColor = threat ? severityColors[threat.severity] ?? "#64748b" : "#111827";
  const iocType = typeof favorite.target.type === "string" ? favorite.target.type : "ioc";
  const iocValue = typeof favorite.target.value === "string" ? favorite.target.value : favorite.target_id;
  const iocRiskScore =
    typeof favorite.target.risk_score === "number" ? favorite.target.risk_score : 0;

  return (
    <Pressable
      disabled={!isThreat}
      onPress={() => {
        if (threat) {
          onSelectThreat(threat);
        }
      }}
      style={({ pressed }) => [styles.card, pressed ? styles.cardPressed : null]}
    >
      <View style={styles.cardHeader}>
        <Ionicons name="star" size={17} color="#111827" />
        <Text style={[styles.severityText, { color: severityColor }]}>
          {threat ? threat.severity : iocType}
        </Text>
      </View>
      <Text style={styles.cardTitle}>{threat ? threat.title : iocValue}</Text>
      <Text style={styles.cardSummary}>
        {threat ? threat.summary : `Risk score: ${iocRiskScore}`}
      </Text>
      <View style={styles.cardFooter}>
        <Text style={styles.metaText}>{threat ? "Saved threat" : "Saved IOC"}</Text>
        {threat ? <Ionicons name="chevron-forward" size={16} color="#6b7280" /> : null}
      </View>
    </Pressable>
  );
}

function EmptyState() {
  return (
    <View style={styles.emptyBox}>
      <Ionicons name="star-outline" size={30} color="#6b7280" />
      <Text style={styles.emptyTitle}>No favorites yet</Text>
      <Text style={styles.emptyText}>Open a threat or IOC result and tap the star button.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f3f6fa",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerText: {
    alignItems: "center",
  },
  eyebrow: {
    color: "#6b7280",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  title: {
    color: "#111827",
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: 0,
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#dbe3ee",
    borderRadius: 8,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  iconButtonPlaceholder: {
    height: 44,
    width: 44,
  },
  errorBox: {
    backgroundColor: "#fee2e2",
    borderColor: "#fecaca",
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 14,
    padding: 12,
  },
  errorText: {
    color: "#991b1b",
  },
  loadingBox: {
    alignItems: "center",
    flex: 1,
    gap: 12,
    justifyContent: "center",
  },
  loadingText: {
    color: "#6b7280",
  },
  listContent: {
    gap: 12,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: "#ffffff",
    borderColor: "#dbe3ee",
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
  severityText: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  cardTitle: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 24,
  },
  cardSummary: {
    color: "#4b5563",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  cardFooter: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  metaText: {
    color: "#6b7280",
    fontSize: 12,
  },
  emptyBox: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#dbe3ee",
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 24,
  },
  emptyTitle: {
    color: "#111827",
    fontSize: 17,
    fontWeight: "800",
  },
  emptyText: {
    color: "#6b7280",
    fontSize: 14,
    textAlign: "center",
  },
});
