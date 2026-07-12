import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { createFavorite, deleteFavorite, listFavorites } from "../api/favorites";
import { getThreatDetail } from "../api/threats";
import type { AuthSession, Threat, ThreatDetail } from "../types/api";

type ThreatDetailScreenProps = {
  session: AuthSession;
  threat: Threat;
  onBack: () => void;
};

const severityColors: Record<string, string> = {
  critical: "#ff6b6b",
  high: "#ffb020",
  medium: "#58a6ff",
  low: "#58d68d",
  info: "#9fb0c7",
};

export function ThreatDetailScreen({ session, threat, onBack }: ThreatDetailScreenProps) {
  const [detail, setDetail] = useState<ThreatDetail | null>(null);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [favoriteMessage, setFavoriteMessage] = useState<string | null>(null);

  const severityColor = severityColors[(detail ?? threat).severity] ?? "#9fb0c7";

  async function loadDetail() {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await getThreatDetail(session.accessToken, threat.id);
      setDetail(result.data);
      const favoriteResult = await listFavorites(session.accessToken, "threat");
      const currentFavorite = favoriteResult.data.find((favorite) => favorite.target_id === threat.id);
      setFavoriteId(currentFavorite?.id ?? null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Threat detail could not be loaded.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadDetail();
  }, [threat.id]);

  async function handleFavoritePress() {
    setIsFavoriteLoading(true);
    setFavoriteMessage(null);
    setErrorMessage(null);

    try {
      if (favoriteId) {
        await deleteFavorite(session.accessToken, favoriteId);
        setFavoriteId(null);
        setFavoriteMessage("Favoriden cikarildi.");
      } else {
        const result = await createFavorite(session.accessToken, "threat", threat.id);
        setFavoriteId(result.data.id);
        setFavoriteMessage("Favorilere eklendi.");
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Favorite action failed.");
    } finally {
      setIsFavoriteLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={onBack} style={styles.iconButton}>
            <Ionicons name="arrow-back" size={22} color="#d7e2f0" />
          </Pressable>
          <Text style={styles.headerTitle}>Threat detail</Text>
          <Pressable
            disabled={isFavoriteLoading || isLoading}
            onPress={handleFavoritePress}
            style={({ pressed }) => [
              styles.iconButton,
              favoriteId ? styles.favoriteButtonActive : null,
              pressed && !isFavoriteLoading ? styles.iconButtonPressed : null,
            ]}
          >
            {isFavoriteLoading ? (
              <ActivityIndicator color="#06111f" size="small" />
            ) : (
              <Ionicons
                name={favoriteId ? "star" : "star-outline"}
                size={22}
                color={favoriteId ? "#06111f" : "#d7e2f0"}
              />
            )}
          </Pressable>
        </View>

        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color="#58d68d" />
            <Text style={styles.loadingText}>Loading detail</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.content}>
            {errorMessage ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {favoriteMessage ? (
              <View style={styles.successBox}>
                <Text style={styles.successText}>{favoriteMessage}</Text>
              </View>
            ) : null}

            <View style={styles.summaryPanel}>
              <View style={styles.severityRow}>
                <View style={[styles.severityDot, { backgroundColor: severityColor }]} />
                <Text style={[styles.severityText, { color: severityColor }]}>
                  {(detail ?? threat).severity}
                </Text>
              </View>

              <Text style={styles.title}>{(detail ?? threat).title}</Text>
              <Text style={styles.summary}>{(detail ?? threat).summary}</Text>

              <View style={styles.metricsRow}>
                <Metric label="Confidence" value={`${(detail ?? threat).confidence_score}%`} />
                <Metric label="Source" value={(detail ?? threat).source?.name ?? "Unknown"} />
              </View>
            </View>

            {detail ? (
              <>
                <Section title="Description">
                  <Text style={styles.bodyText}>{detail.description}</Text>
                </Section>

                <Section title="Tags">
                  <View style={styles.tagRow}>
                    {detail.tags.map((tag) => (
                      <Text key={tag} style={styles.tag}>
                        {tag}
                      </Text>
                    ))}
                  </View>
                </Section>

                <Section title="Related IOCs">
                  {detail.iocs.length ? (
                    detail.iocs.map((ioc) => (
                      <View key={ioc.id} style={styles.iocRow}>
                        <View>
                          <Text style={styles.iocType}>{ioc.type}</Text>
                          <Text style={styles.iocValue}>{ioc.value}</Text>
                        </View>
                        <Text style={styles.riskScore}>{ioc.risk_score}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.mutedText}>No related IOC yet.</Text>
                  )}
                </Section>

                <Section title="Recommended Actions">
                  {detail.recommended_actions.map((action) => (
                    <View key={action} style={styles.actionRow}>
                      <Ionicons name="checkmark-circle-outline" size={18} color="#58d68d" />
                      <Text style={styles.actionText}>{action}</Text>
                    </View>
                  ))}
                </Section>
              </>
            ) : null}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricBox}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function Section({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
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
  headerTitle: {
    color: "#f7fbff",
    fontSize: 17,
    fontWeight: "800",
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
  iconButtonPressed: {
    opacity: 0.82,
  },
  favoriteButtonActive: {
    backgroundColor: "#58d68d",
    borderColor: "#58d68d",
  },
  iconButtonPlaceholder: {
    height: 44,
    width: 44,
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
  content: {
    gap: 12,
    paddingBottom: 28,
  },
  errorBox: {
    backgroundColor: "#3b1620",
    borderColor: "#8e2f45",
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
  },
  errorText: {
    color: "#ffd9df",
  },
  successBox: {
    backgroundColor: "#123222",
    borderColor: "#2f8756",
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
  },
  successText: {
    color: "#d7ffe7",
  },
  summaryPanel: {
    backgroundColor: "#0d1b2d",
    borderColor: "#263a55",
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
  },
  severityRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
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
  title: {
    color: "#f7fbff",
    fontSize: 23,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 30,
  },
  summary: {
    color: "#b7c4d6",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
  },
  metricsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  metricBox: {
    backgroundColor: "#06111f",
    borderColor: "#263a55",
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    padding: 12,
  },
  metricValue: {
    color: "#f7fbff",
    fontSize: 17,
    fontWeight: "800",
  },
  metricLabel: {
    color: "#9fb0c7",
    fontSize: 12,
    marginTop: 2,
  },
  section: {
    backgroundColor: "#0d1b2d",
    borderColor: "#263a55",
    borderRadius: 8,
    borderWidth: 1,
    padding: 14,
  },
  sectionTitle: {
    color: "#f7fbff",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 10,
  },
  bodyText: {
    color: "#b7c4d6",
    fontSize: 14,
    lineHeight: 21,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    backgroundColor: "#17324f",
    borderColor: "#2e5f8f",
    borderRadius: 8,
    borderWidth: 1,
    color: "#d7e2f0",
    fontSize: 12,
    fontWeight: "700",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  iocRow: {
    alignItems: "center",
    borderBottomColor: "#263a55",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  iocType: {
    color: "#58d68d",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  iocValue: {
    color: "#f7fbff",
    fontSize: 14,
    marginTop: 2,
  },
  riskScore: {
    color: "#ffb020",
    fontSize: 18,
    fontWeight: "800",
  },
  mutedText: {
    color: "#9fb0c7",
  },
  actionRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 8,
    marginBottom: 9,
  },
  actionText: {
    color: "#b7c4d6",
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});
