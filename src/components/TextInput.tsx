import { View, Text, TextInput as RNTextInput, StyleSheet } from "react-native";
import { AlertTriangle } from "lucide-react-native";
import { useAuth } from "../context/AuthContext";
import { useAppTheme } from "../theme";

interface Props {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "numeric" | "email-address";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
}

export default function TextInput({
  label,
  value,
  onChangeText,
  error,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
}: Props) {
  const { dark } = useAuth();
  const theme = useAppTheme(dark);

  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontSize: 13, fontWeight: "600", color: theme.text }}>{label}</Text>
      <RNTextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textMuted}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        style={{
          backgroundColor: theme.inputBackground,
          color: theme.text,
          borderWidth: 1,
          borderColor: error ? theme.destructive : theme.border,
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: 12,
          fontSize: 14,
        }}
      />
      {error ? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <AlertTriangle size={12} color={theme.destructive} />
          <Text style={{ color: theme.destructive, fontSize: 12 }}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}
