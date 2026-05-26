# iOS IPA 打包 + 爱思签名 完整流程

## 原理

```
Expo 代码 → Web 编译 → Capacitor 包壳 → GitHub Actions macOS 编译 → 未签名 .ipa → 爱思助手签名 → USB 装 iPhone
```

无需 Mac、无需 Apple 开发者账号，靠 GitHub Actions + 爱思助手免费 Apple ID 签名。

---

## 一、依赖清单（本地）

| 工具 | 用途 |
|------|------|
| Expo SDK 54 | 代码框架 |
| react-native-web | Web 编译 |
| @capacitor/core / cli / ios / android | 打包壳 |
| @expo/metro-runtime | Web 运行时 |

```bash
npm install --legacy-peer-deps react-dom@19.1.0 react-native-web@~0.19.13 @expo/metro-runtime@~4.0.1 @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
```

---

## 二、配置文件

### capacitor.config.json

```json
{
  "appId": "com.enterprise.mobile",
  "appName": "企业移动办公",
  "webDir": "dist",
  "bundledWebRuntime": false
}
```

### GitHub Actions Workflow

**文件位置：** `.github/workflows/ios-unsigned.yml`

```yaml
name: Build iOS Unsigned IPA

on:
  workflow_dispatch:

jobs:
  build:
    runs-on: macos-latest
    permissions:
      contents: read
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Install dependencies
        run: npm ci --legacy-peer-deps

      - name: Build web
        run: npx expo export --platform web

      - name: Init Capacitor iOS
        run: |
          npx cap add ios
          npx cap sync ios

      - name: Build unsigned IPA
        run: |
          cd ios/App
          xcodebuild \
            -workspace App.xcworkspace \
            -scheme App \
            -configuration Release \
            -sdk iphoneos \
            -archivePath ./build/App.xcarchive \
            CODE_SIGNING_ALLOWED=NO \
            CODE_SIGNING_REQUIRED=NO \
            CODE_SIGN_IDENTITY="" \
            archive
          cd ../..

      - name: Package as IPA
        run: |
          mkdir -p Payload
          cp -R ios/App/build/App.xcarchive/Products/Applications/App.app Payload/
          zip -r enterprise-mobile-web-unsigned.ipa Payload
          rm -rf Payload

      - name: Upload IPA
        uses: actions/upload-artifact@v4
        with:
          name: enterprise-mobile-web-unsigned
          path: enterprise-mobile-web-unsigned.ipa
```

> **关键点：** `CODE_SIGNING_ALLOWED=NO` 跳过签名，否则没证书编译不过。

---

## 三、触发构建

### 方式一：网页手动

1. 打开仓库 Actions 页面
2. 选 **Build iOS Unsigned IPA**
3. **Run workflow** → **Run workflow**

### 方式二：CLI

```bash
gh workflow run "Build iOS Unsigned IPA" --repo zzyytt987/ios --ref main
```

构建约 5-8 分钟，完成后在 Actions 页面下载 `enterprise-mobile-web-unsigned.ipa`。

---

## 四、爱思助手签名 + 安装

### 准备

- Windows 电脑
- 爱思助手（官网下载安装）
- iPhone + USB 数据线
- 一个 Apple ID（免费即可）

### 步骤

1. iPhone USB 连电脑，爱思助手识别设备
2. 工具箱 → **IPA 签名**
3. 添加 IPA 文件 → 选择下载的 `enterprise-mobile-web-unsigned.ipa`
4. 勾选 **使用 Apple ID 签名** → 输入你的 Apple ID 和密码
5. 点 **开始签名** → 等待完成
6. 签名完成后点 **安装** → App 出现在 iPhone 桌面
7. iPhone 上：**设置 → 通用 → VPN 与设备管理** → 信任证书

---

## 五、限制与注意事项

| 项目 | 说明 |
|------|------|
| 签名有效期 | **7 天**，到期需重新签名安装 |
| 数据 | 每次重装数据丢失，Web 数据不持久 |
| 设备 | 需要 iPhone/iPad，模拟器不行 |
| Apple ID | 免费 ID 即可，不需要付费开发者 |
| 网络 | GitHub 需要科学上网（国内直连不稳定） |

---

## 六、踩坑记录

1. **GitHub Actions 认证 403** — 可能是 GitHub 故障，等官方恢复
2. **lucide-react-native 不支持 React 19** — 用 `--legacy-peer-deps` 绕过
3. **Capacitor 要求 Node ≥ 22** — CI 里用 `node-version: 22`
4. **Capacitor 默认同步 Android** — 用 `npx cap sync ios` 仅同步 iOS
5. **App.xcworkspace 不存在** — 新板 Capacitor 用 xcodeproj，需自适应

---

## 七、常用命令速查

```bash
# 本地启动 Expo Web
npx expo start --web

# 导出 Web 静态文件
npx expo export --platform web

# 触发 CI 构建
gh workflow run "Build iOS Unsigned IPA" --repo zzyytt987/ios --ref main

# 查看构建日志
gh run view <RUN_ID> --repo zzyytt987/ios --log

# Git 推送（HTTPS 不通时用 SSH）
git push git@github.com:zzyytt987/ios.git main
```
