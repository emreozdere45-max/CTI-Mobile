import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { login } from "../api/auth";

export function LoginScreen() {
  const [email, setEmail] = useState("analyst@example.com");
  const [password, setPassword] = useState("ChangeMe123!");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleLogin() {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const result = await login(email.trim(), password);
      setSuccessMessage(`Giris basarili: ${result.data.user.full_name}`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Beklenmeyen bir hata olustu.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        <View style={styles.header}>
          <View style={styles.logo}>
            <Ionicons name="shield-checkmark" size={30} color="#e6f1ff" />
          </View>
          <Text style={styles.title}>CTI-Mobile</Text>
          <Text style={styles.subtitle}>Mobile cyber threat intelligence console</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="analyst@example.com"
              placeholderTextColor="#7f8da3"
              style={styles.input}
              value={email}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              autoCapitalize="none"
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor="#7f8da3"
              secureTextEntry
              style={styles.input}
              value={password}
            />
          </View>

          {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
          {successMessage ? <Text style={styles.success}>{successMessage}</Text> : null}

          <Pressable
            disabled={isLoading}
            onPress={handleLogin}
            style={({ pressed }) => [
              styles.button,
              pressed && !isLoading ? styles.buttonPressed : null,
              isLoading ? styles.buttonDisabled : null,
            ]}
          >
            {isLoading ? (
              <ActivityIndicator color="#06111f" />
            ) : (
              <>
                <Ionicons name="log-in-outline" size={20} color="#06111f" />
                <Text style={styles.buttonText}>Sign in</Text>
              </>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#06111f",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  logo: {
    alignItems: "center",
    backgroundColor: "#15324f",
    borderColor: "#2e5f8f",
    borderRadius: 8,
    borderWidth: 1,
    height: 56,
    justifyContent: "center",
    marginBottom: 18,
    width: 56,
  },
  title: {
    color: "#f7fbff",
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: 0,
  },
  subtitle: {
    color: "#9fb0c7",
    fontSize: 15,
    marginTop: 8,
  },
  form: {
    gap: 16,
  },
  field: {
    gap: 8,
  },
  label: {
    color: "#d7e2f0",
    fontSize: 14,
    fontWeight: "700",
  },
  input: {
    backgroundColor: "#0d1b2d",
    borderColor: "#263a55",
    borderRadius: 8,
    borderWidth: 1,
    color: "#f7fbff",
    fontSize: 16,
    minHeight: 52,
    paddingHorizontal: 14,
  },
  button: {
    alignItems: "center",
    backgroundColor: "#58d68d",
    borderRadius: 8,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 52,
    marginTop: 8,
  },
  buttonPressed: {
    opacity: 0.86,
  },
  buttonDisabled: {
    opacity: 0.72,
  },
  buttonText: {
    color: "#06111f",
    fontSize: 16,
    fontWeight: "800",
  },
  error: {
    backgroundColor: "#3b1620",
    borderColor: "#8e2f45",
    borderRadius: 8,
    borderWidth: 1,
    color: "#ffd9df",
    padding: 12,
  },
  success: {
    backgroundColor: "#123222",
    borderColor: "#2f8756",
    borderRadius: 8,
    borderWidth: 1,
    color: "#d7ffe7",
    padding: 12,
  },
});
