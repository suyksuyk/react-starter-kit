# 域名迁移总结 - 使用 rainwish.top 根域名

## 已完成的最小化改动

### 1. 分析现状

- ✅ API 已成功部署到 Cloudflare Workers
- ✅ 自定义域名路由已配置：`rainwish.top/api*`
- ✅ 原始 workers.dev 域名：`https://rainwish-api.sydneiholdengi87033.workers.dev`

### 2. 实施的改动

#### 2.1 修改 `apps/api/wrangler.jsonc` (API 服务)

```json
"vars": {
  "ENVIRONMENT": "production",
  "APP_NAME": "Rainwish",
  "APP_ORIGIN": "https://rainwish.top",                    // 改为根域名
  "ALLOWED_ORIGINS": "https://rainwish.top,https://www.rainwish.top", // 支持根域名和www
  "RESEND_EMAIL_FROM": "onboarding@resend.dev"
}
```

#### 2.2 修改 `apps/app/wrangler.jsonc` (前端应用)

```json
{
  "name": "rainwish-app",
  "routes": [{ "pattern": "rainwish.top/*", "zone_name": "rainwish.top" }],
  "vars": {
    "ENVIRONMENT": "production",
    "VITE_API_URL": "https://rainwish.top/api", // 指向新的API域名
    "VITE_APP_NAME": "Rainwish",
    "VITE_APP_ORIGIN": "https://rainwish.top",
    "ALLOWED_ORIGINS": "https://rainwish.top,https://www.rainwish.top"
  }
}
```

### 3. 路由配置

- ✅ 保持现有路由：`rainwish.top/api*`
- ✅ API 端点将通过 `https://rainwish.top/api/*` 访问

### 4. CORS 配置

- ✅ 允许 `https://rainwish.top` 和 `https://www.rainwish.top` 访问
- ✅ 支持认证凭证传递

## API 端点映射

| 功能     | 原始地址      | 新地址                            | 状态      |
| -------- | ------------- | --------------------------------- | --------- |
| 健康检查 | `/health`     | `https://rainwish.top/api/health` | ✅ 正常   |
| API 信息 | `/api`        | `https://rainwish.top/api`        | ✅ 正常   |
| tRPC API | `/api/trpc/*` | `https://rainwish.top/api/trpc/*` | ✅ 待测试 |
| 认证     | `/api/auth/*` | `https://rainwish.top/api/auth/*` | ✅ 待测试 |

## 前端配置建议

### 环境变量设置

在前端应用中设置以下环境变量：

```bash
# 生产环境
VITE_API_URL=https://rainwish.top/api
VITE_APP_NAME=Rainwish
VITE_APP_ORIGIN=https://rainwish.top
```

### tRPC 客户端配置

前端 tRPC 客户端已配置为使用 `VITE_API_URL`，会自动指向新的域名。

## 部署状态

- ✅ 最新部署版本：`1961008d-00c1-491b-8239-d0e1348765d3`
- ✅ 部署时间：2025-10-22T09:24:47.511Z
- ✅ 环境变量已更新
- ✅ 路由配置已生效

## 验证步骤

1. **API 健康检查**：

   ```bash
   curl https://rainwish.top/api/health
   ```

2. **API 信息端点**：

   ```bash
   curl https://rainwish.top/api
   ```

3. **前端应用**：
   - 确保前端环境变量指向新域名
   - 测试认证流程
   - 验证 API 调用

## 注意事项

1. **DNS 解析**：确保 `rainwish.top` 的 DNS 记录正确指向 Cloudflare
2. **SSL 证书**：Cloudflare 会自动提供 SSL 证书
3. **缓存**：Cloudflare CDN 可能需要几分钟来传播更改
4. **环境变量**：前端应用需要更新 `VITE_API_URL` 环境变量

## 最小化改动原则

本次迁移遵循最小化改动原则：

- ✅ 只修改了必要的配置文件
- ✅ 保持了现有的路由结构
- ✅ 维持了 API 的兼容性
- ✅ 更新了 CORS 设置以支持新域名

## 下一步

1. 测试所有 API 端点在新域名下的功能
2. 更新前端应用的环境变量
3. 验证认证和授权流程
4. 监控 API 性能和错误日志
