import { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Tag, Monitor, Pencil, Trash2, Sun, Moon, LogOut } from "lucide-react-native";
import api from "../api/client";
import Button from "../components/Button";
import FAB from "../components/FAB";
import ConfirmModal from "../components/ConfirmModal";
import { useAuth } from "../context/AuthContext";
import { useAppTheme } from "../theme";
import { Category, Device } from "../types";
import { RootStackParamList } from "../navigation/AppNavigator";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function CategoryListScreen() {
  const { dark, toggleDark, logout } = useAuth();
  const theme = useAppTheme(dark);
  const navigation = useNavigation<Nav>();

  const [categories, setCategories] = useState<Category[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [catRes, devRes] = await Promise.all([
        api.get<Category[]>("/api/categories"),
        api.get<Device[]>("/api/devices"),
      ]);
      setCategories(catRes.data);
      setDevices(devRes.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchData();
    }, [fetchData])
  );

  const handleDelete = async () => {
    if (confirmId === null) return;
    setDeleting(true);
    try {
      await api.delete(`/api/categories/${confirmId}`);
      setCategories((arr) => arr.filter((c) => c.id !== confirmId));
    } catch {
      // silent
    } finally {
      setDeleting(false);
      setConfirmId(null);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

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
        <Text style={{ flex: 1, fontSize: 17, fontWeight: "700", color: theme.text }}>设备分类</Text>
        <TouchableOpacity onPress={toggleDark} style={{ padding: 6 }}>
          {dark ? <Sun size={20} color={theme.textMuted} /> : <Moon size={20} color={theme.textMuted} />}
        </TouchableOpacity>
        <TouchableOpacity onPress={logout} style={{ padding: 6 }}>
          <LogOut size={20} color={theme.textMuted} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(c) => String(c.id)}
        contentContainerStyle={{ padding: 16, paddingBottom: 100, gap: 12 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchData();
            }}
            tintColor={theme.primary}
          />
        }
        ListHeaderComponent={
          <Text style={{ fontSize: 12, color: theme.textMuted, fontVariant: ["tabular-nums"], marginBottom: 4 }}>
            共 {categories.length} 个分类
          </Text>
        }
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingVertical: 60 }}>
            <Tag size={40} color={theme.textMuted} style={{ opacity: 0.3 }} />
            <Text style={{ color: theme.textMuted, fontSize: 14, marginTop: 8 }}>暂无分类数据</Text>
          </View>
        }
        renderItem={({ item }) => {
          const count = devices.filter((d) => d.category_id === item.id).length;
          return (
            <View style={{ backgroundColor: theme.card, borderRadius: 16, borderWidth: 1, borderColor: theme.border, padding: 16 }}>
              <View style={{ flexDirection: "row", gap: 12 }}>
                <View
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    backgroundColor: theme.accent,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Tag size={22} color={theme.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: "700", color: theme.text }}>{item.name}</Text>
                  <Text style={{ fontSize: 12, color: theme.textSecondary, marginTop: 2 }}>{item.description}</Text>
                  <Text style={{ fontSize: 12, color: theme.primary, marginTop: 4, fontWeight: "600", fontVariant: ["tabular-nums"] }}>
                    {count} 台设备
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: "row", gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.border }}>
                <Button
                  title="查看设备"
                  variant="secondary"
                  style={{ flex: 1, paddingVertical: 8 }}
                  onPress={() => {
                    navigation.getParent()?.navigate("DevicesTab");
                  }}
                />
                <TouchableOpacity
                  onPress={() => navigation.navigate("CategoryForm", { category: item })}
                  activeOpacity={0.5}
                  style={{ paddingHorizontal: 10, justifyContent: "center" }}
                >
                  <Pencil size={18} color={theme.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setConfirmId(item.id)}
                  activeOpacity={0.5}
                  style={{ paddingHorizontal: 10, justifyContent: "center" }}
                >
                  <Trash2 size={18} color={theme.destructive} />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      <FAB onPress={() => navigation.navigate("CategoryForm", {})} />

      <ConfirmModal
        visible={confirmId !== null}
        title="删除分类"
        message="删除分类不会删除该分类下的设备，但设备将变为未分类状态。"
        onConfirm={handleDelete}
        onCancel={() => setConfirmId(null)}
        loading={deleting}
      />
    </View>
  );
}
