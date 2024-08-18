# Three.js 狼控制游戏

[English](./README.md) | [简体中文](./README_zh.md)

这是一个使用 Three.js 和 Next.js 构建的互动 3D 游戏，特色在于可控制的狼模型和各种 3D 对象。

## 功能

预览： preview: https://threejs-wolf-control.netlify.app/

![画面収録 2024-08-16 22 11 27 (3)](https://github.com/user-attachments/assets/5b8fe404-d1e8-40a9-96a3-30e1be14f605)

- **🐺 狼的控制**: 
  - 使用 `方向键 (↑↓←→)` 来移动狼
  - 按住 `Shift 键` 让狼跑动
  - 使用 `空格键` 让狼坐下或站起来
- **✨ 3D 环境**: 
  - 包含动态星空背景、建筑物和地面。
- **🖥 响应式设计**: 
  - 无缝适配不同屏幕尺寸。

## 开始使用

### 前提条件

- Node.js (v14 或更高版本)
- npm (v6 或更高版本)

### 安装步骤

1. 克隆这个仓库：

    ```bash
    git clone https://github.com/mooncat126/threejs-next-control-game.git
    cd threejs-next-control-game
    ```

2. 安装依赖项：

    ```bash
    npm install
    ```

3. 启动开发服务器：

    ```bash
    npm run dev
    ```

4. 打开 [http://localhost:3000](http://localhost:3000) 在本地查看项目。

### 部署

这个项目已经部署在 GitHub Pages 上。要部署你自己的版本，请按以下步骤操作：

1. 在 `package.json` 中更新 `homepage` 字段，使用你自己的仓库信息。
2. 构建并部署：

    ```bash
    npm run deploy
    ```

你的项目将会部署在 `https://mooncat126.github.io/threejs-next-control-game`。

## 许可协议

此项目基于 MIT 许可协议。
