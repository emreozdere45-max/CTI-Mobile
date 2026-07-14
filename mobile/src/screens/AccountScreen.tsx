import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
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

export function AccountScreen({ session, onBack, onLogout, onSelectTab }: AccountScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={onBack} style={styles.iconButton}>
            <Ionicons name="arrow-back" size={22} color="#d7e2f0" />
          </Pressable>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>User profile</Text>
            <Text style={styles.title}>Account</Text>
          </View>
          <View style={styles.iconButtonPlaceholder} />
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={34} color="#06111f" />
          </View>
          <Text style={styles.name}>{session.user.full_name}</Text>
          <Text style={styles.email}>{session.user.email}</Text>
        </View>

        <View style={styles.infoCard}>
          <InfoRow icon="shield-checkmark-outline" label="Role" value={session.user.roles.join(", ")} />
          <InfoRow icon="key-outline" label="Session" value={`${session.expiresIn} seconds`} />
        </View>

        <Pressable
          onPress={onLogout}
          style={({ pressed }) => [styles.logoutButton, pressed ? styles.logoutButtonPressed : null]}
        >
          <Ionicons name="log-out-outline" size={20} color="#ffd9df" />
          <Text style={styles.logoutText}>Sign out</Text>
        </Pressable>

        <View style={styles.spacer} />
        <MainTabBar activeTab="home" onSelectTab={onSelectTab} />
      </View>
    </SafeAreaView>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={20} color="#58d68d" />
      <View style={styles.infoText}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
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
    marginBottom: 18,
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
    fontSize: 26,
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
    height: 44,
    width: 44,
  },
  profileCard: {
    alignItems: "center",
    backgroundColor: "#0d1b2d",
    borderColor: "#263a55",
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    padding: 22,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: "#58d68d",
    borderRadius: 8,
    height: 70,
    justifyContent: "center",
    marginBottom: 14,
    width: 70,
  },
  name: {
    color: "#f7fbff",
    fontSize: 20,
    fontWeight: "900",
    textAlign: "center",
  },
  email: {
    color: "#9fb0c7",
    fontSize: 14,
    marginTop: 5,
  },
  infoCard: {
    backgroundColor: "#0d1b2d",
    borderColor: "#263a55",
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    padding: 14,
  },
  infoRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    paddingVertical: 10,
  },
  infoText: {
    flex: 1,
  },
  infoLabel: {
    color: "#9fb0c7",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  infoValue: {
    color: "#f7fbff",
    fontSize: 15,
    fontWeight: "800",
    marginTop: 2,
  },
  logoutButton: {
    alignItems: "center",
    backgroundColor: "#3b1620",
    borderColor: "#8e2f45",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    minHeight: 50,
  },
  logoutButtonPressed: {
    opacity: 0.82,
  },
  logoutText: {
    color: "#ffd9df",
    fontSize: 15,
    fontWeight: "900",
  },
  spacer: {
    flex: 1,
  },
});
