import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { createFavorite, deleteFavorite, listFavorites } from "../api/favorites";
import { searchIocs } from "../api/iocs";
import { MainTabBar, type MainTab } from "../components/MainTabBar";
import type { AuthSession, IocSearchData, IocSearchResult, Threat } from "../types/api";

type IocSearchScreenProps = {
  session: AuthSession;
  activeTab: MainTab;
  initialState: IocSearchScreenState | null;
  onBack: () => void;
  onSelectTab: (tab: MainTab) => void;
  onSelectThreat: (threat: Threat) => void;
  onStateChange: (state: IocSearchScreenState) => void;
};

export type IocSearchScreenState = {
  autoSearch?: boolean;
  favoriteIdsByIocId: Record<string, string>;
  query: string;
  result: IocSearchData | null;
  selectedType: string;
};

const riskColors = {
  high: "#dc2626",
  medium: "#ea580c",
  low: "#16a34a",
};

const typeOptions = ["auto", "domain", "ip", "url", "hash", "email"];

export function IocSearchScreen({
  activeTab,
  session,
  initialState,
  onBack,
  onSelectTab,
  onSelectThreat,
  onStateChange,
}: IocSearchScreenProps) {
  const [query, setQuery] = useState(initialState?.query ?? "malicious-example.com");
  const [selectedType, setSelectedType] = useState(initialState?.selectedType ?? "auto");
  const [result, setResult] = useState<IocSearchData | null>(initialState?.result ?? null);
  const [favoriteIdsByIocId, setFavoriteIdsByIocId] = useState<Record<string, string>>(
    initialState?.favoriteIdsByIocId ?? {},
  );
  const [isLoading, setIsLoading] = useState(false);
  const [updatingFavoriteId, setUpdatingFavoriteId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    onStateChange({
      favoriteIdsByIocId,
      query,
      result,
      selectedType,
    });
  }, [favoriteIdsByIocId, onStateChange, query, result, selectedType]);

  useEffect(() => {
    if (initialState?.autoSearch) {
      void handleSearch();
    }
  }, []);

  async function handleSearch() {
    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 2) {
      setErrorMessage("Enter at least 2 characters.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await searchIocs(
        session.accessToken,
        trimmedQuery,
        selectedType === "auto" ? undefined : selectedType,
      );
      const favorites = await listFavorites(session.accessToken, "ioc");
      const nextFavoriteMap = favorites.data.reduce<Record<string, string>>(
        (accumulator, favorite) => {
          accumulator[favorite.target_id] = favorite.id;
          return accumulator;
        },
        {},
      );

      setResult(response.data);
      setFavoriteIdsByIocId(nextFavoriteMap);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "IOC search could not be completed.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleToggleFavorite(ioc: IocSearchResult) {
    setUpdatingFavoriteId(ioc.id);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const favoriteId = favoriteIdsByIocId[ioc.id];
      if (favoriteId) {
        await deleteFavorite(session.accessToken, favoriteId);
        setFavoriteIdsByIocId((current) => {
          const next = { ...current };
          delete next[ioc.id];
          return next;
        });
        setSuccessMessage("IOC removed from favorites.");
      } else {
        const response = await createFavorite(session.accessToken, "ioc", ioc.id);
        setFavoriteIdsByIocId((current) => ({
          ...current,
          [ioc.id]: response.data.id,
        }));
        setSuccessMessage("IOC saved to favorites.");
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Favorite action failed.");
    } finally {
      setUpdatingFavoriteId(null);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={onBack} style={styles.iconButton}>
            <Ionicons name="arrow-back" size={22} color="#111827" />
          </Pressable>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>Indicator lookup</Text>
            <Text style={styles.title}>IOC Search</Text>
          </View>
          <View style={styles.iconButtonPlaceholder} />
        </View>

        <View style={styles.searchPanel}>
          <Text style={styles.inputLabel}>IOC value</Text>
          <View style={styles.inputRow}>
            <Ionicons name="search-outline" size={19} color="#6b7280" />
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={setQuery}
              onSubmitEditing={() => void handleSearch()}
              placeholder="domain, IP, URL, hash or email"
              placeholderTextColor="#9ca3af"
              returnKeyType="search"
              style={styles.input}
              value={query}
            />
          </View>

          <View style={styles.typeRow}>
            {typeOptions.map((option) => (
              <Pressable
                key={option}
                onPress={() => setSelectedType(option)}
                style={[
                  styles.typeChip,
                  selectedType === option ? styles.typeChipActive : null,
                ]}
              >
                <Text
                  style={[
                    styles.typeChipText,
                    selectedType === option ? styles.typeChipTextActive : null,
                  ]}
                >
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            disabled={isLoading}
            onPress={() => void handleSearch()}
            style={({ pressed }) => [
              styles.searchButton,
              pressed || isLoading ? styles.searchButtonPressed : null,
            ]}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Ionicons name="shield-checkmark-outline" size={18} color="#ffffff" />
            )}
            <Text style={styles.searchButtonText}>Search IOC</Text>
          </Pressable>
        </View>

        {errorMessage ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {successMessage ? (
          <View style={styles.successBox}>
            <Text style={styles.successText}>{successMessage}</Text>
          </View>
        ) : null}

        {result ? (
          <View style={styles.resultMeta}>
            <Text style={styles.resultMetaText}>Query: {result.query}</Text>
            <Text style={styles.resultMetaText}>Detected: {result.detected_type}</Text>
          </View>
        ) : null}

        <FlatList
          ListEmptyComponent={<EmptyState hasSearched={Boolean(result)} />}
          contentContainerStyle={styles.listContent}
          data={result?.results ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <IocResultCard
              isFavorite={Boolean(favoriteIdsByIocId[item.id])}
              isUpdatingFavorite={updatingFavoriteId === item.id}
              onOpenThreat={() => {
                const firstThreat = item.related_threats?.[0];
                if (firstThreat) {
                  onSelectThreat(firstThreat);
                }
              }}
              onToggleFavorite={() => void handleToggleFavorite(item)}
              result={item}
            />
          )}
        />

        <MainTabBar activeTab={activeTab} onSelectTab={onSelectTab} />
      </View>
    </SafeAreaView>
  );
}

function IocResultCard({
  isFavorite,
  isUpdatingFavorite,
  onOpenThreat,
  onToggleFavorite,
  result,
}: {
  isFavorite: boolean;
  isUpdatingFavorite: boolean;
  onOpenThreat: () => void;
  onToggleFavorite: () => void;
  result: IocSearchResult;
}) {
  const riskLevel = result.risk_score >= 80 ? "high" : result.risk_score >= 50 ? "medium" : "low";
  const riskColor = riskColors[riskLevel];
  const hasRelatedThreat = Boolean(result.related_threats?.length);

  return (
    <View
      style={[
        styles.card,
        isFavorite ? styles.cardFavorite : null,
        !hasRelatedThreat ? styles.cardDisabled : null,
      ]}
    >
      <View style={styles.cardHeader}>
        <Pressable
          disabled={!hasRelatedThreat}
          onPress={onOpenThreat}
          style={({ pressed }) => [styles.cardHeaderMain, pressed ? styles.cardPressed : null]}
        >
          <View style={[styles.riskDot, { backgroundColor: riskColor }]} />
          <Text style={[styles.riskText, { color: riskColor }]}>{riskLevel} risk</Text>
          <Text style={styles.typeBadge}>{result.type}</Text>
        </Pressable>
        <Pressable
          disabled={isUpdatingFavorite}
          onPress={onToggleFavorite}
          style={({ pressed }) => [
            styles.favoriteIconButton,
            isFavorite ? styles.favoriteIconButtonActive : null,
            pressed && !isUpdatingFavorite ? styles.favoriteIconButtonPressed : null,
          ]}
        >
          {isUpdatingFavorite ? (
            <ActivityIndicator color={isFavorite ? "#ffffff" : "#111827"} size="small" />
          ) : (
            <Ionicons
              name={isFavorite ? "star" : "star-outline"}
              size={18}
              color={isFavorite ? "#ffffff" : "#111827"}
            />
          )}
        </Pressable>
      </View>

      <Pressable
        disabled={!hasRelatedThreat}
        onPress={onOpenThreat}
        style={({ pressed }) => (pressed ? styles.cardPressed : null)}
      >
        <Text selectable style={styles.iocValue}>
          {result.value}
        </Text>

        <Text style={[styles.favoriteHint, isFavorite ? styles.favoriteHintActive : null]}>
          {hasRelatedThreat ? "Tap card to open related threat" : "No related threat to open"}
        </Text>

        <View style={styles.scoreGrid}>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreValue}>{result.risk_score}</Text>
            <Text style={styles.scoreLabel}>Risk</Text>
          </View>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreValue}>{result.confidence_score}</Text>
            <Text style={styles.scoreLabel}>Confidence</Text>
          </View>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreValue}>{result.related_threat_count}</Text>
            <Text style={styles.scoreLabel}>Threats</Text>
          </View>
        </View>
      </Pressable>
    </View>
  );
}

function EmptyState({ hasSearched }: { hasSearched: boolean }) {
  return (
    <View style={styles.emptyBox}>
      <Ionicons name="search-outline" size={30} color="#6b7280" />
      <Text style={styles.emptyTitle}>{hasSearched ? "No IOC found" : "Ready to search"}</Text>
      <Text style={styles.emptyText}>
        {hasSearched
          ? "This IOC was not found in the database."
          : "Enter a domain, IP, URL, hash, or email to search."}
      </Text>
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
    marginBottom: 14,
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
    fontSize: 25,
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
    width: 44,
  },
  searchPanel: {
    backgroundColor: "#ffffff",
    borderColor: "#dbe3ee",
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    padding: 14,
  },
  inputLabel: {
    color: "#6b7280",
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  inputRow: {
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderColor: "#dbe3ee",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
  },
  input: {
    color: "#111827",
    flex: 1,
    fontSize: 15,
    minHeight: 46,
  },
  typeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  typeChip: {
    backgroundColor: "#ffffff",
    borderColor: "#dbe3ee",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  typeChipActive: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  typeChipText: {
    color: "#6b7280",
    fontSize: 12,
    fontWeight: "800",
  },
  typeChipTextActive: {
    color: "#ffffff",
  },
  searchButton: {
    alignItems: "center",
    backgroundColor: "#111827",
    borderRadius: 8,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginTop: 14,
    minHeight: 46,
  },
  searchButtonPressed: {
    opacity: 0.82,
  },
  searchButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "900",
  },
  errorBox: {
    backgroundColor: "#fee2e2",
    borderColor: "#fecaca",
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    padding: 12,
  },
  errorText: {
    color: "#991b1b",
  },
  successBox: {
    backgroundColor: "#dcfce7",
    borderColor: "#bbf7d0",
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    padding: 12,
  },
  successText: {
    color: "#166534",
  },
  resultMeta: {
    backgroundColor: "#ffffff",
    borderColor: "#dbe3ee",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 12,
    padding: 12,
  },
  resultMetaText: {
    color: "#6b7280",
    fontSize: 12,
    fontWeight: "700",
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
  cardFavorite: {
    borderColor: "#111827",
  },
  cardDisabled: {
    opacity: 0.78,
  },
  cardPressed: {
    opacity: 0.82,
  },
  cardHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  cardHeaderMain: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 8,
  },
  riskDot: {
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  riskText: {
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  typeBadge: {
    backgroundColor: "#f3f4f6",
    borderRadius: 6,
    color: "#374151",
    fontSize: 12,
    fontWeight: "800",
    marginLeft: "auto",
    paddingHorizontal: 8,
    paddingVertical: 4,
    textTransform: "uppercase",
  },
  favoriteIconButton: {
    alignItems: "center",
    borderColor: "#111827",
    borderRadius: 8,
    borderWidth: 1,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  favoriteIconButtonActive: {
    backgroundColor: "#111827",
  },
  favoriteIconButtonPressed: {
    opacity: 0.72,
  },
  iocValue: {
    color: "#111827",
    fontSize: 17,
    fontWeight: "800",
    lineHeight: 23,
  },
  favoriteHint: {
    color: "#111827",
    fontSize: 12,
    fontWeight: "900",
    marginTop: 12,
  },
  favoriteHintActive: {
    color: "#111827",
  },
  scoreGrid: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  scoreBox: {
    backgroundColor: "#f8fafc",
    borderColor: "#dbe3ee",
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    padding: 10,
  },
  scoreValue: {
    color: "#111827",
    fontSize: 20,
    fontWeight: "900",
  },
  scoreLabel: {
    color: "#6b7280",
    fontSize: 11,
    marginTop: 2,
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
    lineHeight: 20,
    textAlign: "center",
  },
});
