import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { listFavorites } from "../api/favorites";
import type { MainTab } from "../components/MainTabBar";
import { MainTabBar } from "../components/MainTabBar";
import type { AuthSession, Favorite, Threat } from "../types/api";

type AccountScreenProps = {
  session: AuthSession;
  onBack: () => void;
  onLogout: () => void;
  onSelectTab: (tab: MainTab) => void;
  onSelectThreat: (threat: Threat) => void;
};

type SettingItem = {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  key: SettingKey;
  status: string;
  subtitle: string;
  title: string;
};

type ProfileTab = "saved" | "liked";
type SettingKey = "personal" | "security" | "notifications" | "sources" | "export" | "about";

const settings: SettingItem[] = [
  {
    icon: "person-circle-outline",
    key: "personal",
    status: "Ready",
    title: "Personal information",
    subtitle: "Name, email, analyst role and workspace identity",
  },
  {
    icon: "shield-checkmark-outline",
    key: "security",
    status: "Protected",
    title: "Login & security",
    subtitle: "Password, active session and token-based access",
  },
  {
    icon: "notifications-outline",
    key: "notifications",
    status: "On",
    title: "Notifications",
    subtitle: "Critical threats, IOC alerts and analyst reminders",
  },
  {
    icon: "server-outline",
    key: "sources",
    status: "Live",
    title: "Data sources",
    subtitle: "CISA KEV, vendor feeds and free CTI news sources",
  },
  {
    icon: "document-text-outline",
    key: "export",
    status: "Available",
    title: "Export & reports",
    subtitle: "Analyst summaries and source links for sharing",
  },
  {
    icon: "information-circle-outline",
    key: "about",
    status: "v0.1",
    title: "About CTI-Mobile",
    subtitle: "Project version, documentation and support notes",
  },
];

const severityColors: Record<string, string> = {
  critical: "#dc2626",
  high: "#ea580c",
  medium: "#2563eb",
  low: "#16a34a",
  info: "#64748b",
};

export function AccountScreen({
  session,
  onBack,
  onLogout,
  onSelectTab,
  onSelectThreat,
}: AccountScreenProps) {
  const [activeProfileTab, setActiveProfileTab] = useState<ProfileTab>("saved");
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mode, setMode] = useState<"profile" | "settings">("profile");
  const [selectedSetting, setSelectedSetting] = useState<SettingItem | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const initials = session.user.full_name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const roleLabel = session.user.roles.join(", ") || "cti_analyst";
  const savedThreatCount = favorites.filter((item) => item.target_type === "threat").length;
  const savedIocCount = favorites.filter((item) => item.target_type === "ioc").length;

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
      setErrorMessage(error instanceof Error ? error.message : "Saved items could not be loaded.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    void loadFavorites();
  }, []);

  if (mode === "settings") {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.topRow}>
              <Pressable
                onPress={() => {
                  if (selectedSetting) {
                    setSelectedSetting(null);
                  } else {
                    setMode("profile");
                  }
                }}
                style={styles.iconButton}
              >
                <Ionicons name="arrow-back" size={22} color="#111827" />
              </Pressable>
              <Text style={styles.topTitle}>{selectedSetting ? selectedSetting.title : "Settings"}</Text>
              <View style={styles.iconButtonPlaceholder} />
            </View>

            {selectedSetting ? (
              <SettingDetail item={selectedSetting} session={session} />
            ) : (
              <>
                <Text style={styles.settingsTitle}>Settings</Text>

                <View style={styles.settingsList}>
                  {settings.map((item) => (
                    <SettingsRow
                      icon={item.icon}
                      key={item.title}
                      onPress={() => setSelectedSetting(item)}
                      status={item.status}
                      subtitle={item.subtitle}
                      title={item.title}
                    />
                  ))}
                </View>

                <View style={styles.securityNote}>
                  <Ionicons name="lock-closed-outline" size={22} color="#111827" />
                  <View style={styles.securityText}>
                    <Text style={styles.securityTitle}>Security note</Text>
                    <Text style={styles.securitySubtitle}>
                      API tokens and secrets stay outside GitHub. Runtime values should continue to live in local .env files.
                    </Text>
                  </View>
                </View>

                <Pressable
                  onPress={onLogout}
                  style={({ pressed }) => [styles.logoutRow, pressed ? styles.pressed : null]}
                >
                  <Ionicons name="log-out-outline" size={26} color="#991b1b" />
                  <View style={styles.settingText}>
                    <Text style={styles.logoutTitle}>Sign out</Text>
                    <Text style={styles.settingSubtitle}>Return to the login screen</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#991b1b" />
                </Pressable>
              </>
            )}
          </ScrollView>

          <MainTabBar activeTab="account" onSelectTab={onSelectTab} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.profileHeader}>
          <Pressable onPress={onBack} style={styles.iconButton}>
            <Ionicons name="arrow-back" size={22} color="#111827" />
          </Pressable>
          <Text style={styles.topTitle}>Account</Text>
          <Pressable onPress={() => setMode("settings")} style={styles.iconButton}>
            <Ionicons name="menu-outline" size={25} color="#111827" />
          </Pressable>
        </View>

        <FlatList
          ListHeaderComponent={
            <>
              <View style={styles.profileHero}>
                <View style={styles.largeAvatar}>
                  <Text style={styles.largeAvatarText}>{initials || "CT"}</Text>
                </View>
                <Text style={styles.profileName}>{session.user.full_name}</Text>
                <Text style={styles.profileEmail}>{session.user.email}</Text>
                <View style={styles.rolePill}>
                  <Ionicons name="shield-checkmark" size={14} color="#ffffff" />
                  <Text style={styles.rolePillText}>{roleLabel}</Text>
                </View>
              </View>

              <View style={styles.profileStats}>
                <ProfileStat label="Saved" value={favorites.length} />
                <ProfileStat label="Threats" value={savedThreatCount} />
                <ProfileStat label="IOCs" value={savedIocCount} />
              </View>

              <View style={styles.profileTabs}>
                <ProfileTabButton
                  icon="bookmark"
                  isActive={activeProfileTab === "saved"}
                  label="Saved"
                  onPress={() => setActiveProfileTab("saved")}
                />
                <ProfileTabButton
                  icon="heart"
                  isActive={activeProfileTab === "liked"}
                  label="Liked"
                  onPress={() => setActiveProfileTab("liked")}
                />
              </View>

              {errorMessage ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              ) : null}

              {activeProfileTab === "liked" ? (
                <View style={styles.emptyBox}>
                  <Ionicons name="heart-outline" size={30} color="#6b7280" />
                  <Text style={styles.emptyTitle}>No liked threats yet</Text>
                  <Text style={styles.emptyText}>
                    Later we can add a like action separate from saved/bookmarked items.
                  </Text>
                </View>
              ) : null}
            </>
          }
          ListEmptyComponent={
            activeProfileTab === "saved" ? (
              isLoading ? (
                <View style={styles.loadingBox}>
                  <ActivityIndicator color="#111827" />
                  <Text style={styles.loadingText}>Loading saved items</Text>
                </View>
              ) : (
                <View style={styles.emptyBox}>
                  <Ionicons name="bookmark-outline" size={30} color="#6b7280" />
                  <Text style={styles.emptyTitle}>No saved intelligence yet</Text>
                  <Text style={styles.emptyText}>Open a threat or IOC result and tap the save icon.</Text>
                </View>
              )
            ) : null
          }
          contentContainerStyle={styles.profileContent}
          data={activeProfileTab === "saved" ? favorites : []}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              onRefresh={() => void loadFavorites(true)}
              refreshing={isRefreshing}
              tintColor="#111827"
            />
          }
          renderItem={({ item }) => (
            <SavedItemCard favorite={item} onSelectThreat={onSelectThreat} />
          )}
        />

        <MainTabBar activeTab="account" onSelectTab={onSelectTab} />
      </View>
    </SafeAreaView>
  );
}

function ProfileStat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.profileStat}>
      <Text style={styles.profileStatValue}>{value}</Text>
      <Text style={styles.profileStatLabel}>{label}</Text>
    </View>
  );
}

function ProfileTabButton({
  icon,
  isActive,
  label,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  isActive: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.profileTabButton,
        isActive ? styles.profileTabButtonActive : null,
        pressed ? styles.pressed : null,
      ]}
    >
      <Ionicons name={isActive ? icon : `${icon}-outline` as React.ComponentProps<typeof Ionicons>["name"]} size={22} color={isActive ? "#111827" : "#6b7280"} />
      <Text style={[styles.profileTabText, isActive ? styles.profileTabTextActive : null]}>{label}</Text>
    </Pressable>
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

function SavedItemCard({
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
      style={({ pressed }) => [styles.savedCard, pressed ? styles.pressed : null]}
    >
      <View style={styles.savedCardHeader}>
        <Ionicons name={isThreat ? "newspaper-outline" : "finger-print-outline"} size={18} color="#111827" />
        <Text style={[styles.savedCardMeta, { color: severityColor }]}>
          {threat ? threat.severity : iocType}
        </Text>
      </View>
      <Text style={styles.savedCardTitle}>{threat ? threat.title : iocValue}</Text>
      <Text style={styles.savedCardSummary}>
        {threat ? threat.summary : `Saved IOC with risk score ${iocRiskScore}`}
      </Text>
      <View style={styles.savedCardFooter}>
        <Text style={styles.savedCardFooterText}>{threat ? "Saved threat" : "Saved IOC"}</Text>
        {threat ? <Ionicons name="chevron-forward" size={17} color="#6b7280" /> : null}
      </View>
    </Pressable>
  );
}

function SettingDetail({ item, session }: { item: SettingItem; session: AuthSession }) {
  if (item.key === "personal") {
    return <PersonalInformationDetail session={session} />;
  }
  if (item.key === "security") {
    return <LoginSecurityDetail session={session} />;
  }
  if (item.key === "notifications") {
    return (
      <GenericSettingDetail
        icon="notifications-outline"
        title="Notification preferences"
        rows={[
          ["Critical threats", "On"],
          ["High-risk IOC alerts", "On"],
          ["Feed import summaries", "Digest"],
        ]}
        note="Next we can connect these switches to a notification preferences table in PostgreSQL."
      />
    );
  }
  if (item.key === "sources") {
    return (
      <GenericSettingDetail
        icon="server-outline"
        title="Data source controls"
        rows={[
          ["CISA KEV", "Enabled"],
          ["Free vendor feeds", "Enabled"],
          ["Scheduler", "Active"],
        ]}
        note="This area will later let you pause, test, or prioritize feed sources."
      />
    );
  }
  if (item.key === "export") {
    return (
      <GenericSettingDetail
        icon="document-text-outline"
        title="Export & reports"
        rows={[
          ["Threat brief export", "Available"],
          ["Original source links", "Included"],
          ["AI analyst notes", "Included"],
        ]}
        note="Report export exists in threat detail. We can add account-level export history next."
      />
    );
  }
  return (
    <GenericSettingDetail
      icon="information-circle-outline"
      title="About CTI-Mobile"
      rows={[
        ["Version", "0.1.0"],
        ["Mobile runtime", "Expo SDK 54"],
        ["Backend", "FastAPI + PostgreSQL"],
      ]}
      note="CTI-Mobile is currently in active local development."
    />
  );
}

function PersonalInformationDetail({ session }: { session: AuthSession }) {
  const [fullName, setFullName] = useState(session.user.full_name);
  const [email, setEmail] = useState(session.user.email);

  return (
    <View>
      <Text style={styles.detailTitle}>Personal information</Text>
      <Text style={styles.detailSubtitle}>
        Manage the identity shown on your analyst profile.
      </Text>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Full name</Text>
        <TextInput
          onChangeText={setFullName}
          placeholder="Full name"
          placeholderTextColor="#9ca3af"
          style={styles.formInput}
          value={fullName}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Email address</Text>
        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={setEmail}
          placeholder="Email address"
          placeholderTextColor="#9ca3af"
          style={styles.formInput}
          value={email}
        />
      </View>

      <View style={styles.readOnlyCard}>
        <DetailRow label="Role" value={session.user.roles.join(", ") || "cti_analyst"} />
        <DetailRow label="Account ID" value={session.user.id} />
      </View>

      <Pressable style={({ pressed }) => [styles.primaryAction, pressed ? styles.pressed : null]}>
        <Text style={styles.primaryActionText}>Save profile changes</Text>
      </Pressable>

      <Text style={styles.detailNote}>
        The form is ready. The next backend step is adding a protected profile update endpoint.
      </Text>
    </View>
  );
}

function LoginSecurityDetail({ session }: { session: AuthSession }) {
  return (
    <View>
      <Text style={styles.detailTitle}>Login & security</Text>
      <Text style={styles.detailSubtitle}>
        Review your session and prepare password/authentication controls.
      </Text>

      <View style={styles.readOnlyCard}>
        <DetailRow label="Authentication" value="Bearer token" />
        <DetailRow label="Session lifetime" value={`${Math.round(session.expiresIn / 60)} minutes`} />
        <DetailRow label="Account status" value="Active" />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Current password</Text>
        <TextInput
          placeholder="Current password"
          placeholderTextColor="#9ca3af"
          secureTextEntry
          style={styles.formInput}
        />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>New password</Text>
        <TextInput
          placeholder="New password"
          placeholderTextColor="#9ca3af"
          secureTextEntry
          style={styles.formInput}
        />
      </View>

      <Pressable style={({ pressed }) => [styles.primaryAction, pressed ? styles.pressed : null]}>
        <Text style={styles.primaryActionText}>Update password</Text>
      </Pressable>

      <Text style={styles.detailNote}>
        Password update needs a backend endpoint before it can save for real.
      </Text>
    </View>
  );
}

function GenericSettingDetail({
  icon,
  note,
  rows,
  title,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  note: string;
  rows: Array<[string, string]>;
  title: string;
}) {
  return (
    <View>
      <View style={styles.detailHero}>
        <Ionicons name={icon} size={28} color="#111827" />
        <Text style={styles.detailTitle}>{title}</Text>
      </View>
      <View style={styles.readOnlyCard}>
        {rows.map(([label, value]) => (
          <DetailRow key={label} label={label} value={value} />
        ))}
      </View>
      <Text style={styles.detailNote}>{note}</Text>
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailRowLabel}>{label}</Text>
      <Text style={styles.detailRowValue}>{value}</Text>
    </View>
  );
}

function SettingsRow({
  icon,
  onPress,
  status,
  subtitle,
  title,
}: Omit<SettingItem, "key"> & { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.settingRow, pressed ? styles.pressed : null]}>
      <View style={styles.settingIcon}>
        <Ionicons name={icon} size={25} color="#111827" />
      </View>
      <View style={styles.settingText}>
        <View style={styles.settingTitleRow}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingStatus}>{status}</Text>
        </View>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={22} color="#6b7280" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  content: {
    paddingBottom: 24,
    paddingTop: 12,
  },
  profileContent: {
    paddingBottom: 24,
    paddingTop: 12,
  },
  topRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 48,
  },
  profileHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
  },
  topTitle: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "900",
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: "#f3f6fa",
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
  settingsTitle: {
    color: "#171717",
    fontSize: 42,
    fontWeight: "900",
    letterSpacing: 0,
    marginBottom: 24,
    marginTop: 24,
  },
  profileHero: {
    alignItems: "center",
    paddingBottom: 18,
    paddingTop: 16,
  },
  largeAvatar: {
    alignItems: "center",
    backgroundColor: "#111827",
    borderRadius: 999,
    height: 104,
    justifyContent: "center",
    width: 104,
  },
  largeAvatarText: {
    color: "#ffffff",
    fontSize: 34,
    fontWeight: "900",
  },
  profileName: {
    color: "#171717",
    fontSize: 27,
    fontWeight: "900",
    marginTop: 14,
    textAlign: "center",
  },
  profileEmail: {
    color: "#737373",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 3,
    textAlign: "center",
  },
  rolePill: {
    alignItems: "center",
    backgroundColor: "#111827",
    borderRadius: 8,
    flexDirection: "row",
    gap: 6,
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  rolePillText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "900",
  },
  profileStats: {
    borderBottomColor: "#e5e7eb",
    borderBottomWidth: 1,
    borderTopColor: "#e5e7eb",
    borderTopWidth: 1,
    flexDirection: "row",
    marginBottom: 10,
    paddingVertical: 15,
  },
  profileStat: {
    alignItems: "center",
    flex: 1,
  },
  profileStatValue: {
    color: "#111827",
    fontSize: 20,
    fontWeight: "900",
  },
  profileStatLabel: {
    color: "#737373",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 3,
  },
  profileTabs: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  profileTabButton: {
    alignItems: "center",
    borderBottomColor: "transparent",
    borderBottomWidth: 3,
    flex: 1,
    flexDirection: "row",
    gap: 7,
    justifyContent: "center",
    paddingVertical: 12,
  },
  profileTabButtonActive: {
    borderBottomColor: "#111827",
  },
  profileTabText: {
    color: "#6b7280",
    fontSize: 13,
    fontWeight: "900",
  },
  profileTabTextActive: {
    color: "#111827",
  },
  settingsList: {
    borderTopColor: "#e5e7eb",
    borderTopWidth: 1,
  },
  settingRow: {
    alignItems: "center",
    borderBottomColor: "#e5e7eb",
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 14,
    minHeight: 86,
    paddingVertical: 14,
  },
  settingIcon: {
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderColor: "#e5e7eb",
    borderRadius: 8,
    borderWidth: 1,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  settingText: {
    flex: 1,
  },
  settingTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  settingTitle: {
    color: "#171717",
    flex: 1,
    fontSize: 18,
    fontWeight: "900",
  },
  settingStatus: {
    backgroundColor: "#eef2f7",
    borderRadius: 6,
    color: "#334155",
    fontSize: 11,
    fontWeight: "900",
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  settingSubtitle: {
    color: "#737373",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 3,
  },
  securityNote: {
    alignItems: "flex-start",
    backgroundColor: "#f8fafc",
    borderColor: "#dbe3ee",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    marginTop: 18,
    padding: 14,
  },
  securityText: {
    flex: 1,
  },
  securityTitle: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "900",
  },
  securitySubtitle: {
    color: "#4b5563",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 3,
  },
  detailHero: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
    marginTop: 24,
  },
  detailTitle: {
    color: "#171717",
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: 0,
    marginBottom: 8,
    marginTop: 24,
  },
  detailSubtitle: {
    color: "#4b5563",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 18,
  },
  formGroup: {
    marginBottom: 14,
  },
  formLabel: {
    color: "#6b7280",
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  formInput: {
    backgroundColor: "#f8fafc",
    borderColor: "#dbe3ee",
    borderRadius: 8,
    borderWidth: 1,
    color: "#111827",
    fontSize: 16,
    minHeight: 50,
    paddingHorizontal: 13,
  },
  readOnlyCard: {
    backgroundColor: "#ffffff",
    borderColor: "#e5e7eb",
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  detailRow: {
    borderBottomColor: "#e5e7eb",
    borderBottomWidth: 1,
    gap: 4,
    padding: 14,
  },
  detailRowLabel: {
    color: "#6b7280",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  detailRowValue: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 21,
  },
  primaryAction: {
    alignItems: "center",
    backgroundColor: "#111827",
    borderRadius: 8,
    minHeight: 50,
    justifyContent: "center",
    marginTop: 4,
  },
  primaryActionText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "900",
  },
  detailNote: {
    color: "#6b7280",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 12,
  },
  logoutRow: {
    alignItems: "center",
    borderBottomColor: "#fee2e2",
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 16,
    minHeight: 82,
    paddingVertical: 14,
  },
  logoutTitle: {
    color: "#991b1b",
    fontSize: 19,
    fontWeight: "900",
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
    gap: 12,
    padding: 28,
  },
  loadingText: {
    color: "#6b7280",
  },
  emptyBox: {
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderColor: "#dbe3ee",
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    marginBottom: 12,
    padding: 24,
  },
  emptyTitle: {
    color: "#111827",
    fontSize: 17,
    fontWeight: "900",
  },
  emptyText: {
    color: "#6b7280",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  savedCard: {
    backgroundColor: "#ffffff",
    borderColor: "#dbe3ee",
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    padding: 14,
  },
  savedCardHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginBottom: 9,
  },
  savedCardMeta: {
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  savedCardTitle: {
    color: "#111827",
    fontSize: 17,
    fontWeight: "900",
    lineHeight: 23,
  },
  savedCardSummary: {
    color: "#4b5563",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
  savedCardFooter: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  savedCardFooterText: {
    color: "#6b7280",
    fontSize: 12,
    fontWeight: "800",
  },
  pressed: {
    opacity: 0.74,
  },
});
