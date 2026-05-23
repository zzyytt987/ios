import { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Laptop, Layers, Pencil, Trash2, Sun, Moon, LogOut } from "lucide-react-native";
import api from "../api/client";
import Button from "../components/Button";
import StatusBadge from "../components/StatusBadge";
import FAB from "../components/FAB";
import ConfirmModal from "../components/ConfirmModal";
import { useAuth } from "../context/AuthContext";
import { useAppTheme } from "../theme";
import { Device, Category } from "../types";
import { RootStackParamList } from "../navigation/AppNavigator";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function DeviceListScreen() {
  const { dark, toggleDark, logout } = useAuth();
  const theme = useAppTheme(dark);
  const navigation = useNavigation<Nav>();

  const [devices, setDevices] = useState<Device[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filterCategoryId, setFilterCategoryId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [devRes, catRes] = await Promise.all([
        api.get<Device[]>("/api/devices"),
        api.get<Category[]>("/api/categories"),
      ]);
      setDevices(devRes.data);
      setCategories(catRes.data);
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
      await api.delete(`/api/devices/${confirmId}`);
      setDevices((arr) => arr.filter((d) => d.id !== confirmId));
    } catch {
      Alert.alert("删除失败", "无法删除该设备，请重试");
    } finally {
      setDeleting(false);
      setConfirmId(null);
    }
  };

  const filtered = filterCategoryId ? devices.filter((d) => d.category_id === filterCategoryId) : devices;

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
        <Text style={{ flex: 1, fontSize: 17, fontWeight: "700", color: theme.text }}>设备管理</Text>
        <TouchableOpacity onPress={toggleDark} style={{ padding: 6 }}>
          {dark ? <Sun size={20} color={theme.textMuted} /> : <Moon size={20} color={theme.textMuted} />}
        </TouchableOpacity>
        <TouchableOpacity onPress={logout} style={{ padding: 6 }}>
          <LogOut size={20} color={theme.textMuted} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(d) => String(d.id)}
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
          <View style={{ gap: 12, marginBottom: 4 }}>
            {/* Category Filter */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              <TouchableOpacity
                onPress={() => setFilterCategoryId(null)}
                activeOpacity={0.7}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  borderRadius: 999,
                  backgroundColor: filterCategoryId === null ? theme.primary : theme.muted,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: filterCategoryId === null ? theme.primaryForeground : theme.textMuted,
                  }}
                >
                  全部
                </Text>
              </TouchableOpacity>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setFilterCategoryId(cat.id)}
                  activeOpacity={0.7}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 6,
                    borderRadius: 999,
                    backgroundColor: filterCategoryId === cat.id ? theme.primary : theme.muted,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color: filterCategoryId === cat.id ? theme.primaryForeground : theme.textMuted,
                    }}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={{ fontSize: 12, color: theme.textMuted, fontVariant: ["tabular-nums"] }}>
              显示 {filtered.length} / {devices.length} 台设备
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingVertical: 60 }}>
            <Laptop size={40} color={theme.textMuted} style={{ opacity: 0.3 }} />
            <Text style={{ color: theme.textMuted, fontSize: 14, marginTop: 8 }}>暂无设备数据</Text>
          </View>
        }
        renderItem={({ item }) => {
          const cat = categories.find((c) => c.id === item.category_id);
          return (
            <View style={{ backgroundColor: theme.card, borderRadius: 16, borderWidth: 1, borderColor: theme.border, padding: 16 }}>
              <View style={{ flexDirection: "row", gap: 12 }}>
                <View
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    backgroundColor: theme.secondary,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Laptop size={22} color={theme.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Text style={{ fontSize: 15, fontWeight: "700", color: theme.text, flex: 1 }} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <StatusBadge status={item.status} />
                  </View>
                  <Text style={{ fontSize: 12, color: theme.textMuted, marginTop: 2, fontVariant: ["tabular-nums"] }}>
                    {item.model}
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 }}>
                    <Layers size={12} color={theme.textMuted} />
                    <Text style={{ fontSize: 12, color: theme.textMuted }}>{cat?.name ?? "未分类"}</Text>
                  </View>
                </View>
              </View>
              <View style={{ flexDirection: "row", gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.border }}>
                <Button
                  title="编辑"
                  variant="secondary"
                  style={{ flex: 1, paddingVertical: 8 }}
                  onPress={() => navigation.navigate("DeviceForm", { device: item, categories })}
                />
                <TouchableOpacity
                  onPress={() => setConfirmId(item.id)}
                  activeOpacity={0.5}
                  style={{ paddingHorizontal: 12, paddingVertical: 8, justifyContent: "center" }}
                >
                  <Trash2 size={18} color={theme.destructive} />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      <FAB onPress={() => navigation.navigate("DeviceForm", { categories })} />

      <ConfirmModal
        visible={confirmId !== null}
        title="删除设备"
        message="确认删除该设备记录？此操作不可撤销。"
        onConfirm={handleDelete}
        onCancel={() => setConfirmId(null)}
        loading={deleting}
      />
    </View>
  );
}
