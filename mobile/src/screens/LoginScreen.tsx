import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { login } from "../api/auth";
import type { AuthSession } from "../types/api";

type LoginScreenProps = {
  onLoginSuccess: (session: AuthSession) => void;
};

type AuthMode = "welcome" | "login" | "signup";

export function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [mode, setMode] = useState<AuthMode>("welcome");
  const [email, setEmail] = useState("analyst@example.com");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("ChangeMe123!");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  async function handleLogin() {
    setIsLoading(true);
    setErrorMessage(null);
    setInfoMessage(null);

    try {
      const result = await login(email.trim(), password);
      onLoginSuccess(result);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unexpected error.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleSignup() {
    setErrorMessage(null);
    setInfoMessage(
      "Account creation UI is ready. We still need to add the backend register endpoint.",
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        {mode === "welcome" ? (
          <WelcomeView
            onCreateAccount={() => {
              setErrorMessage(null);
              setInfoMessage(null);
              setMode("signup");
            }}
            onLogin={() => {
              setErrorMessage(null);
              setInfoMessage(null);
              setMode("login");
            }}
          />
        ) : (
          <ScrollView
            contentContainerStyle={styles.formContent}
            keyboardShouldPersistTaps="handled"
          >
            <Pressable
              onPress={() => {
                setErrorMessage(null);
                setInfoMessage(null);
                setMode("welcome");
              }}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={22} color="#111827" />
            </Pressable>

            <View style={styles.formHeader}>
              <BrandMark />
              <Text style={styles.formTitle}>
                {mode === "login" ? "Log in to CTI-Mobile" : "Create your account"}
              </Text>
              <Text style={styles.formSubtitle}>
                {mode === "login"
                  ? "Use your analyst account to continue."
                  : "Set up an analyst profile for threat intelligence access."}
              </Text>
            </View>

            <View style={styles.form}>
              {mode === "signup" ? (
                <Field
                  autoCapitalize="words"
                  label="Full name"
                  onChangeText={setFullName}
                  placeholder="Demo CTI Analyst"
                  value={fullName}
                />
              ) : null}

              <Field
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                label="Email"
                onChangeText={setEmail}
                placeholder="analyst@example.com"
                value={email}
              />

              <Field
                autoCapitalize="none"
                label="Password"
                onChangeText={setPassword}
                placeholder="Password"
                secureTextEntry
                value={password}
              />

              {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
              {infoMessage ? <Text style={styles.info}>{infoMessage}</Text> : null}

              <Pressable
                disabled={isLoading}
                onPress={mode === "login" ? handleLogin : handleSignup}
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && !isLoading ? styles.buttonPressed : null,
                  isLoading ? styles.buttonDisabled : null,
                ]}
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.primaryButtonText}>
                    {mode === "login" ? "Log in" : "Create account"}
                  </Text>
                )}
              </Pressable>

              <Pressable
                onPress={() => {
                  setErrorMessage(null);
                  setInfoMessage(null);
                  setMode(mode === "login" ? "signup" : "login");
                }}
                style={styles.switchModeButton}
              >
                <Text style={styles.switchModeText}>
                  {mode === "login"
                    ? "Need an account? Create one"
                    : "Have an account already? Log in"}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function WelcomeView({
  onCreateAccount,
  onLogin,
}: {
  onCreateAccount: () => void;
  onLogin: () => void;
}) {
  return (
    <View style={styles.welcomeContainer}>
      <View style={styles.topBrand}>
        <BrandMark />
      </View>

      <View style={styles.heroBlock}>
        <Text style={styles.heroTitle}>See critical cyber threats before they spread.</Text>
      </View>

      <View style={styles.authActions}>
        <SocialButton icon="logo-google" label="Continue with Google" />
        <SocialButton icon="logo-apple" label="Continue with Apple" />

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <Pressable
          onPress={onCreateAccount}
          style={({ pressed }) => [
            styles.primaryButton,
            styles.largeButton,
            pressed ? styles.buttonPressed : null,
          ]}
        >
          <Text style={styles.primaryButtonText}>Create account</Text>
        </Pressable>

        <Text style={styles.termsText}>
          By signing up, you agree to our <Text style={styles.linkText}>Terms</Text>,{" "}
          <Text style={styles.linkText}>Privacy Policy</Text>, and{" "}
          <Text style={styles.linkText}>Cookie Use</Text>.
        </Text>

        <Pressable onPress={onLogin} style={styles.loginLinkButton}>
          <Text style={styles.loginPrompt}>
            Have an account already? <Text style={styles.linkText}>Log in</Text>
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function BrandMark() {
  return (
    <View style={styles.brandMark}>
      <Ionicons name="shield-checkmark" size={28} color="#ffffff" />
    </View>
  );
}

function SocialButton({
  icon,
  label,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
}) {
  return (
    <Pressable style={({ pressed }) => [styles.socialButton, pressed ? styles.buttonPressed : null]}>
      <Ionicons name={icon} size={25} color="#111827" />
      <Text style={styles.socialButtonText}>{label}</Text>
    </Pressable>
  );
}

function Field({
  label,
  ...inputProps
}: {
  label: string;
} & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor="#9ca3af"
        style={styles.input}
        {...inputProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  keyboardView: {
    flex: 1,
  },
  welcomeContainer: {
    flex: 1,
    paddingHorizontal: 28,
    paddingVertical: 18,
  },
  topBrand: {
    alignItems: "center",
    paddingTop: 18,
  },
  brandMark: {
    alignItems: "center",
    backgroundColor: "#111827",
    borderRadius: 8,
    height: 52,
    justifyContent: "center",
    width: 52,
  },
  heroBlock: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: 20,
  },
  heroTitle: {
    color: "#0b1018",
    fontSize: 43,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 51,
  },
  authActions: {
    gap: 14,
    paddingBottom: 16,
  },
  socialButton: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#d1d5db",
    borderRadius: 999,
    borderWidth: 1.5,
    flexDirection: "row",
    gap: 18,
    justifyContent: "center",
    minHeight: 62,
  },
  socialButtonText: {
    color: "#0b1018",
    fontSize: 18,
    fontWeight: "900",
  },
  dividerRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    marginVertical: 2,
  },
  dividerLine: {
    backgroundColor: "#d1d5db",
    flex: 1,
    height: 1,
  },
  dividerText: {
    color: "#6b7280",
    fontSize: 16,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#0b1018",
    borderRadius: 999,
    justifyContent: "center",
    minHeight: 56,
  },
  largeButton: {
    minHeight: 68,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "900",
  },
  buttonPressed: {
    opacity: 0.82,
  },
  buttonDisabled: {
    opacity: 0.72,
  },
  termsText: {
    color: "#6b7280",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 6,
  },
  linkText: {
    color: "#3b82f6",
  },
  loginLinkButton: {
    alignSelf: "flex-start",
    marginTop: 18,
  },
  loginPrompt: {
    color: "#6b7280",
    fontSize: 16,
  },
  formContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 28,
  },
  backButton: {
    alignItems: "center",
    backgroundColor: "#f3f6fa",
    borderColor: "#dbe3ee",
    borderRadius: 8,
    borderWidth: 1,
    height: 46,
    justifyContent: "center",
    marginBottom: 28,
    width: 46,
  },
  formHeader: {
    gap: 12,
    marginBottom: 28,
  },
  formTitle: {
    color: "#0b1018",
    fontSize: 33,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 40,
  },
  formSubtitle: {
    color: "#6b7280",
    fontSize: 16,
    lineHeight: 23,
  },
  form: {
    gap: 16,
  },
  field: {
    gap: 8,
  },
  label: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "800",
  },
  input: {
    backgroundColor: "#ffffff",
    borderColor: "#d1d5db",
    borderRadius: 8,
    borderWidth: 1.5,
    color: "#111827",
    fontSize: 16,
    minHeight: 54,
    paddingHorizontal: 15,
  },
  error: {
    backgroundColor: "#fee2e2",
    borderColor: "#fecaca",
    borderRadius: 8,
    borderWidth: 1,
    color: "#991b1b",
    padding: 12,
  },
  info: {
    backgroundColor: "#eff6ff",
    borderColor: "#bfdbfe",
    borderRadius: 8,
    borderWidth: 1,
    color: "#1e40af",
    lineHeight: 20,
    padding: 12,
  },
  switchModeButton: {
    alignSelf: "center",
    paddingVertical: 8,
  },
  switchModeText: {
    color: "#3b82f6",
    fontSize: 15,
    fontWeight: "800",
  },
});
