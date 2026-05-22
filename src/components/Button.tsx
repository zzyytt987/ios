import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { useAppTheme } from "../theme";

interface Props {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export default function Button({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  style,
}: Props) {
  const { dark } = useAuth();
  const theme = useAppTheme(dark);

  const bg = {
    primary: theme.primary,
    secondary: theme.secondary,
    danger: theme.destructive,
    ghost: "transparent",
  }[variant];

  const color = {
    primary: theme.primaryForeground,
    secondary: theme.secondaryForeground,
    danger: theme.destructiveForeground,
    ghost: theme.textSecondary,
  }[variant];

  const border = variant === "secondary" ? theme.border : "transparent";

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading || disabled}
      activeOpacity={0.7}
      style={[
        {
          backgroundColor: bg,
          borderColor: border,
          borderWidth: variant === "secondary" ? 1 : 0,
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderRadius: 14,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {loading && <ActivityIndicator size="small" color={color} />}
      <Text style={{ color, fontSize: 14, fontWeight: "600" }}>{title}</Text>
    </TouchableOpacity>
  );
}
