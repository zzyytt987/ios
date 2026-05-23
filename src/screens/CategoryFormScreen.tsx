import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ArrowLeft, Tag, Check, Sun, Moon } from "lucide-react-native";
import axios from "axios";
import api from "../api/client";
import Button from "../components/Button";
import TextInput from "../components/TextInput";
import { useAuth } from "../context/AuthContext";
import { useAppTheme } from "../theme";
import { CategoryFormData } from "../types";
import { RootStackParamList } from "../navigation/AppNavigator";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, "CategoryForm">;

export default function CategoryFormScreen() {
  const { dark, toggleDark } = useAuth();
  const theme = useAppTheme(dark);
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const existing = route.params?.category;

  const [form, setForm] = useState({
    name: existing?.name ?? "",
    description: existing?.description ?? "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [saving, setSaving] = useState(false);

  const set = (k: keyof typeof form, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = "分类名称不能为空";
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
      const data: CategoryFormData = { name: form.name, description: form.description };
      if (existing) {
        await api.put(`/api/categories/${existing.id}`, data);
      } else {
        await api.post("/api/categories", data);
      }
      navigation.goBack();
    } catch (err) {
      let msg = "保存失败，请重试";
      if (axios.isAxiosError(err)) {
        if (err.response?.data?.detail) {
          const detail = err.response.data.detail;
          msg = Array.isArray(detail)
            ? detail.map((d: any) => d.msg ?? JSON.stringify(d)).join("\n")
            : String(detail);
        } else if (err.message) {
          msg = err.message;
        }
      }
      Alert.alert("保存失败", msg);
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
          {existing ? "编辑分类" : "添加分类"}
        </Text>
        <TouchableOpacity onPress={toggleDark} style={{ padding: 6 }}>
          {dark ? <Sun size={20} color={theme.textMuted} /> : <Moon size={20} color={theme.textMuted} />}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <View style={{ backgroundColor: theme.card, borderRadius: 16, borderWidth: 1, borderColor: theme.border, padding: 16, gap: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Tag size={16} color={theme.primary} />
            <Text style={{ fontSize: 14, fontWeight: "700", color: theme.text }}>
              {existing ? "修改分类信息" : "新建设备分类"}
            </Text>
          </View>
          <TextInput label="分类名称 *" placeholder="例：笔记本电脑" value={form.name} onChangeText={(t) => set("name", t)} error={errors.name} />
          <TextInput label="分类描述" placeholder="例：便携式计算设备" value={form.description} onChangeText={(t) => set("description", t)} error={errors.description} />
          <Button title={existing ? "保存更改" : "创建分类"} onPress={handleSave} loading={saving} />
        </View>
      </ScrollView>
    </View>
  );
}
