import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Users, Tag, Laptop } from "lucide-react-native";
import { useAuth } from "../context/AuthContext";
import { useAppTheme } from "../theme";
import LoginScreen from "../screens/LoginScreen";
import EmployeeListScreen from "../screens/EmployeeListScreen";
import EmployeeDetailScreen from "../screens/EmployeeDetailScreen";
import EmployeeFormScreen from "../screens/EmployeeFormScreen";
import CategoryListScreen from "../screens/CategoryListScreen";
import CategoryFormScreen from "../screens/CategoryFormScreen";
import DeviceListScreen from "../screens/DeviceListScreen";
import DeviceFormScreen from "../screens/DeviceFormScreen";
import { Employee, Category, Device } from "../types";

export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
  EmployeeDetail: { employee: Employee };
  EmployeeForm: { employee?: Employee };
  CategoryForm: { category?: Category };
  DeviceForm: { device?: Device; categories: Category[] };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  const { dark } = useAuth();
  const theme = useAppTheme(dark);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.tabBar,
          borderTopColor: theme.tabBarBorder,
          borderTopWidth: 1,
          paddingTop: 6,
          paddingBottom: 8,
          height: 60,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tab.Screen
        name="EmployeesTab"
        component={EmployeeListScreen}
        options={{
          tabBarLabel: "员工",
          tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="CategoriesTab"
        component={CategoryListScreen}
        options={{
          tabBarLabel: "分类",
          tabBarIcon: ({ color, size }) => <Tag size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="DevicesTab"
        component={DeviceListScreen}
        options={{
          tabBarLabel: "设备",
          tabBarIcon: ({ color, size }) => <Laptop size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isLoggedIn, isLoading, dark } = useAuth();
  const theme = useAppTheme(dark);

  if (isLoading) return null;

  const navTheme = dark
    ? { ...DarkTheme, colors: { ...DarkTheme.colors, primary: theme.primary, background: theme.background } }
    : { ...DefaultTheme, colors: { ...DefaultTheme.colors, primary: theme.primary, background: theme.background } };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isLoggedIn ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={TabNavigator} />
            <Stack.Screen name="EmployeeDetail" component={EmployeeDetailScreen} />
            <Stack.Screen name="EmployeeForm" component={EmployeeFormScreen} />
            <Stack.Screen name="CategoryForm" component={CategoryFormScreen} />
            <Stack.Screen name="DeviceForm" component={DeviceFormScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
