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
| react-native-web / react-dom | Web 编译 |
| @capacitor/core / cli / ios / keyboard | 打包壳 + 键盘支持 |
| @expo/metro-runtime | Web 运行时 |

```bash
npm install --legacy-peer-deps \
  react-dom@19.1.0 \
  react-native-web@~0.19.13 \
  @expo/metro-runtime@~4.0.1 \
  @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android @capacitor/keyboard
```

---

## 二、配置文件

### capacitor.config.json

```json
{
  "appId": "com.enterprise.mobile",
  "appName": "企业移动办公",
  "webDir": "dist",
  "bundledWebRuntime": false,
  "server": {
    "iosScheme": "capacitor"
  },
  "ios": {
    "contentInset": "automatic",
    "scrollEnabled": true,
    "preferredContentMode": "mobile"
  }
}
```

> `contentInset: automatic` 键盘弹出时内容自动上移，否则输入框被键盘挡住。

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

      - name: Fix CSS for Capacitor
        run: |
          sed -i '' 's/overflow: hidden;/overflow: auto;/g' dist/index.html

      - name: Init Capacitor iOS
        run: |
          npx cap add ios
          npx cap sync ios

      - name: Build unsigned IPA
        run: |
          cd ios/App
          if [ -f App.xcworkspace ]; then
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
          else
            xcodebuild \
              -project App.xcodeproj \
              -scheme App \
              -configuration Release \
              -sdk iphoneos \
              -archivePath ./build/App.xcarchive \
              CODE_SIGNING_ALLOWED=NO \
              CODE_SIGNING_REQUIRED=NO \
              CODE_SIGN_IDENTITY="" \
              archive
          fi
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

---

## 三、触发构建

### 方式一：网页手动

1. 打开仓库 Actions 页面
2. 选 **Build iOS Unsigned IPA**
3. **Run workflow** → 选 main 分支 → **Run workflow**

### 方式二：CLI

```bash
gh auth login
gh workflow run "Build iOS Unsigned IPA" --repo zzyytt987/ios --ref main
```

构建约 5-8 分钟。成功后在那个 run 的 Artifacts 里下载 `enterprise-mobile-web-unsigned.ipa`。

---

## 四、爱思助手签名 + 安装

### 准备

- Windows 电脑
- 爱思助手（官网下载安装）
- iPhone + USB 数据线
- 一个 Apple ID（免费即可，不需要开发者账号）

### 操作步骤

1. **连接设备** — iPhone USB 连电脑，爱思助手自动识别
2. **IPA 签名** — 工具箱 → IPA 签名 → 添加下载的 `.ipa`
3. **Apple ID 签名** — 勾选「使用 Apple ID 签名」→ 输入你的 Apple ID 和密码 → 开始签名
4. **安装** — 签名完成后点「安装」→ App 出现在 iPhone 桌面
5. **信任证书** — iPhone 上打开 **设置 → 通用 → VPN 与设备管理** → 点证书 → 信任

---

## 五、限制

| 项目 | 说明 |
|------|------|
| 签名有效期 | **7 天**，到期需重新签名安装 |
| 数据持久化 | 重装后数据丢失 |
| 设备要求 | 需要 iPhone/iPad，不支持模拟器 |
| 网络 | GitHub 需科学上网（国内直连不稳定） |

---

## 六、踩坑记录

| 问题 | 原因 | 解决 |
|------|------|------|
| Actions checkout 403 | GitHub 认证服务故障 | 等 GitHub 恢复 |
| `lucide-react-native` 依赖冲突 | 不支持 React 19 | `npm ci --legacy-peer-deps` |
| Capacitor 要求 Node ≥ 22 | 默认 Node 20 | `node-version: 22` |
| `update android - failed` | Capacitor 默认同步两端 | `npx cap sync ios` 指定平台 |
| `App.xcworkspace does not exist` | Capacitor 版本差异 | if/else 自适应 xcworkspace / xcodeproj |
| 打开 App 后无法输入 | ① 缺键盘插件 ② body overflow 阻止滚动 | ① 安装 @capacitor/keyboard ② sed 改 overflow 为 auto |
| macOS BSD sed 报错 | `sed -i` 需 backup 参数 | `sed -i ''` |
| HTTPS push 超时 | 国内直连 GitHub 不稳 | 用 SSH 推送：`git push git@github.com:...` |

---

## 七、常用命令速查

```bash
# 本地 Web 预览
npx expo start --web

# 导出 Web 静态文件（测试编译是否通过）
npx expo export --platform web

# 触发 CI 构建
gh workflow run "Build iOS Unsigned IPA" --repo zzyytt987/ios --ref main

# 查看构建状态
gh run view <RUN_ID> --repo zzyytt987/ios

# 查看构建日志
gh run view <RUN_ID> --repo zzyytt987/ios --log

# SSH 推送（HTTPS 超时备用）
git remote set-url origin git@github.com:zzyytt987/ios.git
git push origin main
```
