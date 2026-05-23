const DEV_PORT = "8000";

// 运行 ipconfig 查看电脑局域网 IP，修改下面这行
// 如果用 Android 模拟器则填 10.0.2.2
const DEV_HOST = "192.168.1.100";

export const API_BASE = __DEV__
  ? `http://${DEV_HOST}:${DEV_PORT}`
  : `https://your-production-api.com`;
