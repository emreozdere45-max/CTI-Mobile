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

import { createThreat } from "../api/threats";
import type { AuthSession, ThreatDetail, ThreatCreatePayload } from "../types/api";

type CreateThreatScreenProps = {
  session: AuthSession;
  onBack: () => void;
  onCreated: (threat: ThreatDetail) => void;
};

type Severity = ThreatCreatePayload["severity"];

const highRiskKeywords = [
  "ransomware",
  "credential",
  "malware",
  "phishing",
  "breach",
  "exploit",
  "critical",
  "admin",
  "finance",
  "bank",
  "payment",
  "invoice",
];

const mediumRiskKeywords = ["suspicious", "domain", "login", "email", "ip", "url", "campaign"];

export function CreateThreatScreen({ session, onBack, onCreated }: CreateThreatScreenProps) {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [industry, setIndustry] = useState("");
  const [region, setRegion] = useState("");
  const [tags, setTags] = useState("phishing, test");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canSubmit =
    title.trim().length > 0 && summary.trim().length > 0 && description.trim().length > 0;

  async function handleSubmit() {
    if (!canSubmit || title.trim().length < 3) {
      setErrorMessage("Title must be at least 3 characters.");
      return;
    }

    if (summary.trim().length < 10) {
      setErrorMessage("Summary must be at least 10 characters.");
      return;
    }

    if (description.trim().length < 10) {
      setErrorMessage("Title, summary and description are required.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const assessment = assessThreatRisk({
        description,
        summary,
        tags,
        title,
      });

      const result = await createThreat(session.accessToken, {
        confidence_score: assessment.confidenceScore,
        description: description.trim(),
        industry: industry.trim() || null,
        published_at: null,
        region: region.trim() || null,
        severity: assessment.severity,
        source_id: null,
        summary: summary.trim(),
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        title: title.trim(),
      });

      onCreated(result.data);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Threat could not be created.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <Pressable onPress={onBack} style={styles.iconButton}>
            <Ionicons name="arrow-back" size={22} color="#d7e2f0" />
          </Pressable>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>Threat management</Text>
            <Text style={styles.title}>Create threat</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {errorMessage ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          <Field label="Title" value={title} onChangeText={setTitle} placeholder="Threat title" />
          <Field
            label="Summary"
            value={summary}
            onChangeText={setSummary}
            placeholder="Short analyst summary"
            multiline
          />
          <Field
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="What happened, who is affected, and why it matters"
            multiline
            tall
          />

          <View style={styles.infoBox}>
            <Ionicons name="sparkles-outline" size={20} color="#58d68d" />
            <Text style={styles.infoText}>
              The app will estimate severity and confidence from the threat content.
            </Text>
          </View>

          <Field label="Industry" value={industry} onChangeText={setIndustry} placeholder="finance" />
          <Field label="Region" value={region} onChangeText={setRegion} placeholder="global" />
          <Field
            label="Tags"
            value={tags}
            onChangeText={setTags}
            placeholder="phishing, credential-theft"
          />

          <Pressable
            disabled={isSubmitting}
            onPress={() => void handleSubmit()}
            style={({ pressed }) => [
              styles.submitButton,
              pressed || isSubmitting ? styles.submitButtonPressed : null,
            ]}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#06111f" />
            ) : (
              <>
                <Ionicons name="checkmark" size={20} color="#06111f" />
                <Text style={styles.submitButtonText}>Create threat</Text>
              </>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function assessThreatRisk({
  description,
  summary,
  tags,
  title,
}: {
  description: string;
  summary: string;
  tags: string;
  title: string;
}): { confidenceScore: number; severity: Severity } {
  const text = `${title} ${summary} ${description} ${tags}`.toLowerCase();
  const highMatches = highRiskKeywords.filter((keyword) => text.includes(keyword)).length;
  const mediumMatches = mediumRiskKeywords.filter((keyword) => text.includes(keyword)).length;
  const detailBonus = description.trim().length > 140 ? 8 : description.trim().length > 60 ? 4 : 0;
  const score = Math.min(96, 45 + highMatches * 9 + mediumMatches * 5 + detailBonus);

  if (score >= 85 || highMatches >= 4) {
    return { confidenceScore: score, severity: "critical" };
  }

  if (score >= 70 || highMatches >= 2) {
    return { confidenceScore: score, severity: "high" };
  }

  if (score >= 55 || mediumMatches >= 2) {
    return { confidenceScore: score, severity: "medium" };
  }

  return { confidenceScore: Math.max(score, 35), severity: "low" };
}

function Field({
  label,
  tall = false,
  ...inputProps
}: {
  label: string;
  tall?: boolean;
} & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor="#64748b"
        style={[styles.input, inputProps.multiline ? styles.multilineInput : null, tall ? styles.tallInput : null]}
        {...inputProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#06111f",
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: "#0d1b2d",
    borderColor: "#263a55",
    borderRadius: 8,
    borderWidth: 1,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  headerText: {
    flex: 1,
  },
  eyebrow: {
    color: "#58d68d",
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  title: {
    color: "#f7fbff",
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: 0,
  },
  content: {
    gap: 14,
    padding: 20,
    paddingBottom: 32,
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
  fieldBlock: {
    gap: 8,
  },
  label: {
    color: "#d7e2f0",
    fontSize: 13,
    fontWeight: "800",
  },
  input: {
    backgroundColor: "#0d1b2d",
    borderColor: "#263a55",
    borderRadius: 8,
    borderWidth: 1,
    color: "#f7fbff",
    fontSize: 15,
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  multilineInput: {
    minHeight: 88,
    textAlignVertical: "top",
  },
  tallInput: {
    minHeight: 132,
  },
  infoBox: {
    alignItems: "center",
    backgroundColor: "#0d1b2d",
    borderColor: "#263a55",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    padding: 12,
  },
  infoText: {
    color: "#d7e2f0",
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  submitButton: {
    alignItems: "center",
    backgroundColor: "#58d68d",
    borderRadius: 8,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 50,
    marginTop: 6,
  },
  submitButtonPressed: {
    opacity: 0.82,
  },
  submitButtonText: {
    color: "#06111f",
    fontSize: 16,
    fontWeight: "900",
  },
});
