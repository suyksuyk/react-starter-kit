# OTP登录修复部署指南

## 问题已修复

我已经修复了导致OTP登录失败的问题，主要改进包括：

### 1. 环境变量配置

- 在 `apps/api/wrangler.jsonc` 中添加了缺失的环境变量占位符
- 改进了错误处理，提供清晰的错误信息

### 2. 错误处理改进

- 在 `apps/api/lib/email.ts` 中添加了详细的环境变量验证
- 在 `apps/api/lib/auth.ts` 中添加了认证服务初始化验证
- 提供了详细的调试日志

## 需要配置的环境变量

### 必需的环境变量

请在 Cloudflare Workers 控制台中配置以下环境变量：

```bash
# Better Auth 密钥 (必需)
BETTER_AUTH_SECRET=your-actual-better-auth-secret-here

# Google OAuth 配置 (必需)
GOOGLE_CLIENT_ID=your-actual-google-client-id-here
GOOGLE_CLIENT_SECRET=your-actual-google-client-secret-here

# Resend 邮件服务 (必需)
RESEND_API_KEY=your-actual-resend-api-key-here
RESEND_EMAIL_FROM=onboarding@resend.dev

# OpenAI API (可选)
OPENAI_API_KEY=your-actual-openai-api-key-here
```

### 如何获取这些值

#### 1. BETTER_AUTH_SECRET

```bash
# 使用 Better Auth CLI 生成新密钥
bunx @better-auth/cli@latest secret
```

#### 2. Google OAuth 凭据

1. 访问 [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. 创建新的 OAuth 2.0 客户端 ID
3. 添加授权的重定向 URI：`https://rainwish.top/api/auth/callback/google`

#### 3. Resend API 密钥

1. 访问 [Resend Dashboard](https://resend.com/api-keys)
2. 创建新的 API 密钥
3. 确认发件人域名已验证

#### 4. OpenAI API 密钥 (可选)

1. 访问 [OpenAI Platform](https://platform.openai.com/api-keys)
2. 创建新的 API 密钥

## 部署步骤

### 1. 配置 Cloudflare Workers 环境变量

```bash
# 使用 Wrangler CLI 设置环境变量
bun wrangler secret put BETTER_AUTH_SECRET
bun wrangler secret put GOOGLE_CLIENT_ID
bun wrangler secret put GOOGLE_CLIENT_SECRET
bun wrangler secret put RESEND_API_KEY
bun wrangler secret put OPENAI_API_KEY
```

### 2. 部署 API 服务

```bash
cd apps/api
bun wrangler deploy
```

### 3. 验证部署

```bash
# 测试健康检查
curl https://rainwish.top/api/health

# 测试认证配置
curl https://rainwish.top/api/auth-test
```

## 测试 OTP 功能

### 1. 手动测试

1. 访问 `https://rainwish.top`
2. 点击 "Continue with email"
3. 输入邮箱地址
4. 检查是否收到 OTP 邮件

### 2. API 测试

```bash
# 测试发送 OTP
curl -X POST https://rainwish.top/api/auth/email-otp/send-verification-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

## 故障排除

### 常见错误及解决方案

#### 1. "RESEND_API_KEY environment variable is required"

**原因**：缺少 Resend API 密钥
**解决**：按照上述步骤配置 RESEND_API_KEY

#### 2. "BETTER_AUTH_SECRET environment variable is required"

**原因**：缺少 Better Auth 密钥
**解决**：使用 CLI 生成新密钥并配置

#### 3. Google OAuth 错误

**原因**：Google OAuth 配置不正确
**解决**：检查客户端 ID、密钥和重定向 URI

### 调试工具

#### 1. 查看日志

```bash
bun wrangler tail
```

#### 2. 测试端点

- 健康检查：`/api/health`
- 认证测试：`/api/auth-test`
- 数据库测试：`/api/db-test`

## 安全注意事项

1. **永远不要**在代码中提交真实的 API 密钥
2. 使用 Cloudflare Workers Secrets 存储敏感信息
3. 定期轮换 API 密钥
4. 限制 API 密钥的权限范围

## 监控和维护

1. 定期检查邮件发送成功率
2. 监控认证错误日志
3. 验证环境变量配置
4. 测试完整的登录流程

## 联系支持

如果遇到问题，请检查：

1. Cloudflare Workers 日志
2. Resend 邮件发送日志
3. Google OAuth 控制台
4. 环境变量配置是否正确
