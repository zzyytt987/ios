import { TouchableOpacity, StyleSheet } from "react-native";
import { Plus } from "lucide-react-native";
import { useAuth } from "../context/AuthContext";
import { useAppTheme } from "../theme";

export default function FAB({ onPress }: { onPress: () => void }) {
  const { dark } = useAuth();
  const theme = useAppTheme(dark);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        position: "absolute",
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: theme.primary,
        alignItems: "center",
        justifyContent: "center",
        elevation: 8,
        shadowColor: theme.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
      }}
    >
      <Plus size={24} color={theme.primaryForeground} />
    </TouchableOpacity>
  );
}
