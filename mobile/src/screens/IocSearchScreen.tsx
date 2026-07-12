import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
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

import { searchIocs } from "../api/iocs";
import type { AuthSession, IocSearchData, IocSearchResult } from "../types/api";

type IocSearchScreenProps = {
  session: AuthSession;
  onBack: () => void;
};

const riskColors = {
  high: "#ff6b6b",
  medium: "#ffb020",
  low: "#58d68d",
};

const typeOptions = ["auto", "domain", "ip", "url", "hash", "email"];

export function IocSearchScreen({ session, onBack }: IocSearchScreenProps) {
  const [query, setQuery] = useState("malicious-example.com");
  const [selectedType, setSelectedType] = useState("auto");
  const [result, setResult] = useState<IocSearchData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSearch() {
    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 2) {
      setErrorMessage("En az 2 karakterlik bir IOC değeri yazmalısın.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await searchIocs(
        session.accessToken,
        trimmedQuery,
        selectedType === "auto" ? undefined : selectedType,
      );
      setResult(response.data);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "IOC search could not be completed.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={onBack} style={styles.iconButton}>
            <Ionicons name="arrow-back" size={22} color="#d7e2f0" />
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
            <Ionicons name="search-outline" size={19} color="#9fb0c7" />
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={setQuery}
              onSubmitEditing={() => void handleSearch()}
              placeholder="domain, IP, URL, hash or email"
              placeholderTextColor="#6f8097"
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
              <ActivityIndicator color="#06111f" size="small" />
            ) : (
              <Ionicons name="shield-checkmark-outline" size={18} color="#06111f" />
            )}
            <Text style={styles.searchButtonText}>Search IOC</Text>
          </Pressable>
        </View>

        {errorMessage ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
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
          renderItem={({ item }) => <IocResultCard result={item} />}
        />
      </View>
    </SafeAreaView>
  );
}

function IocResultCard({ result }: { result: IocSearchResult }) {
  const riskLevel = result.risk_score >= 80 ? "high" : result.risk_score >= 50 ? "medium" : "low";
  const riskColor = riskColors[riskLevel];

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.riskDot, { backgroundColor: riskColor }]} />
        <Text style={[styles.riskText, { color: riskColor }]}>{riskLevel} risk</Text>
        <Text style={styles.typeBadge}>{result.type}</Text>
      </View>

      <Text selectable style={styles.iocValue}>
        {result.value}
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
    </View>
  );
}

function EmptyState({ hasSearched }: { hasSearched: boolean }) {
  return (
    <View style={styles.emptyBox}>
      <Ionicons name="search-outline" size={30} color="#9fb0c7" />
      <Text style={styles.emptyTitle}>{hasSearched ? "No IOC found" : "Ready to search"}</Text>
      <Text style={styles.emptyText}>
        {hasSearched
          ? "Bu IOC veritabaninda eslesmedi."
          : "Bir domain, IP, URL, hash veya e-posta girerek arama yap."}
      </Text>
    </View>
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
    color: "#58d68d",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  title: {
    color: "#f7fbff",
    fontSize: 25,
    fontWeight: "800",
    letterSpacing: 0,
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: "#0d1b2d",
    borderColor: "#263a55",
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
    backgroundColor: "#0d1b2d",
    borderColor: "#263a55",
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    padding: 14,
  },
  inputLabel: {
    color: "#9fb0c7",
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  inputRow: {
    alignItems: "center",
    backgroundColor: "#06111f",
    borderColor: "#263a55",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
  },
  input: {
    color: "#f7fbff",
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
    backgroundColor: "#13243a",
    borderColor: "#263a55",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  typeChipActive: {
    backgroundColor: "#58d68d",
    borderColor: "#58d68d",
  },
  typeChipText: {
    color: "#d7e2f0",
    fontSize: 12,
    fontWeight: "800",
  },
  typeChipTextActive: {
    color: "#06111f",
  },
  searchButton: {
    alignItems: "center",
    backgroundColor: "#58d68d",
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
    color: "#06111f",
    fontSize: 15,
    fontWeight: "900",
  },
  errorBox: {
    backgroundColor: "#3b1620",
    borderColor: "#8e2f45",
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    padding: 12,
  },
  errorText: {
    color: "#ffd9df",
  },
  resultMeta: {
    backgroundColor: "#0d1b2d",
    borderColor: "#263a55",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 12,
    padding: 12,
  },
  resultMetaText: {
    color: "#9fb0c7",
    fontSize: 12,
    fontWeight: "700",
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
  cardHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
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
    backgroundColor: "#13243a",
    borderRadius: 6,
    color: "#d7e2f0",
    fontSize: 12,
    fontWeight: "800",
    marginLeft: "auto",
    paddingHorizontal: 8,
    paddingVertical: 4,
    textTransform: "uppercase",
  },
  iocValue: {
    color: "#f7fbff",
    fontSize: 17,
    fontWeight: "800",
    lineHeight: 23,
  },
  scoreGrid: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  scoreBox: {
    backgroundColor: "#06111f",
    borderColor: "#263a55",
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    padding: 10,
  },
  scoreValue: {
    color: "#f7fbff",
    fontSize: 20,
    fontWeight: "900",
  },
  scoreLabel: {
    color: "#9fb0c7",
    fontSize: 11,
    marginTop: 2,
  },
  emptyBox: {
    alignItems: "center",
    backgroundColor: "#0d1b2d",
    borderColor: "#263a55",
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 24,
  },
  emptyTitle: {
    color: "#f7fbff",
    fontSize: 17,
    fontWeight: "800",
  },
  emptyText: {
    color: "#9fb0c7",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
});
