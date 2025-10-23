# 登录重定向测试指南

## 调试版本已部署

调试版本已成功部署到生产环境，版本ID: `3577b68a-7d85-448e-b76d-faf2b4a7f6fe`

## 测试步骤

### 1. 打开浏览器开发者工具

1. 访问 `https://app.rainwish.top/login`
2. 按 F12 打开开发者工具
3. 切换到 "Console" 标签页

### 2. 执行登录测试

1. 输入邮箱地址（可以使用 test@rainwish.top）
2. 点击 "Continue with email"
3. 输入OTP验证码（如果是测试邮箱，检查邮件获取验证码）
4. 观察控制台输出

### 3. 关键调试信息

请查找以下调试日志：

#### 登录成功调试信息：

```
🔍 Login Success Debug:
- returnUrl: [值]
- redirect: [值]
- final destination: [值]
- window.location: [当前URL]
```

#### 表单处理调试信息：

```
🔍 useLoginForm.handleSuccess called
- has onSuccess callback: [true/false]
🔍 Calling onSuccess callback
```

#### Dashboard重定向调试信息：

```
🔍 Dashboard route accessed, redirecting to '/'
- current location: [URL]
```

### 4. 预期结果分析

#### 正常流程应该看到：

1. `useLoginForm.handleSuccess called`
2. `Calling onSuccess callback`
3. `Login Success Debug` 显示 destination 为 "/"
4. 如果访问了 `/dashboard`，会看到 dashboard 重定向日志

#### 异常流程可能看到：

1. destination 显示为 "/dashboard" 而不是 "/"
2. 看到 dashboard 重定向日志
3. 有其他重定向相关的错误信息

### 5. 问题定位

根据控制台输出，我们可以确定：

1. **重定向参数是否正确**：检查 `returnUrl` 和 `redirect` 的值
2. **目标路径是否正确**：检查 `final destination` 的值
3. **是否触发了dashboard重定向**：检查是否有dashboard相关日志
4. **是否有其他重定向逻辑**：检查是否有其他重定向相关的日志

### 6. 测试完成后

请将控制台的完整调试日志复制保存，这将帮助我们确定问题的根本原因并制定修复方案。

## 联系信息

如果测试过程中遇到任何问题，请提供：

1. 完整的控制台日志
2. 测试使用的邮箱地址
3. 具体的操作步骤
4. 浏览器类型和版本
