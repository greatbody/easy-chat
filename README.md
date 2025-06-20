# Easy Chat - 简易聊天室

一个基于 Deno 的服务端渲染（SSR）实时聊天室应用。

## 🌟 功能特点

- ✨ **实时消息传递** - 基于 WebSocket 的即时通信
- 👥 **在线用户显示** - 实时显示当前在线用户列表
- 🚀 **无需注册** - 输入用户名即可开始聊天
- 📱 **移动端优化** - 完美支持手机和平板设备
- 🔒 **安全防护** - HTML 转义防止 XSS 攻击
- 💾 **内存存储** - 所有数据存储在内存中，无需数据库
- 🎨 **现代界面** - 美观的渐变色设计
- 🌙 **深色模式** - 自动适配系统主题
- 📲 **PWA 支持** - 可安装到手机主屏幕
- ♿ **无障碍访问** - 支持屏幕阅读器和键盘导航

## 🛠️ 技术栈

- **运行时**: Deno 2.0+
- **后端**: Deno 内置 HTTP 服务器
- **WebSocket**: Deno 内置 WebSocket 支持
- **模板引擎**: 自定义 SSR 模板系统
- **前端**: 原生 HTML/CSS/JavaScript
- **测试**: Deno 内置测试框架

## 📁 项目结构

```
easy-chat/
├── src/
│   ├── main.ts              # 应用入口点
│   ├── router.ts            # HTTP 路由处理
│   ├── websocket.ts         # WebSocket 连接处理
│   ├── chat-room.ts         # 聊天室核心逻辑
│   ├── template.ts          # SSR 模板引擎
│   └── types.ts             # TypeScript 类型定义
├── templates/
│   ├── home.html            # 首页模板
│   └── chat.html            # 聊天室模板
├── static/
│   └── css/
│       └── style.css        # 样式文件
├── tests/
│   ├── chat-room.test.ts    # 聊天室单元测试
│   ├── template.test.ts     # 模板引擎测试
│   └── integration.test.ts  # 集成测试
├── deno.json                # Deno 配置文件
└── README.md                # 项目文档
```

## 🚀 快速开始

### 前置要求

- [Deno](https://deno.land/) 2.0 或更高版本

### 安装和运行

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd easy-chat
   ```

2. **启动开发服务器**
   ```bash
   deno task dev
   ```
   或者
   ```bash
   deno run --allow-net --allow-read --allow-env --watch src/main.ts
   ```

3. **访问应用**
   打开浏览器访问 [http://localhost:8000](http://localhost:8000)

### 生产环境运行

```bash
deno task start
```

或者

```bash
deno run --allow-net --allow-read --allow-env src/main.ts
```

### 自定义端口

```bash
PORT=3000 deno task start
```

## 🧪 测试

### 运行所有测试

```bash
deno task test
```

### 运行单元测试

```bash
deno test --allow-net --allow-read tests/chat-room.test.ts tests/template.test.ts
```

### 运行集成测试

```bash
deno test --allow-net --allow-read --allow-run --allow-env tests/integration.test.ts
```

### 监听模式测试

```bash
deno task test:watch
```

## 📖 使用说明

### 基本使用

1. 访问首页 `http://localhost:8000`
2. 输入用户名（支持中文、英文、数字、下划线和连字符）
3. 点击"进入聊天室"
4. 开始聊天！

### 功能说明

- **用户名规则**: 1-20个字符，支持中文、英文、数字、下划线和连字符
- **消息长度**: 最多500个字符
- **历史消息**: 系统保留最近100条消息
- **在线用户**: 实时显示当前在线用户列表
- **自动重连**: WebSocket 连接断开时会显示提示

### 移动端特性

- **响应式布局**: 自动适配不同屏幕尺寸
- **触摸优化**: 优化的触摸交互和手势支持
- **键盘适配**: 智能处理虚拟键盘弹出和收起
- **PWA 支持**: 可添加到主屏幕，离线提示
- **横竖屏适配**: 支持设备旋转时的布局调整
- **深色模式**: 自动检测系统主题偏好
- **性能优化**: 针对移动设备的滚动和渲染优化
- **无障碍支持**: 支持屏幕阅读器和辅助功能

### API 端点

- `GET /` - 首页
- `GET /chat?username=<用户名>` - 聊天室页面
- `GET /static/*` - 静态文件服务
- `WebSocket /ws?username=<用户名>` - WebSocket 连接

## 🔧 开发

### 添加新功能

1. 在 `src/` 目录下添加新的模块
2. 更新 `src/types.ts` 中的类型定义
3. 在 `tests/` 目录下添加相应的测试
4. 更新文档

### 代码规范

- 使用 TypeScript 严格模式
- 遵循 Deno 最佳实践
- 为所有公共函数添加 JSDoc 注释
- 保持测试覆盖率

## 🐛 故障排除

### 常见问题

1. **端口被占用**
   ```bash
   Error: Address already in use
   ```
   解决方案：更改端口或停止占用端口的进程
   ```bash
   PORT=3000 deno task start
   ```

2. **WebSocket 连接失败**
   - 检查防火墙设置
   - 确保服务器正在运行
   - 检查浏览器控制台错误信息

3. **用户名重复**
   - 系统会自动拒绝重复的用户名
   - 尝试使用不同的用户名

### 调试

启用详细日志：
```bash
DENO_LOG=debug deno task start
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [Deno](https://deno.land/) - 现代的 JavaScript/TypeScript 运行时
- [Deno Standard Library](https://deno.land/std) - 高质量的标准库

---

**Happy Chatting! 🎉**
