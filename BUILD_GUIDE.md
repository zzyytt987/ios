# React Native (Expo) Android APK 打包指南

## 环境信息

- **SDK:** Expo SDK 52
- **React Native:** 0.76.7
- **Gradle:** 8.10.2
- **AGP:** 8.6.0
- **NDK:** 26.1.10909125
- **JDK:** 17

## 方式一：EAS Build（推荐）

使用 Expo 云端构建服务，无需本地 Android 开发环境。

### 1. 安装 EAS CLI

```bash
npm install -g eas-cli
```

### 2. 登录 Expo 账号

```bash
npx eas-cli login
```

### 3. 初始化 EAS 项目（仅首次）

```bash
npx eas-cli init
```

此命令会将项目关联到 Expo 账号，并生成 `eas.json` 配置文件。

### 4. 配置 eas.json

```json
{
  "cli": {
    "version": ">= 5.9.1"
  },
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

- `buildType: "apk"` — 生成 APK 文件（默认生成 AAB）
- `preview` — 构建 profile 名称，可自定义

### 5. 配置 .gitignore

确保以下文件不被提交到 git（EAS Build 基于 git 上传源码）：

```gitignore
node_modules/
.expo/
dist/
*.jks
*.p8
*.p12
*.key
*.mobileprovision
*.orig.*
web-build/
.env
android/app/build/
android/build/
android/.gradle/
android/local.properties
*.log
```

### 6. 初始化 Git 仓库并提交

EAS Build 通过 git 提交记录来确定上传哪些文件：

```bash
git init
git add -A
git commit -m "Initial commit"
```

### 7. 执行构建

```bash
npx eas-cli build --platform android --profile preview --non-interactive
```

参数说明：
- `--platform android` — Android 平台
- `--profile preview` — 使用 eas.json 中定义的 `preview` 配置
- `--non-interactive` — 非交互模式，跳过所有交互提示

### 8. 获取 APK

构建完成后，CLI 会输出 APK 下载链接，格式如：

```
https://expo.dev/artifacts/eas/<xxx>.apk
```

也可以在 Expo 控制台查看和管理所有构建记录：https://expo.dev

---

## 方式二：本地构建

需要完整的 Android 开发环境。

### 环境要求

- Android SDK (Platform 35, Build Tools 35.0.0)
- NDK 26.1.10909125
- JDK 17
- CMake 3.22.1+

### 已知问题与修复

#### 1. Gradle 下载问题（国内网络）

编辑 `android/gradle/wrapper/gradle-wrapper.properties`，使用腾讯镜像：

```properties
distributionUrl=https\://mirrors.cloud.tencent.com/gradle/gradle-8.10.2-bin.zip
```

#### 2. SDK 路径问题（Windows 中文用户名）

编辑 `android/local.properties`，使用正斜杠：

```properties
sdk.dir=C:/Android
```

设置环境变量避免路径中包含中文字符：

```bash
set GRADLE_USER_HOME=C:/gradle-cache
set JAVA_TOOL_OPTIONS=-Djava.io.tmpdir=C:/temp
```

#### 3. Prefab 批处理兼容性问题（Windows）

`react-native-screens` 的 CMake 构建依赖 Prefab 生成的批处理文件，在 Windows 中文环境下可能失败。
**解决方案：** 直接使用 EAS Build（云端 Linux 环境无此问题）。

#### 4. components.release 发布错误

编辑 `node_modules/expo-modules-core/android/ExpoModulesCorePlugin.gradle`，在第 95 行附近：

```groovy
release(MavenPublication) {
  try {
    from components.release
  } catch (Exception e) {
    logger.warn("Skipping publication: ${e.message}")
  }
}
```

#### 5. evaluationDependsOn 错误

编辑 `node_modules/expo-modules-autolinking/scripts/android/autolinking_implementation.gradle`，在第 453 行附近：

```groovy
try {
  project.evaluationDependsOn(":${moduleProject.name}")
} catch (Exception e) {
  logger.warn("Failed to evaluate ${moduleProject.name}: ${e.message}")
}
```

### 执行构建

```bash
cd android
gradlew assembleRelease
```

APK 输出路径：`android/app/build/outputs/apk/release/app-release.apk`
