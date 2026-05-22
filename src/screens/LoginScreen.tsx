import { useState } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Building2 } from "lucide-react-native";
import Button from "../components/Button";
import TextInput from "../components/TextInput";
import { useAuth } from "../context/AuthContext";
import { useAppTheme } from "../theme";

export default function LoginScreen() {
  const { login, dark } = useAuth();
  const theme = useAppTheme(dark);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: typeof errors = {};
    if (!username.trim()) e.username = "请输入用户名";
    if (!password) e.password = "请输入密码";
    else if (password.length < 6) e.password = "密码至少6位";
    return e;
  };

  const handleLogin = async () => {
    const e2 = validate();
    if (Object.keys(e2).length) {
      setErrors(e2);
      return;
    }
    setLoading(true);
    try {
      await login(username, password);
    } catch {
      setErrors({ password: "用户名或密码错误" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingHorizontal: 24 }}>
          <View style={{ alignItems: "center", marginBottom: 48 }}>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 24,
                backgroundColor: theme.primary,
                alignItems: "center",
                justifyContent: "center",
                elevation: 8,
                shadowColor: theme.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
              }}
            >
              <Building2 size={40} color="white" />
            </View>
            <Text style={{ fontSize: 24, fontWeight: "800", color: theme.text, marginTop: 16 }}>
              企业移动办公
            </Text>
            <Text style={{ fontSize: 13, color: theme.textMuted, marginTop: 4 }}>
              Enterprise Mobile Platform
            </Text>
          </View>

          <View
            style={{
              backgroundColor: theme.card,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: theme.border,
              padding: 20,
              gap: 20,
            }}
          >
            <TextInput
              label="用户名"
              placeholder="请输入用户名"
              value={username}
              onChangeText={(t) => {
                setUsername(t);
                setErrors((e) => ({ ...e, username: undefined }));
              }}
              error={errors.username}
              autoCapitalize="none"
            />
            <TextInput
              label="密码"
              placeholder="请输入密码"
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                setErrors((e) => ({ ...e, password: undefined }));
              }}
              error={errors.password}
              secureTextEntry
            />
            <Button title={loading ? "" : "登 录"} onPress={handleLogin} loading={loading} />
          </View>

          <Text style={{ textAlign: "center", fontSize: 12, color: theme.textMuted, marginTop: 24 }}>
            测试账号：admin / admin123
          </Text>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
