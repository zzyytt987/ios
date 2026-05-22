import { View, Text, TouchableOpacity, Modal, FlatList } from "react-native";
import { ChevronDown } from "lucide-react-native";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useAppTheme } from "../theme";

interface Props {
  label: string;
  selectedValue: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  error?: string;
}

export default function Picker({ label, selectedValue, onValueChange, options, error }: Props) {
  const { dark } = useAuth();
  const theme = useAppTheme(dark);
  const [open, setOpen] = useState(false);

  const selected = options.find((o) => o.value === selectedValue);

  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontSize: 13, fontWeight: "600", color: theme.text }}>{label}</Text>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        activeOpacity={0.7}
        style={{
          backgroundColor: theme.inputBackground,
          borderWidth: 1,
          borderColor: error ? theme.destructive : theme.border,
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: 12,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text style={{ color: selected ? theme.text : theme.textMuted, fontSize: 14 }}>
          {selected ? selected.label : "请选择..."}
        </Text>
        <ChevronDown size={16} color={theme.textMuted} />
      </TouchableOpacity>
      {error ? <Text style={{ color: theme.destructive, fontSize: 12 }}>{error}</Text> : null}

      <Modal visible={open} transparent animationType="fade">
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: theme.overlay, justifyContent: "center", padding: 24 }}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        >
          <View
            style={{
              backgroundColor: theme.card,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: theme.border,
              overflow: "hidden",
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: "700", color: theme.text, padding: 16, paddingBottom: 8 }}>
              {label}
            </Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    onValueChange(item.value);
                    setOpen(false);
                  }}
                  activeOpacity={0.5}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.border,
                    backgroundColor: item.value === selectedValue ? theme.accent : "transparent",
                  }}
                >
                  <Text style={{ fontSize: 15, color: theme.text, fontWeight: item.value === selectedValue ? "600" : "400" }}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
