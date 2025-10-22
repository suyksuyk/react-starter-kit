# DNS 配置说明 - rainwish.top

## 问题诊断

**根本原因**：`rainwish.top` 域名无法解析，DNS配置缺失

**症状**：

- ✅ `https://rainwish-api.sydneiholdengi87033.workers.dev/health` 正常访问
- ❌ `https://rainwish.top/api/health` 无法访问
- ❌ `nslookup rainwish.top` 超时

## 解决步骤

### 1. 添加域名到Cloudflare

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 点击 "Add a site"
3. 输入域名：`rainwish.top`
4. 选择免费计划
5. 继续设置

### 2. 更新域名服务器

Cloudflare会提供两个域名服务器，类似：

```
anna.ns.cloudflare.com
bob.ns.cloudflare.com
```

在你的域名注册商处更新NS记录到Cloudflare提供的服务器。

### 3. 配置DNS记录

在Cloudflare DNS管理中添加以下记录：

```
类型    名称            内容              代理状态
A      rainwish.top    192.0.2.1         已代理 (橙色云朵)
AAAA   rainwish.top    100::             已代理 (橙色云朵)
```

**注意**：使用Cloudflare保留IP地址，因为Worker通过Cloudflare代理处理请求。

### 4. 验证配置

#### 4.1 检查DNS解析

```bash
nslookup rainwish.top
```

应该返回Cloudflare的IP地址。

#### 4.2 测试API端点

```bash
curl https://rainwish.top/api/health
```

#### 4.3 测试完整API

```bash
curl https://rainwish.top/api
```

## 当前状态

### ✅ 已完成

- API代码部署成功
- 路由配置正确：`rainwish.top/api*`
- 环境变量已更新
- CORS配置正确

### ❌ 待完成

- 域名DNS配置
- 域名服务器更新
- DNS传播验证

## 预期结果

配置完成后，以下端点应该可以正常访问：

| 端点     | URL                               |
| -------- | --------------------------------- |
| 健康检查 | `https://rainwish.top/api/health` |
| API信息  | `https://rainwish.top/api`        |
| tRPC API | `https://rainwish.top/api/trpc/*` |
| 认证     | `https://rainwish.top/api/auth/*` |

## 故障排除

### 如果DNS配置后仍无法访问

1. **检查DNS传播**：

   ```bash
   dig rainwish.top
   ```

2. **检查SSL证书**：
   - 在浏览器中访问 `https://rainwish.top`
   - 检查证书是否由Cloudflare颁发

3. **检查Cloudflare代理状态**：
   - 确保DNS记录是橙色云朵（已代理）
   - 不是灰色云朵（DNS only）

4. **检查Worker路由**：
   ```bash
   cd apps/api
   bun wrangler deploy
   ```
   确认输出包含：`rainwish.top/api* (zone name: rainwish.top)`

## 时间估算

- DNS服务器更新：5分钟 - 24小时
- DNS传播：5分钟 - 1小时
- SSL证书生成：自动完成

## 联系支持

如果遇到问题，可以：

1. 检查Cloudflare状态页面
2. 联系Cloudflare支持
3. 检查域名注册商设置
