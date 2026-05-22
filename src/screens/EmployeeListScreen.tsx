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
import {
  Users,
  Mail,
  User,
  ChevronRight,
  Trash2,
  RefreshCw,
  Sun,
  Moon,
  LogOut,
} from "lucide-react-native";
import api from "../api/client";
import Button from "../components/Button";
import FAB from "../components/FAB";
import ConfirmModal from "../components/ConfirmModal";
import { useAuth } from "../context/AuthContext";
import { useAppTheme } from "../theme";
import { Employee } from "../types";
import { RootStackParamList } from "../navigation/AppNavigator";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function EmployeeListScreen() {
  const { dark, toggleDark, logout } = useAuth();
  const theme = useAppTheme(dark);
  const navigation = useNavigation<Nav>();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await api.get<Employee[]>("/api/employees");
      setEmployees(res.data);
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

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleDelete = async () => {
    if (confirmId === null) return;
    setDeleting(true);
    try {
      await api.delete(`/api/employees/${confirmId}`);
      setEmployees((arr) => arr.filter((e) => e.id !== confirmId));
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
        <Text style={{ flex: 1, fontSize: 17, fontWeight: "700", color: theme.text }}>员工管理</Text>
        <TouchableOpacity onPress={handleRefresh} style={{ padding: 6 }} activeOpacity={0.5}>
          <RefreshCw size={20} color={theme.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleDark} style={{ padding: 6 }} activeOpacity={0.5}>
          {dark ? <Sun size={20} color={theme.textMuted} /> : <Moon size={20} color={theme.textMuted} />}
        </TouchableOpacity>
        <TouchableOpacity onPress={logout} style={{ padding: 6 }} activeOpacity={0.5}>
          <LogOut size={20} color={theme.textMuted} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={employees}
        keyExtractor={(e) => String(e.id)}
        contentContainerStyle={{ padding: 16, paddingBottom: 100, gap: 12 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.primary} />}
        ListHeaderComponent={
          <Text style={{ fontSize: 12, color: theme.textMuted, fontVariant: ["tabular-nums"], marginBottom: 4 }}>
            共 {employees.length} 名员工
          </Text>
        }
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingVertical: 60 }}>
            <Users size={40} color={theme.textMuted} style={{ opacity: 0.3 }} />
            <Text style={{ color: theme.textMuted, fontSize: 14, marginTop: 8 }}>暂无员工数据</Text>
          </View>
        }
        renderItem={({ item }) => (
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
                <User size={22} color={theme.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: "700", color: theme.text }}>{item.name}</Text>
                <Text style={{ fontSize: 12, color: theme.textSecondary, marginTop: 2, fontVariant: ["tabular-nums"] }}>
                  {item.department} · {item.age}岁
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 }}>
                  <Mail size={12} color={theme.textMuted} />
                  <Text style={{ fontSize: 12, color: theme.textMuted, flex: 1 }} numberOfLines={1}>
                    {item.email}
                  </Text>
                </View>
              </View>
            </View>
            <View style={{ flexDirection: "row", gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.border }}>
              <Button
                title="查看详情"
                variant="secondary"
                style={{ flex: 1, paddingVertical: 8 }}
                onPress={() => navigation.navigate("EmployeeDetail", { employee: item })}
              />
              <TouchableOpacity
                onPress={() => setConfirmId(item.id)}
                activeOpacity={0.5}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  justifyContent: "center",
                }}
              >
                <Trash2 size={18} color={theme.destructive} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <FAB onPress={() => navigation.navigate("EmployeeForm", {})} />

      <ConfirmModal
        visible={confirmId !== null}
        title="删除员工"
        message="此操作不可撤销，确认删除该员工信息？"
        onConfirm={handleDelete}
        onCancel={() => setConfirmId(null)}
        loading={deleting}
      />
    </View>
  );
}
