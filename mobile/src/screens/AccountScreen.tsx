import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { MainTab } from "../components/MainTabBar";
import { MainTabBar } from "../components/MainTabBar";
import type { AuthSession } from "../types/api";

type AccountScreenProps = {
  session: AuthSession;
  onBack: () => void;
  onLogout: () => void;
  onSelectTab: (tab: MainTab) => void;
};

type SettingItem = {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  status: string;
  subtitle: string;
  title: string;
};

const settings: SettingItem[] = [
  {
    icon: "person-circle-outline",
    status: "Ready",
    title: "Personal information",
    subtitle: "Name, email, analyst role and workspace identity",
  },
  {
    icon: "shield-checkmark-outline",
    status: "Protected",
    title: "Login & security",
    subtitle: "Password, active session and token-based access",
  },
  {
    icon: "notifications-outline",
    status: "On",
    title: "Notifications",
    subtitle: "Critical threats, IOC alerts and analyst reminders",
  },
  {
    icon: "server-outline",
    status: "Live",
    title: "Data sources",
    subtitle: "CISA KEV, vendor feeds and free CTI news sources",
  },
  {
    icon: "bookmark-outline",
    status: "Synced",
    title: "Saved intelligence",
    subtitle: "Bookmarked threats and IOC findings",
  },
  {
    icon: "document-text-outline",
    status: "Available",
    title: "Export & reports",
    subtitle: "Analyst summaries and source links for sharing",
  },
  {
    icon: "information-circle-outline",
    status: "v0.1",
    title: "About CTI-Mobile",
    subtitle: "Project version, documentation and support notes",
  },
];

export function AccountScreen({ session, onBack, onLogout, onSelectTab }: AccountScreenProps) {
  const initials = session.user.full_name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const roleLabel = session.user.roles.join(", ") || "cti_analyst";

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.topRow}>
            <Pressable onPress={onBack} style={styles.iconButton}>
              <Ionicons name="arrow-back" size={22} color="#111827" />
            </Pressable>
            <Text style={styles.topTitle}>Account</Text>
            <View style={styles.iconButtonPlaceholder} />
          </View>

          <Text style={styles.title}>Profile</Text>

          <Pressable style={({ pressed }) => [styles.profileRow, pressed ? styles.pressed : null]}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials || "CT"}</Text>
            </View>
            <View style={styles.profileText}>
              <Text style={styles.name}>{session.user.full_name}</Text>
              <Text style={styles.email}>{session.user.email}</Text>
              <View style={styles.rolePill}>
                <Ionicons name="shield-checkmark" size={14} color="#ffffff" />
                <Text style={styles.rolePillText}>{roleLabel}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={28} color="#111827" />
          </Pressable>

          <View style={styles.summaryGrid}>
            <SummaryCard icon="radio-outline" label="Feeds" value="Auto" />
            <SummaryCard icon="key-outline" label="Session" value="JWT" />
            <SummaryCard icon="analytics-outline" label="Role" value="Analyst" />
          </View>

          <View style={styles.workspaceCard}>
            <View style={styles.workspaceHeader}>
              <View style={styles.workspaceIcon}>
                <Ionicons name="pulse-outline" size={25} color="#ffffff" />
              </View>
              <View style={styles.workspaceCopy}>
                <Text style={styles.workspaceTitle}>Analyst workspace</Text>
                <Text style={styles.workspaceSubtitle}>
                  Your account can review threat feeds, inspect IOC evidence, save findings and open AI analyst briefs.
                </Text>
              </View>
            </View>

            <View style={styles.workspaceStats}>
              <WorkspaceStat label="Threat feed" value="Active" />
              <WorkspaceStat label="IOC lookup" value="Ready" />
              <WorkspaceStat label="Notifications" value="Enabled" />
            </View>
          </View>

          <Text style={styles.sectionTitle}>Settings</Text>

          <View style={styles.settingsList}>
            {settings.map((item) => (
              <SettingsRow
                icon={item.icon}
                key={item.title}
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
        </ScrollView>

        <MainTabBar activeTab="account" onSelectTab={onSelectTab} />
      </View>
    </SafeAreaView>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: string;
}) {
  return (
    <View style={styles.summaryCard}>
      <Ionicons name={icon} size={20} color="#111827" />
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function WorkspaceStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.workspaceStat}>
      <Text style={styles.workspaceStatValue}>{value}</Text>
      <Text style={styles.workspaceStatLabel}>{label}</Text>
    </View>
  );
}

function SettingsRow({
  icon,
  status,
  subtitle,
  title,
}: SettingItem) {
  return (
    <Pressable style={({ pressed }) => [styles.settingRow, pressed ? styles.pressed : null]}>
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
  topRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 48,
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
  title: {
    color: "#171717",
    fontSize: 42,
    fontWeight: "900",
    letterSpacing: 0,
    marginBottom: 28,
    marginTop: 24,
  },
  profileRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 16,
    marginBottom: 18,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: "#111827",
    borderRadius: 999,
    height: 82,
    justifyContent: "center",
    width: 82,
  },
  avatarText: {
    color: "#ffffff",
    fontSize: 26,
    fontWeight: "900",
  },
  profileText: {
    flex: 1,
  },
  name: {
    color: "#171717",
    fontSize: 25,
    fontWeight: "900",
  },
  email: {
    color: "#737373",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 2,
  },
  rolePill: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#111827",
    borderRadius: 8,
    flexDirection: "row",
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  rolePillText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "900",
  },
  summaryGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 18,
  },
  summaryCard: {
    backgroundColor: "#f8fafc",
    borderColor: "#dbe3ee",
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    padding: 12,
  },
  summaryValue: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 10,
  },
  summaryLabel: {
    color: "#6b7280",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
  workspaceCard: {
    backgroundColor: "#111827",
    borderRadius: 8,
    marginBottom: 32,
    padding: 16,
  },
  workspaceHeader: {
    flexDirection: "row",
    gap: 14,
  },
  workspaceIcon: {
    alignItems: "center",
    backgroundColor: "#2563eb",
    borderRadius: 8,
    height: 52,
    justifyContent: "center",
    width: 52,
  },
  workspaceCopy: {
    flex: 1,
  },
  workspaceTitle: {
    color: "#ffffff",
    fontSize: 21,
    fontWeight: "900",
  },
  workspaceSubtitle: {
    color: "#cbd5e1",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 5,
  },
  workspaceStats: {
    borderTopColor: "#334155",
    borderTopWidth: 1,
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
    paddingTop: 14,
  },
  workspaceStat: {
    flex: 1,
  },
  workspaceStatValue: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900",
  },
  workspaceStatLabel: {
    color: "#94a3b8",
    fontSize: 11,
    marginTop: 3,
  },
  sectionTitle: {
    color: "#171717",
    fontSize: 31,
    fontWeight: "900",
    marginBottom: 16,
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
  pressed: {
    opacity: 0.74,
  },
});
