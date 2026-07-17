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

const settings = [
  {
    icon: "person-circle-outline",
    title: "Personal information",
    subtitle: "Name, email, role and analyst profile",
  },
  {
    icon: "shield-checkmark-outline",
    title: "Login & security",
    subtitle: "Password, sessions and account protection",
  },
  {
    icon: "notifications-outline",
    title: "Notifications",
    subtitle: "Critical threat and IOC alert preferences",
  },
  {
    icon: "server-outline",
    title: "Data sources",
    subtitle: "Feeds, internal CTI and import settings",
  },
  {
    icon: "lock-closed-outline",
    title: "Privacy & data",
    subtitle: "Saved items, exports and data retention",
  },
  {
    icon: "information-circle-outline",
    title: "About CTI-Mobile",
    subtitle: "Version, documentation and support",
  },
] as const;

export function AccountScreen({ session, onBack, onLogout, onSelectTab }: AccountScreenProps) {
  const initials = session.user.full_name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.topRow}>
            <Pressable onPress={onBack} style={styles.iconButton}>
              <Ionicons name="arrow-back" size={22} color="#111827" />
            </Pressable>
          </View>

          <Text style={styles.title}>Profile</Text>

          <Pressable style={({ pressed }) => [styles.profileRow, pressed ? styles.pressed : null]}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials || "CT"}</Text>
            </View>
            <View style={styles.profileText}>
              <Text style={styles.name}>{session.user.full_name}</Text>
              <Text style={styles.email}>{session.user.email}</Text>
            </View>
            <Ionicons name="chevron-forward" size={28} color="#111827" />
          </Pressable>

          <View style={styles.divider} />

          <View style={styles.roleCard}>
            <View style={styles.roleIcon}>
              <Ionicons name="analytics-outline" size={25} color="#ffffff" />
            </View>
            <View style={styles.roleText}>
              <Text style={styles.roleTitle}>Analyst workspace</Text>
              <Text style={styles.roleSubtitle}>
                {session.user.roles.join(", ") || "cti_analyst"} access enabled
              </Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Settings</Text>

          <View style={styles.settingsList}>
            {settings.map((item) => (
              <SettingsRow
                icon={item.icon}
                key={item.title}
                subtitle={item.subtitle}
                title={item.title}
              />
            ))}
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

function SettingsRow({
  icon,
  subtitle,
  title,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  subtitle: string;
  title: string;
}) {
  return (
    <Pressable style={({ pressed }) => [styles.settingRow, pressed ? styles.pressed : null]}>
      <Ionicons name={icon} size={28} color="#111827" />
      <View style={styles.settingText}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#111827" />
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
    minHeight: 48,
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
  title: {
    color: "#171717",
    fontSize: 42,
    fontWeight: "900",
    letterSpacing: 0,
    marginBottom: 32,
    marginTop: 28,
  },
  profileRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 18,
    marginBottom: 28,
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
    fontWeight: "800",
  },
  email: {
    color: "#737373",
    fontSize: 16,
    lineHeight: 23,
    marginTop: 2,
  },
  divider: {
    backgroundColor: "#e5e7eb",
    height: 1,
    marginBottom: 28,
  },
  roleCard: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#e5e7eb",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 14,
    marginBottom: 36,
    padding: 18,
    shadowColor: "#000000",
    shadowOffset: { height: 9, width: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
  },
  roleIcon: {
    alignItems: "center",
    backgroundColor: "#111827",
    borderRadius: 8,
    height: 54,
    justifyContent: "center",
    width: 54,
  },
  roleText: {
    flex: 1,
  },
  roleTitle: {
    color: "#171717",
    fontSize: 21,
    fontWeight: "900",
  },
  roleSubtitle: {
    color: "#737373",
    fontSize: 15,
    lineHeight: 21,
    marginTop: 4,
  },
  sectionTitle: {
    color: "#171717",
    fontSize: 31,
    fontWeight: "900",
    marginBottom: 18,
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
    gap: 20,
    minHeight: 82,
    paddingVertical: 14,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    color: "#171717",
    fontSize: 19,
    fontWeight: "800",
  },
  settingSubtitle: {
    color: "#737373",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 3,
  },
  logoutRow: {
    alignItems: "center",
    borderBottomColor: "#fee2e2",
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 20,
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
