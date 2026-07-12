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

import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../api/notifications";
import type { AuthSession, Notification } from "../types/api";

type NotificationsScreenProps = {
  session: AuthSession;
  onBack: () => void;
};

const severityColors: Record<string, string> = {
  critical: "#ff6b6b",
  high: "#ffb020",
  medium: "#58a6ff",
  low: "#58d68d",
  info: "#9fb0c7",
};

export function NotificationsScreen({ session, onBack }: NotificationsScreenProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function loadNotifications(isRefresh = false, nextUnreadOnly = unreadOnly) {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setErrorMessage(null);

    try {
      const result = await listNotifications(session.accessToken, nextUnreadOnly);
      setNotifications(result.data);
      setUnreadCount(result.meta.unread_count);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Notifications could not be loaded.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  async function handleToggleUnreadOnly() {
    const nextUnreadOnly = !unreadOnly;
    setUnreadOnly(nextUnreadOnly);
    await loadNotifications(false, nextUnreadOnly);
  }

  async function handleMarkOne(notification: Notification) {
    if (notification.is_read) {
      return;
    }

    setIsUpdating(true);
    setErrorMessage(null);
    try {
      const result = await markNotificationRead(session.accessToken, notification.id);
      setNotifications((current) =>
        current.map((item) => (item.id === notification.id ? result.data : item)),
      );
      setUnreadCount((current) => Math.max(current - 1, 0));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Notification could not be updated.");
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleMarkAll() {
    setIsUpdating(true);
    setErrorMessage(null);
    try {
      await markAllNotificationsRead(session.accessToken);
      await loadNotifications(false, unreadOnly);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Notifications could not be updated.");
    } finally {
      setIsUpdating(false);
    }
  }

  useEffect(() => {
    void loadNotifications();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={onBack} style={styles.iconButton}>
            <Ionicons name="arrow-back" size={22} color="#d7e2f0" />
          </Pressable>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>{unreadCount} unread</Text>
            <Text style={styles.title}>Notifications</Text>
          </View>
          <Pressable disabled={isUpdating} onPress={handleMarkAll} style={styles.iconButton}>
            {isUpdating ? (
              <ActivityIndicator color="#58d68d" size="small" />
            ) : (
              <Ionicons name="checkmark-done-outline" size={22} color="#d7e2f0" />
            )}
          </Pressable>
        </View>

        <View style={styles.filterRow}>
          <Pressable
            onPress={handleToggleUnreadOnly}
            style={[styles.filterButton, unreadOnly ? styles.filterButtonActive : null]}
          >
            <Ionicons
              name={unreadOnly ? "radio-button-on" : "radio-button-off"}
              size={18}
              color={unreadOnly ? "#06111f" : "#d7e2f0"}
            />
            <Text style={[styles.filterText, unreadOnly ? styles.filterTextActive : null]}>
              Unread only
            </Text>
          </Pressable>
        </View>

        {errorMessage ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color="#58d68d" />
            <Text style={styles.loadingText}>Loading notifications</Text>
          </View>
        ) : (
          <FlatList
            ListEmptyComponent={<EmptyState unreadOnly={unreadOnly} />}
            contentContainerStyle={styles.listContent}
            data={notifications}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl
                onRefresh={() => void loadNotifications(true)}
                refreshing={isRefreshing}
                tintColor="#58d68d"
              />
            }
            renderItem={({ item }) => (
              <NotificationCard
                notification={item}
                onMarkRead={() => void handleMarkOne(item)}
              />
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

function NotificationCard({
  notification,
  onMarkRead,
}: {
  notification: Notification;
  onMarkRead: () => void;
}) {
  const severityColor = severityColors[notification.severity] ?? "#9fb0c7";

  return (
    <View style={[styles.card, notification.is_read ? styles.cardRead : null]}>
      <View style={styles.cardHeader}>
        <View style={[styles.severityDot, { backgroundColor: severityColor }]} />
        <Text style={[styles.severityText, { color: severityColor }]}>
          {notification.severity}
        </Text>
        {!notification.is_read ? <View style={styles.unreadPill} /> : null}
      </View>
      <Text style={styles.cardTitle}>{notification.title}</Text>
      <Text style={styles.cardMessage}>{notification.message}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.metaText}>{notification.notification_type}</Text>
        <Pressable
          disabled={notification.is_read}
          onPress={onMarkRead}
          style={[styles.readButton, notification.is_read ? styles.readButtonDisabled : null]}
        >
          <Ionicons
            name={notification.is_read ? "checkmark-circle" : "checkmark-circle-outline"}
            size={16}
            color={notification.is_read ? "#58d68d" : "#06111f"}
          />
          <Text
            style={[styles.readButtonText, notification.is_read ? styles.readButtonTextDone : null]}
          >
            {notification.is_read ? "Read" : "Mark read"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function EmptyState({ unreadOnly }: { unreadOnly: boolean }) {
  return (
    <View style={styles.emptyBox}>
      <Ionicons name="notifications-outline" size={30} color="#9fb0c7" />
      <Text style={styles.emptyTitle}>No notifications</Text>
      <Text style={styles.emptyText}>
        {unreadOnly ? "All notifications are read." : "There are no notifications yet."}
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
  filterRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  filterButton: {
    alignItems: "center",
    backgroundColor: "#0d1b2d",
    borderColor: "#263a55",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  filterButtonActive: {
    backgroundColor: "#58d68d",
    borderColor: "#58d68d",
  },
  filterText: {
    color: "#d7e2f0",
    fontWeight: "800",
  },
  filterTextActive: {
    color: "#06111f",
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
  cardRead: {
    opacity: 0.78,
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
  unreadPill: {
    backgroundColor: "#58d68d",
    borderRadius: 5,
    height: 10,
    marginLeft: "auto",
    width: 10,
  },
  cardTitle: {
    color: "#f7fbff",
    fontSize: 17,
    fontWeight: "800",
    lineHeight: 23,
  },
  cardMessage: {
    color: "#b7c4d6",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  cardFooter: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  metaText: {
    color: "#9fb0c7",
    fontSize: 12,
  },
  readButton: {
    alignItems: "center",
    backgroundColor: "#58d68d",
    borderRadius: 8,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  readButtonDisabled: {
    backgroundColor: "#123222",
    borderColor: "#2f8756",
    borderWidth: 1,
  },
  readButtonText: {
    color: "#06111f",
    fontSize: 12,
    fontWeight: "800",
  },
  readButtonTextDone: {
    color: "#d7ffe7",
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
    textAlign: "center",
  },
});
