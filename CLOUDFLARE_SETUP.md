# Cloudflare Tunnel 配置指南

本文档说明如何通过 Cloudflare Tunnel 部署 Easy Chat 聊天室。

## 🌐 Cloudflare Tunnel 设置

### 1. 安装 Cloudflared

```bash
# macOS
brew install cloudflare/cloudflare/cloudflared

# Linux
wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb

# Windows
# 下载 cloudflared.exe 并添加到 PATH
```

### 2. 登录 Cloudflare

```bash
cloudflared tunnel login
```

### 3. 创建隧道

```bash
cloudflared tunnel create easy-chat
```

### 4. 配置隧道

创建配置文件 `~/.cloudflared/config.yml`:

```yaml
tunnel: easy-chat
credentials-file: /path/to/your/credentials.json

ingress:
  - hostname: your-domain.com
    service: http://localhost:8000
    originRequest:
      # 重要：启用 WebSocket 支持
      noTLSVerify: false
      connectTimeout: 30s
      tlsTimeout: 10s
      tcpKeepAlive: 30s
      keepAliveConnections: 10
      keepAliveTimeout: 90s
      httpHostHeader: your-domain.com
  - service: http_status:404
```

### 5. 设置 DNS 记录

```bash
cloudflared tunnel route dns easy-chat your-domain.com
```

### 6. 启动隧道

```bash
cloudflared tunnel run easy-chat
```

## ⚙️ WebSocket 配置要点

### 1. 确保 WebSocket 支持

Cloudflare 默认支持 WebSocket，但需要确保：

- 使用正确的协议（WSS for HTTPS）
- 设置适当的超时时间
- 启用 Keep-Alive 连接

### 2. 应用配置

Easy Chat 已经自动处理了以下问题：

- **协议自动检测**: 根据页面协议自动选择 `ws://` 或 `wss://`
- **重连机制**: 连接断开时自动重连
- **错误处理**: 友好的错误提示和状态显示

### 3. 调试 WebSocket 连接

如果遇到连接问题，检查浏览器开发者工具：

```javascript
// 在浏览器控制台中检查 WebSocket 状态
console.log('WebSocket state:', ws.readyState);
// 0: CONNECTING, 1: OPEN, 2: CLOSING, 3: CLOSED
```

## 🔧 常见问题解决

### 问题 1: WebSocket 连接失败

**症状**: 页面加载正常，但无法发送消息或看到在线用户

**解决方案**:
1. 检查 Cloudflare Tunnel 配置中的 WebSocket 设置
2. 确认域名 DNS 记录正确指向隧道
3. 检查服务器日志中的 WebSocket 升级请求

### 问题 2: 连接频繁断开

**症状**: 连接建立后很快断开，频繁重连

**解决方案**:
1. 增加 `keepAliveTimeout` 设置
2. 检查网络稳定性
3. 确认服务器资源充足

### 问题 3: 无法访问应用

**症状**: 域名无法访问或返回 404

**解决方案**:
1. 确认隧道正在运行: `cloudflared tunnel list`
2. 检查 DNS 记录: `nslookup your-domain.com`
3. 验证服务器在本地正常运行

## 📊 监控和日志

### 1. Cloudflare 仪表板

在 Cloudflare 仪表板中监控：
- 流量统计
- 错误率
- 响应时间

### 2. 服务器日志

Easy Chat 会记录 WebSocket 连接信息：

```bash
# 查看服务器日志
deno run --allow-net --allow-read --allow-env src/main.ts
```

### 3. 客户端调试

在浏览器中启用详细日志：

```javascript
// 在控制台中启用 WebSocket 调试
localStorage.setItem('debug', 'websocket');
```

## 🚀 性能优化

### 1. Cloudflare 设置

- 启用 Brotli 压缩
- 配置适当的缓存规则
- 使用 Cloudflare Workers（可选）

### 2. 应用优化

- 启用 gzip 压缩
- 优化静态资源缓存
- 使用 CDN 加速静态文件

## 🔒 安全考虑

### 1. HTTPS 强制

确保所有连接都通过 HTTPS：

```yaml
# 在 config.yml 中添加
ingress:
  - hostname: your-domain.com
    service: http://localhost:8000
    originRequest:
      httpHostHeader: your-domain.com
      # 强制 HTTPS
      originServerName: your-domain.com
```

### 2. 访问控制

可以通过 Cloudflare Access 添加身份验证：

```yaml
# 添加访问策略
ingress:
  - hostname: your-domain.com
    service: http://localhost:8000
    originRequest:
      access:
        required: true
        teamName: your-team
```

## 📝 示例配置

完整的 `config.yml` 示例：

```yaml
tunnel: easy-chat
credentials-file: ~/.cloudflared/easy-chat.json

ingress:
  - hostname: chat.yourdomain.com
    service: http://localhost:8000
    originRequest:
      connectTimeout: 30s
      tlsTimeout: 10s
      tcpKeepAlive: 30s
      keepAliveConnections: 10
      keepAliveTimeout: 90s
      httpHostHeader: chat.yourdomain.com
      noTLSVerify: false
  - service: http_status:404

# 可选：自动更新
autoupdate-freq: 24h
```

## 🆘 获取帮助

如果仍然遇到问题：

1. 检查 [Cloudflare 文档](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
2. 查看服务器和客户端日志
3. 在 GitHub Issues 中报告问题

---

**注意**: 确保你的域名已经添加到 Cloudflare 并且 DNS 记录已经生效。
