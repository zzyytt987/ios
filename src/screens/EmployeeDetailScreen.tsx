import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ArrowLeft, Pencil, Check, Trash2, Sun, Moon } from "lucide-react-native";
import api from "../api/client";
import Button from "../components/Button";
import TextInput from "../components/TextInput";
import ConfirmModal from "../components/ConfirmModal";
import { useAuth } from "../context/AuthContext";
import { useAppTheme } from "../theme";
import { Employee } from "../types";
import { RootStackParamList } from "../navigation/AppNavigator";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, "EmployeeDetail">;

export default function EmployeeDetailScreen() {
  const { dark, toggleDark } = useAuth();
  const theme = useAppTheme(dark);
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { employee: initial } = route.params;

  const [form, setForm] = useState({ ...initial });
  const [errors, setErrors] = useState<Partial<Record<keyof Employee, string>>>({});
  const [saving, setSaving] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const set = (k: keyof Employee, v: string) => {
    setForm((f) => ({ ...f, [k]: k === "age" ? Number(v) : v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = "姓名不能为空";
    if (!form.age || form.age < 18 || form.age > 65) e.age = "年龄须在18-65之间";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "邮箱格式不正确";
    if (!form.department.trim()) e.department = "部门不能为空";
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
      const res = await api.put<Employee>(`/api/employees/${initial.id}`, form);
      navigation.navigate("MainTabs");
    } catch {
      setErrors({ name: "保存失败，请重试" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/api/employees/${initial.id}`);
      navigation.navigate("MainTabs");
    } catch {
      setDeleting(false);
      setConfirmVisible(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header */}
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
        <Text style={{ flex: 1, fontSize: 17, fontWeight: "700", color: theme.text }}>员工详情</Text>
        <TouchableOpacity onPress={toggleDark} style={{ padding: 6 }}>
          {dark ? <Sun size={20} color={theme.textMuted} /> : <Moon size={20} color={theme.textMuted} />}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100, gap: 20 }}>
        {/* Avatar Card */}
        <View style={{ backgroundColor: theme.card, borderRadius: 16, borderWidth: 1, borderColor: theme.border, padding: 16, flexDirection: "row", alignItems: "center", gap: 16 }}>
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              backgroundColor: theme.primary,
              alignItems: "center",
              justifyContent: "center",
              elevation: 4,
              shadowColor: theme.primary,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
            }}
          >
            <Text style={{ fontSize: 22, fontWeight: "800", color: "white" }}>{initial.name[0]}</Text>
          </View>
          <View>
            <Text style={{ fontSize: 17, fontWeight: "700", color: theme.text }}>{initial.name}</Text>
            <Text style={{ fontSize: 12, color: theme.textMuted, fontVariant: ["tabular-nums"] }}>
              ID #{String(initial.id).padStart(4, "0")}
            </Text>
          </View>
        </View>

        {/* Edit Form */}
        <View style={{ backgroundColor: theme.card, borderRadius: 16, borderWidth: 1, borderColor: theme.border, padding: 16, gap: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Pencil size={16} color={theme.primary} />
            <Text style={{ fontSize: 14, fontWeight: "700", color: theme.text }}>编辑信息</Text>
          </View>
          <TextInput label="姓名" value={form.name} onChangeText={(t) => set("name", t)} error={errors.name} />
          <TextInput label="年龄" value={String(form.age)} onChangeText={(t) => set("age", t)} error={errors.age} keyboardType="numeric" />
          <TextInput label="邮箱" value={form.email} onChangeText={(t) => set("email", t)} error={errors.email} keyboardType="email-address" autoCapitalize="none" />
          <TextInput label="部门" value={form.department} onChangeText={(t) => set("department", t)} error={errors.department} />
          <Button title="保存更改" onPress={handleSave} loading={saving} />
        </View>

        <Button title="删除此员工" onPress={() => setConfirmVisible(true)} variant="danger" />
      </ScrollView>

      <ConfirmModal
        visible={confirmVisible}
        title="删除员工"
        message={`确认删除「${initial.name}」？此操作不可撤销。`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmVisible(false)}
        loading={deleting}
      />
    </View>
  );
}
