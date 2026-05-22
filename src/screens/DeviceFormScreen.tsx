import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ArrowLeft, Monitor, Check, Sun, Moon } from "lucide-react-native";
import api from "../api/client";
import Button from "../components/Button";
import TextInput from "../components/TextInput";
import Picker from "../components/Picker";
import { useAuth } from "../context/AuthContext";
import { useAppTheme } from "../theme";
import { DeviceFormData } from "../types";
import { RootStackParamList } from "../navigation/AppNavigator";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, "DeviceForm">;

const STATUS_OPTIONS = [
  { value: "active", label: "正常使用" },
  { value: "inactive", label: "停用" },
  { value: "maintenance", label: "维护中" },
];

export default function DeviceFormScreen() {
  const { dark, toggleDark } = useAuth();
  const theme = useAppTheme(dark);
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const existing = route.params?.device;
  const categories = route.params?.categories ?? [];

  const [form, setForm] = useState({
    name: existing?.name ?? "",
    model: existing?.model ?? "",
    categoryId: existing ? String(existing.category_id) : "",
    status: existing?.status ?? "active",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [saving, setSaving] = useState(false);

  const set = (k: keyof typeof form, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = "设备名称不能为空";
    if (!form.model.trim()) e.model = "型号不能为空";
    if (!form.categoryId) e.categoryId = "请选择所属分类";
    return e;
  };

  const handleSave = async () => {
    const e2 = validate();
    if (Object.keys(e2).length) {
      setErrors(e2);
      return;
    }
    setSaving(true);
    try {
      const data: DeviceFormData = {
        name: form.name,
        model: form.model,
        category_id: Number(form.categoryId),
        status: form.status,
      };
      if (existing) {
        await api.put(`/api/devices/${existing.id}`, data);
      } else {
        await api.post("/api/devices", data);
      }
      navigation.goBack();
    } catch {
      setErrors({ name: "保存失败，请重试" });
    } finally {
      setSaving(false);
    }
  };

  const catOptions = categories.map((c) => ({ value: String(c.id), label: c.name }));

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingTop: 56,
          paddingBottom: 12,
          backgroundColor: theme.card,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 6, marginRight: 8 }}>
          <ArrowLeft size={22} color={theme.text} />
        </TouchableOpacity>
        <Text style={{ flex: 1, fontSize: 17, fontWeight: "700", color: theme.text }}>
          {existing ? "编辑设备" : "添加设备"}
        </Text>
        <TouchableOpacity onPress={toggleDark} style={{ padding: 6 }}>
          {dark ? <Sun size={20} color={theme.textMuted} /> : <Moon size={20} color={theme.textMuted} />}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <View style={{ backgroundColor: theme.card, borderRadius: 16, borderWidth: 1, borderColor: theme.border, padding: 16, gap: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Monitor size={16} color={theme.primary} />
            <Text style={{ fontSize: 14, fontWeight: "700", color: theme.text }}>
              {existing ? "修改设备信息" : "录入新设备"}
            </Text>
          </View>
          <TextInput label="设备名称 *" placeholder="例：MacBook Pro 14" value={form.name} onChangeText={(t) => set("name", t)} error={errors.name} />
          <TextInput label="型号 *" placeholder="例：MBP2023" value={form.model} onChangeText={(t) => set("model", t)} error={errors.model} />
          <Picker
            label="所属分类 *"
            selectedValue={form.categoryId}
            onValueChange={(v) => set("categoryId", v)}
            options={catOptions}
            error={errors.categoryId}
          />
          <Picker
            label="设备状态"
            selectedValue={form.status}
            onValueChange={(v) => set("status", v)}
            options={STATUS_OPTIONS}
          />
          <Button title={existing ? "保存更改" : "添加设备"} onPress={handleSave} loading={saving} />
        </View>
      </ScrollView>
    </View>
  );
}
