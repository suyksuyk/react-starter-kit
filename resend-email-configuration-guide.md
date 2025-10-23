# RESEND_EMAIL_FROM 配置详解

## 什么是 RESEND_EMAIL_FROM？

`RESEND_EMAIL_FROM` 是发送邮件时显示的"发件人"邮箱地址。它告诉收件人这封邮件是从哪个地址发送的。

## 重要：不能随便填写！

**不，不能随便填写！** Resend有严格的域名验证机制：

### 1. 必须使用已验证的域名

- 只能使用你在Resend中验证过的域名
- 不能随意使用任意邮箱地址
- 必须证明你拥有该域名的发送权限

### 2. 当前配置分析

```bash
RESEND_EMAIL_FROM="onboarding@resend.dev"
```

这个地址有问题，因为：

- `resend.dev` 是Resend的域名
- 你没有权限使用这个域名发送邮件
- Resend会拒绝发送

## 正确的配置步骤

### 步骤1：在Resend中添加并验证域名

1. **登录Resend控制台**：https://resend.com/domains
2. **添加你的域名**：
   ```
   比如你的网站是 rainwish.top
   就添加 rainwish.top
   ```
3. **配置DNS记录**：
   Resend会提供DNS记录，你需要在你的域名提供商那里添加：

   ```
   类型：TXT
   名称：_dmarc.rainwish.top
   值：v=DMARC1; p=none

   类型：TXT
   名称：resend.rainwish.top
   值：resend-verification=xxxxx
   ```

### 步骤2：验证域名

- 等待DNS传播（通常几分钟到几小时）
- 在Resend控制台点击验证

### 步骤3：使用正确的发件人地址

验证成功后，可以使用以下格式的地址：

```bash
# 通用格式
RESEND_EMAIL_FROM="noreply@yourdomain.com"
RESEND_EMAIL_FROM="support@yourdomain.com"
RESEND_EMAIL_FROM="onboarding@yourdomain.com"

# 你的具体例子
RESEND_EMAIL_FROM="noreply@rainwish.top"
RESEND_EMAIL_FROM="support@rainwish.top"
RESEND_EMAIL_FROM="onboarding@rainwish.top"
```

## 临时解决方案：使用Resend免费域名

如果你还没有自己的域名，Resend提供免费的开发域名：

```bash
RESEND_EMAIL_FROM="onboarding@resend.dev"
```

**但是**：

- 只能发送到注册时验证的邮箱地址
- 不能发送给任意收件人
- 仅适合开发测试

## 推荐的生产配置

```bash
# 生产环境（推荐）
RESEND_EMAIL_FROM="noreply@rainwish.top"

# 或者更友好的
RESEND_EMAIL_FROM="support@rainwish.top"
```

## 如何检查配置是否正确？

1. **查看Resend域名状态**：
   - 访问 https://resend.com/domains
   - 确认域名状态为 "Verified"

2. **测试邮件发送**：
   ```bash
   curl -X POST https://api.resend.com/emails \
     -H "Authorization: Bearer re_xxxxx" \
     -H "Content-Type: application/json" \
     -d '{
       "from": "noreply@yourdomain.com",
       "to": "test@example.com",
       "subject": "Test",
       "html": "<p>Test email</p>"
     }'
   ```

## 常见错误

### ❌ 错误配置

```bash
# 使用未验证的域名
RESEND_EMAIL_FROM="test@gmail.com"

# 使用Resend的域名（无权限）
RESEND_EMAIL_FROM="onboarding@resend.dev"

# 格式不正确
RESEND_EMAIL_FROM="rainwish.top"
```

### ✅ 正确配置

```bash
# 使用已验证的域名
RESEND_EMAIL_FROM="noreply@rainwish.top"

# 包含发件人名称
RESEND_EMAIL_FROM="Rainwish <noreply@rainwish.top>"
```

## 总结

**RESEND_EMAIL_FROM 必须：**

1. 使用你在Resend中验证过的域名
2. 不能随便填写
3. 需要完成DNS验证
4. 建议使用 `noreply@yourdomain.com` 或 `support@yourdomain.com`

这是邮件发送成功的关键配置，必须正确设置！
