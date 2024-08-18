# Three.js 办公场景 (Vue.js)
[English](./README.md) | [简体中文](./README_zh.md)

这个项目展示了一个使用 Vue.js 和 Three.js 构建的 3D 办公场景。它具有交互元素，如旋转的椅子、动画视频屏幕，以及通过动态光照和材质效果切换主题的功能。

## 功能特色

预览地址: https://threejs-office-scene.netlify.app/

![画面収録 2024-08-18 20 08 15](https://github.com/user-attachments/assets/adcca174-7ddf-490a-8096-4383978885e1)

- **💡 可控的台灯**: 
  - 点击台灯以打开或关闭
- **✨ 3D 环境**: 
  - 包含动态背景和地面平面。
- **🖥 响应式设计**: 
  - 在不同屏幕尺寸下无缝工作。

## 入门指南

### 先决条件

- Node.js (v14 或更高版本)
- npm (v6 或更高版本)

### 安装步骤

1. 克隆此仓库：

    ```bash
    git clone https://github.com/mooncat126/threejs-next-control-game.git
    cd threejs-next-control-game/office-scene-vue-model
    ```

2. 安装依赖：

    ```bash
    npm install
    ```

3. 运行开发服务器：

    ```bash
    npm run serve
    ```

4. 打开 [http://localhost:8080/](http://localhost:8080/) 以在本地查看项目。

### 部署

此项目部署在 GitHub Pages 上。要部署你自己的版本：

1. 在 `package.json` 中更新 `homepage` 字段，填写你的仓库详细信息。
2. 构建并部署：

    ```bash
    npm run deploy
    ```

## 许可证

此项目基于 MIT 许可证开源。
