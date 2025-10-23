# OTP登录问题分析报告

## 问题症状

- 错误：Failed to sendOTP
- 500错误：POST https://rainwish.top/api/auth/email-otp/send-verification-otp
- 前端显示"Failed to sendOTP"

## 根本原因分析

### 1. 环境变量缺失问题

通过分析代码发现，生产环境缺少关键的环境变量：

**在 `apps/api/wrangler.jsonc` 中缺失：**

- `BETTER_AUTH_SECRET` - Better Auth必需的密钥
- `GOOGLE_CLIENT_ID` - Google OAuth客户端ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth客户端密钥
- `OPENAI_API_KEY` - OpenAI API密钥
- `RESEND_API_KEY` - Resend邮件服务API密钥

### 2. 邮件服务配置问题

在 `apps/api/lib/email.ts` 中，`sendOTP` 函数依赖：

- `RESEND_API_KEY` - 用于发送邮件
- `RESEND_EMAIL_FROM` - 发件人地址

但生产环境的 `wrangler.jsonc` 中只配置了 `RESEND_EMAIL_FROM`，缺少 `RESEND_API_KEY`。

### 3. 认证服务初始化问题

在 `apps/api/lib/auth.ts` 中，`createAuth` 函数需要：

- `BETTER_AUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `RESEND_API_KEY`
- `RESEND_EMAIL_FROM`

缺少这些变量会导致认证服务无法正常初始化。

### 4. 环境变量验证问题

在 `apps/api/lib/env.ts` 中定义了严格的环境变量验证，但生产环境没有提供所有必需的变量。

## 问题流程

1. 用户点击"Continue with email"
2. 前端调用 `/api/auth/email-otp/send-verification-otp`
3. API服务尝试初始化认证服务
4. 由于缺少 `RESEND_API_KEY` 等环境变量，邮件发送失败
5. 返回500错误

## 解决方案

需要在 Cloudflare Workers 生产环境中配置缺失的环境变量。
