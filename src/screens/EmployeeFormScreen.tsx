import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ArrowLeft, User, Check, Sun, Moon } from "lucide-react-native";
import api from "../api/client";
import Button from "../components/Button";
import TextInput from "../components/TextInput";
import { useAuth } from "../context/AuthContext";
import { useAppTheme } from "../theme";
import { EmployeeFormData } from "../types";
import { RootStackParamList } from "../navigation/AppNavigator";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, "EmployeeForm">;

export default function EmployeeFormScreen() {
  const { dark, toggleDark } = useAuth();
  const theme = useAppTheme(dark);
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const existing = route.params?.employee;

  const [form, setForm] = useState({
    name: existing?.name ?? "",
    age: existing ? String(existing.age) : "",
    email: existing?.email ?? "",
    department: existing?.department ?? "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [saving, setSaving] = useState(false);

  const set = (k: keyof typeof form, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = "姓名不能为空";
    const age = Number(form.age);
    if (!form.age || age < 18 || age > 65) e.age = "年龄须在18-65之间";
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
      const data: EmployeeFormData = {
        name: form.name,
        age: Number(form.age),
        email: form.email,
        department: form.department,
      };
      if (existing) {
        await api.put(`/api/employees/${existing.id}`, data);
      } else {
        await api.post("/api/employees", data);
      }
      navigation.goBack();
    } catch {
      setErrors({ name: "保存失败，请重试" });
    } finally {
      setSaving(false);
    }
  };

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
          {existing ? "编辑员工" : "添加员工"}
        </Text>
        <TouchableOpacity onPress={toggleDark} style={{ padding: 6 }}>
          {dark ? <Sun size={20} color={theme.textMuted} /> : <Moon size={20} color={theme.textMuted} />}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <View style={{ backgroundColor: theme.card, borderRadius: 16, borderWidth: 1, borderColor: theme.border, padding: 16, gap: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <User size={16} color={theme.primary} />
            <Text style={{ fontSize: 14, fontWeight: "700", color: theme.text }}>员工基本信息</Text>
          </View>
          <TextInput label="姓名 *" placeholder="例：张伟" value={form.name} onChangeText={(t) => set("name", t)} error={errors.name} />
          <TextInput label="年龄 *" placeholder="例：28" value={form.age} onChangeText={(t) => set("age", t)} error={errors.age} keyboardType="numeric" />
          <TextInput label="邮箱 *" placeholder="例：zhang.wei@corp.com" value={form.email} onChangeText={(t) => set("email", t)} error={errors.email} keyboardType="email-address" autoCapitalize="none" />
          <TextInput label="部门 *" placeholder="例：研发部" value={form.department} onChangeText={(t) => set("department", t)} error={errors.department} />
          <Button
            title={existing ? "保存更改" : "保存员工"}
            onPress={handleSave}
            loading={saving}
          />
        </View>
      </ScrollView>
    </View>
  );
}
