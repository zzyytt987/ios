import { View, Text } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useAppTheme } from "../theme";

type Status = "active" | "inactive" | "maintenance";

const labels: Record<Status, string> = {
  active: "正常",
  inactive: "停用",
  maintenance: "维护中",
};

export default function StatusBadge({ status }: { status: Status }) {
  const { dark } = useAuth();
  const theme = useAppTheme(dark);

  const bg: Record<Status, string> = {
    active: dark ? "rgba(52,211,153,0.2)" : "#d1fae5",
    inactive: theme.muted,
    maintenance: dark ? "rgba(251,191,36,0.2)" : "#fef3c7",
  };

  const color: Record<Status, string> = {
    active: theme.statusActive,
    inactive: theme.statusInactive,
    maintenance: theme.statusMaintenance,
  };

  return (
    <View style={{ backgroundColor: bg[status], paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 }}>
      <Text style={{ fontSize: 11, fontWeight: "600", color: color[status], fontVariant: ["tabular-nums"] }}>
        {labels[status]}
      </Text>
    </View>
  );
}
