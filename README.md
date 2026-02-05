# venom-wxmp

venom-wxmp 是一个辅助微信小程序渗透测试与安全研究的工具小程序。它主要提供小程序跳转功能，支持手动输入 AppID 进行跳转，同时也集成了 Venom 协同模块，允许通过 WebSocket 接收指令自动跳转到指定小程序。

## 功能特性

- **手动跳转**：支持手动输入目标小程序的 AppID 和页面路径（Path），一键发起跳转进行测试。
- **Venom 协同 (WebSocket)**：集成 WebSocket 客户端，连接到 Venom 控制端后，可接收远程指令自动跳转。
- **心跳保活**：内置 WebSocket 心跳机制，保持连接稳定性。

## 目录结构

```text
venom-wxmp/
├── pages/
│   └── jump/           # 主要功能页（跳转 & WebSocket 连接）
├── utils/              # 工具函数
├── app.js              # 小程序入口逻辑
├── app.json            # 全局配置
└── project.config.json # 项目配置文件
```

## 快速开始

### 1. 环境准备

- 安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)。
- 拥有一个微信小程序账号（用于获取 AppID 以便在开发者工具中运行）。

### 2. 导入项目

1.  打开微信开发者工具。
2.  选择 **导入项目**。
3.  目录选择本项目根目录 (`venom-wxmp`)。
4.  **AppID**：填写你自己的测试小程序 AppID（测试号亦可）。
5.  点击 **确定** 打开项目。

### 3. 使用说明

#### 手动跳转模式

1.  在首屏 `jump` 页面中，找到 "目标 AppID" 输入框。
2.  输入你想要测试/跳转的目标小程序 **AppID** (必填)。
3.  (可选) 输入 **页面路径 Path** (例如 `pages/index/index`)，不填则默认进入首页。
4.  点击 **立即跳转** 按钮。

#### Venom 协同模式 (WebSocket)

1.  在页面底部的 "Venom 协同" 卡片中。
2.  输入 WebSocket 服务端地址 (格式如 `192.168.3.x:8080`)。
3.  点击 **连接**。
4.  连接成功后，小程序将监听服务端消息。
    - **指令格式 (JSON)**:
      ```json
      {
        "appId": "wx1234567890abcdef",
        "path": "pages/index/index"
      }
      ```
    - 收到指令后，小程序会自动尝试跳转到目标 AppID。

## 常见问题

- **跳转失败**：请确保当前小程序与目标小程序已关联（如果是正式版），或者在开发者工具中勾选了 "不校验合法域名、web-view（业务域名）、TLS版本以及HTTPS证书"。
- **WebSocket 连接失败**：请检查手机/模拟器与服务端是否在同一局域网，确保防火墙未拦截端口。

## 许可证

本项目采用 [MIT License](LICENSE) 开源许可证。允许自由分发与修改，但请保留原作者版权声明。
