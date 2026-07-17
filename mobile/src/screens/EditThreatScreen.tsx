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

import { updateThreat } from "../api/threats";
import type { AuthSession, ThreatDetail } from "../types/api";
import { assessThreatRisk } from "../utils/threatAssessment";

type EditThreatScreenProps = {
  session: AuthSession;
  threat: ThreatDetail;
  onBack: () => void;
  onUpdated: (threat: ThreatDetail) => void;
};

export function EditThreatScreen({ session, threat, onBack, onUpdated }: EditThreatScreenProps) {
  const [title, setTitle] = useState(threat.title);
  const [summary, setSummary] = useState(threat.summary);
  const [description, setDescription] = useState(threat.description ?? "");
  const [industry, setIndustry] = useState(threat.industry ?? "");
  const [region, setRegion] = useState(threat.region ?? "");
  const [tags, setTags] = useState(threat.tags.join(", "));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit() {
    if (title.trim().length < 3) {
      setErrorMessage("Title must be at least 3 characters.");
      return;
    }

    if (summary.trim().length < 10) {
      setErrorMessage("Summary must be at least 10 characters.");
      return;
    }

    if (description.trim().length < 10) {
      setErrorMessage("Description must be at least 10 characters.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const assessment = assessThreatRisk({ description, summary, tags, title });
      const result = await updateThreat(session.accessToken, threat.id, {
        confidence_score: assessment.confidenceScore,
        description: description.trim(),
        industry: industry.trim() || null,
        region: region.trim() || null,
        severity: assessment.severity,
        summary: summary.trim(),
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        title: title.trim(),
      });

      onUpdated(result.data);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Threat could not be updated.");
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
            <Ionicons name="arrow-back" size={22} color="#111827" />
          </Pressable>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>Threat management</Text>
            <Text style={styles.title}>Edit threat</Text>
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
            <Ionicons name="sparkles-outline" size={20} color="#111827" />
            <Text style={styles.infoText}>
              Severity and confidence will be recalculated when you save.
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
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Ionicons name="save-outline" size={20} color="#ffffff" />
                <Text style={styles.submitButtonText}>Save changes</Text>
              </>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
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
        placeholderTextColor="#9ca3af"
        style={[
          styles.input,
          inputProps.multiline ? styles.multilineInput : null,
          tall ? styles.tallInput : null,
        ]}
        {...inputProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f3f6fa",
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
    backgroundColor: "#ffffff",
    borderColor: "#dbe3ee",
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
    color: "#6b7280",
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  title: {
    color: "#111827",
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: 0,
  },
  content: {
    gap: 14,
    padding: 20,
    paddingBottom: 32,
  },
  errorBox: {
    backgroundColor: "#fee2e2",
    borderColor: "#fecaca",
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
  },
  errorText: {
    color: "#991b1b",
  },
  fieldBlock: {
    gap: 8,
  },
  label: {
    color: "#374151",
    fontSize: 13,
    fontWeight: "800",
  },
  input: {
    backgroundColor: "#ffffff",
    borderColor: "#dbe3ee",
    borderRadius: 8,
    borderWidth: 1,
    color: "#111827",
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
    backgroundColor: "#ffffff",
    borderColor: "#dbe3ee",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    padding: 12,
  },
  infoText: {
    color: "#4b5563",
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  submitButton: {
    alignItems: "center",
    backgroundColor: "#111827",
    borderRadius: 8,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginTop: 6,
    minHeight: 50,
  },
  submitButtonPressed: {
    opacity: 0.82,
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "900",
  },
});
