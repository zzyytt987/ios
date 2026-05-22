import { View, Text, TouchableOpacity, Modal } from "react-native";
import { AlertTriangle } from "lucide-react-native";
import Button from "./Button";
import { useAuth } from "../context/AuthContext";
import { useAppTheme } from "../theme";

interface Props {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

export default function ConfirmModal({ visible, title, message, onConfirm, onCancel, loading }: Props) {
  const { dark } = useAuth();
  const theme = useAppTheme(dark);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={{ flex: 1, backgroundColor: theme.overlay, justifyContent: "center", padding: 24 }}>
        <View style={{ backgroundColor: theme.card, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: theme.border }}>
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(239,68,68,0.1)", alignItems: "center", justifyContent: "center" }}>
              <AlertTriangle size={20} color={theme.destructive} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: "700", color: theme.text }}>{title}</Text>
              <Text style={{ fontSize: 13, color: theme.textSecondary, marginTop: 4 }}>{message}</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <Button title="取消" onPress={onCancel} variant="secondary" style={{ flex: 1 }} />
            <Button title="确认删除" onPress={onConfirm} variant="danger" loading={loading} style={{ flex: 1 }} />
          </View>
        </View>
      </View>
    </Modal>
  );
}
