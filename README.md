# UmWorks Yarn Monorepo

这是一个基于 Yarn Workspaces 的 monorepo 项目，包含多个演示应用程序。

## 项目结构

```
packages/
  ├── demo-expo-app/      # React Native / Expo 应用
  ├── demo-tauri-app/     # Tauri 桌面应用
  ├── demo-electron-vite/ # Electron 桌面应用
  ├── demo-react-vite/    # React + Vite Web 应用
  └── demo-taro-react/    # 多端小程序应用 (Taro)
```

## 功能特点

- 统一的代码风格和 lint 配置
- 完整的测试设置和 CI/CD 工作流
- 自动仓库拆分功能，支持将每个包同步到独立仓库
- Yarn Workspaces 依赖管理
- TypeScript 支持

## 安装

```bash
# 克隆仓库
git clone https://github.com/umworks/umworks-yarn-monorepo.git
cd umworks-yarn-monorepo

# 安装依赖
yarn install
```

## 开发命令

### 根目录命令

```bash
# 运行 lint 检查
yarn lint

# 修复 lint 问题
yarn lint:fix

# 格式化代码
yarn format

# 运行所有包的测试
yarn test

# 构建所有包
yarn build

# 清理所有包
yarn clean
```

### 包特定命令

```bash
# 运行特定包的开发服务器
yarn workspace demo-react-vite dev

# 构建特定包
yarn workspace demo-electron-vite build

# 运行特定包的测试
yarn workspace demo-expo-app test
```

## 子包说明

### demo-expo-app

基于 Expo 的 React Native 应用，支持 iOS、Android 和 Web。

```bash
# 运行开发服务器
yarn workspace demo-expo-app start

# 运行 iOS 模拟器
yarn workspace demo-expo-app ios

# 运行 Android 模拟器
yarn workspace demo-expo-app android
```

### demo-tauri-app

基于 Tauri 的桌面应用，使用 Rust 作为后端，React 作为前端。

```bash
# 运行开发服务器
yarn workspace demo-tauri-app dev

# 构建应用
yarn workspace demo-tauri-app build

# 运行 Tauri 开发
yarn workspace demo-tauri-app tauri dev
```

### demo-electron-vite

基于 Electron 和 Vite 的桌面应用。

```bash
# 运行开发服务器
yarn workspace demo-electron-vite dev

# 构建应用
yarn workspace demo-electron-vite build
```

### demo-react-vite

基于 React 和 Vite 的 Web 应用。

```bash
# 运行开发服务器
yarn workspace demo-react-vite dev

# 构建应用
yarn workspace demo-react-vite build
```

### demo-taro-react

基于 Taro 的多端应用，支持小程序、H5 等平台。

```bash
# 运行 H5 开发服务器
yarn workspace demo-taro-react dev:h5

# 构建微信小程序
yarn workspace demo-taro-react build:weapp
```

## CI/CD

项目配置了多个 GitHub Actions 工作流：

- `ci.yaml`: 通用 CI 工作流，运行 lint 和测试
- `expo-app.yaml`: Expo 应用的特定工作流
- `tauri-app.yaml`: Tauri 应用的特定工作流
- `electron-vite.yaml`: Electron 应用的特定工作流
- `react-vite.yaml`: React Vite 应用的特定工作流
- `taro-react.yaml`: Taro React 应用的特定工作流
- `split.yaml`: 仓库拆分工作流，将各个包同步到独立仓库

## 仓库拆分

项目支持自动将每个包同步到独立的仓库。每当向主分支推送代码时，被修改的包将被同步到对应的独立仓库。

独立仓库列表：

- [demo-expo-app](https://github.com/umworks/demo-expo-app)
- [demo-tauri-app](https://github.com/umworks/demo-tauri-app)
- [demo-electron-vite](https://github.com/umworks/demo-electron-vite)
- [demo-react-vite](https://github.com/umworks/demo-react-vite)
- [demo-taro-react](https://github.com/umworks/demo-taro-react)

## 贡献指南

请参阅 [CONTRIBUTING.md](./CONTRIBUTING.md) 文件了解如何贡献代码。

## 许可证

MIT
