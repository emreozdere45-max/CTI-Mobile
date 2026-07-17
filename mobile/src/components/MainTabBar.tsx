import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

export type MainTab = "home" | "threats" | "iocSearch" | "favorites" | "account";

type MainTabBarProps = {
  activeTab: MainTab | null;
  onSelectTab: (tab: MainTab) => void;
};

const tabs: Array<{
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: MainTab;
}> = [
  { icon: "grid-outline", label: "Home", value: "home" },
  { icon: "shield-checkmark-outline", label: "Threats", value: "threats" },
  { icon: "search-outline", label: "IOC", value: "iocSearch" },
  { icon: "person-circle-outline", label: "Account", value: "account" },
];

export function MainTabBar({ activeTab, onSelectTab }: MainTabBarProps) {
  return (
    <View style={styles.wrapper}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.value;

        return (
          <Pressable
            key={tab.value}
            onPress={() => onSelectTab(tab.value)}
            style={({ pressed }) => [
              styles.tabButton,
              isActive ? styles.tabButtonActive : null,
              pressed ? styles.tabButtonPressed : null,
            ]}
          >
            <Ionicons name={tab.icon} size={19} color={isActive ? "#ffffff" : "#6b7280"} />
            <Text style={[styles.tabLabel, isActive ? styles.tabLabelActive : null]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#dbe3ee",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 4,
    marginTop: 10,
    padding: 5,
  },
  tabButton: {
    alignItems: "center",
    borderRadius: 7,
    flex: 1,
    gap: 3,
    justifyContent: "center",
    minHeight: 50,
  },
  tabButtonActive: {
    backgroundColor: "#111827",
  },
  tabButtonPressed: {
    opacity: 0.78,
  },
  tabLabel: {
    color: "#6b7280",
    fontSize: 10,
    fontWeight: "800",
  },
  tabLabelActive: {
    color: "#ffffff",
  },
});
