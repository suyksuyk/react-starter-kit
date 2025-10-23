# 项目架构分析与部署路径配置方案

## 项目整体架构分析

### 应用职责分工

#### 1. apps/api - 后端API服务

- **技术栈**: Hono + tRPC + Drizzle ORM + Better Auth
- **功能**: 提供RESTful API和GraphQL查询接口
- **当前部署**: `rainwish.top/api/*`
- **特点**:
  - 处理所有业务逻辑和数据操作
  - 用户认证和授权
  - 数据库操作（通过HyperDrive）
  - 邮件发送服务

#### 2. apps/app - 主应用（SPA）

- **技术栈**: React + TanStack Router + TanStack Query + tRPC Client
- **功能**:
  - 用户登录后的主要应用界面
  - 包含dashboard、users、reports、settings等功能模块
  - 完整的用户交互功能
- **当前配置**: 主域名 `rainwish.top/*`
- **特点**:
  - 单页应用（SPA）
  - 与API通过tRPC通信
  - 需要用户认证

#### 3. apps/web - 营销网站

- **技术栈**: Astro + React
- **功能**:
  - 静态营销页面
  - 包含index、about、features、pricing页面
  - 主要用于产品展示和用户获取
- **当前配置**: `www.rainwish.top/*`
- **特点**:
  - 静态站点生成（SSG）
  - 无需用户认证
  - SEO友好

## 依赖关系分析

```
apps/web (营销网站)
    ↓ (引导用户注册/登录)
apps/app (主应用)
    ↓ (tRPC调用)
apps/api (后端服务)
    ↓ (数据操作)
Database (PostgreSQL via HyperDrive)
```

## 当前部署状态

### 已部署

- ✅ **API**: `rainwish.top/api/*` - 正常运行

### 待部署

- ⏳ **App**: 需要配置路径
- ⏳ **Web**: 需要配置路径

## 路径配置方案设计

### 方案原则

1. **高内聚**: 每个应用职责明确，功能集中
2. **低耦合**: 应用间通过标准API接口通信
3. **最小化改动**: 尽量保持现有代码结构
4. **可扩展**: 支持未来新应用的添加
5. **用户体验**: URL结构清晰，符合用户预期

### 推荐路径配置

#### 方案A：子域名分离（推荐）

```
API:    api.rainwish.top/*         (后端服务)
App:    app.rainwish.top/*         (主应用)
Web:    rainwish.top/*             (营销网站)
```

**优势:**

- 职责分离清晰
- 便于CDN缓存策略
- 支持独立部署和扩展
- 符合微服务架构理念

#### 方案B：路径分离

```
API:    rainwish.top/api/*         (后端服务)
App:    rainwish.top/app/*         (主应用)
Web:    rainwish.top/*             (营销网站)
```

**优势:**

- 统一域名
- SEO友好
- 减少跨域问题

### 最终推荐方案：混合模式

考虑到已部署的API在 `rainwish.top/api/*`，为了最小化改动，推荐采用混合模式：

```
API:    rainwish.top/api/*         (已部署，保持不变)
App:    app.rainwish.top/*         (主应用，新部署)
Web:    rainwish.top/*             (营销网站，调整部署)
```

**配置理由:**

1. **API保持不变** - 避免影响现有功能
2. **App使用子域名** - 支持SPA特性，便于缓存管理
3. **Web使用主域名** - 有利于SEO和用户访问

## 实施步骤

### 第一阶段：部署App应用

1. 配置apps/app的wrangler.jsonc
2. 部署到app.rainwish.top
3. 验证与API的集成

### 第二阶段：调整Web应用

1. 更新apps/web的wrangler.jsonc
2. 重新部署到主域名
3. 确保与App应用的衔接

### 第三阶段：系统验证

1. 测试跨应用导航
2. 验证认证流程
3. 性能和安全检查

## 技术配置细节

### App应用配置要点

- 单页应用模式（SPA）
- 路由处理：`not_found_handling: "single-page-application"`
- API集成：通过tRPC连接到 `rainwish.top/api`
- 认证：Cookie-based认证

### Web应用配置要点

- 静态站点生成
- SEO优化
- 引导用户到App应用
- 无需认证

## 风险评估与缓解

### 潜在风险

1. **跨域问题** - API与App在不同域名
2. **认证Cookie** - 跨子域名共享
3. **缓存冲突** - 不同应用的缓存策略

### 缓解措施

1. **CORS配置** - 在API中正确配置跨域
2. **Cookie域设置** - 设置为`.rainwish.top`
3. **缓存策略** - 为不同应用设置不同的缓存规则

## 下一步行动

按照用户要求，先部署App应用。需要：

1. 配置apps/app的wrangler.jsonc
2. 执行部署命令
3. 验证部署结果
