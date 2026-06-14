# 第四章：RESTful API 设计基础

## 什么是 RESTful API

REST（Representational State Transfer）是一种面向资源的架构风格，定义了 API 设计的原则。

### 核心原则

1. **资源唯一标识** — 每个资源用唯一的 URL（URI）标识
2. **统一的接口** — 使用 HTTP 方法（GET/POST/PUT/DELETE）操作资源
3. **无状态** — 每个请求包含所有必要信息，服务端不保存客户端状态
4. **可缓存** — 响应应明确标记是否可缓存
5. **分层系统** — 客户端不需要知道是直连还是经过中间层

### HTTP 方法与资源操作

| 方法 | 操作 | 幂等 | 安全 |
|------|------|------|------|
| GET | 读取资源 | ✅ | ✅ |
| POST | 创建资源 | ❌ | ❌ |
| PUT | 更新资源 | ✅ | ❌ |
| PATCH | 部分更新 | ❌ | ❌ |
| DELETE | 删除资源 | ✅ | ❌ |

### 路径设计规范

```
# 正确的设计 — 使用名词复数
GET    /api/users        # 获取所有用户
GET    /api/users/1      # 获取用户 1
POST   /api/users        # 创建用户
PUT    /api/users/1      # 更新用户 1
DELETE /api/users/1      # 删除用户 1

# 错误的设计 — 使用动词
GET    /api/getUsers     # ❌ 不要在 URL 中使用动词
GET    /api/User/1       # ❌ 大小写不统一
```

### 状态码规范

| 状态码 | 含义 | 使用场景 |
|--------|------|----------|
| 200 OK | 请求成功 | GET/PUT/PATCH 成功 |
| 201 Created | 资源创建成功 | POST 创建资源后返回 |
| 204 No Content | 请求成功但无内容返回 | DELETE 成功 |
| 400 Bad Request | 请求格式错误 | 参数校验失败 |
| 401 Unauthorized | 未认证 | 需要登录 |
| 403 Forbidden | 禁止访问 | 无权操作 |
| 404 Not Found | 资源不存在 | |
| 409 Conflict | 资源冲突 | 如用户名已存在 |
| 422 Unprocessable | 请求语义正确但无法处理 | 业务规则校验失败 |
| 500 Internal Server Error | 服务端错误 | |

### 响应格式

统一的 JSON 响应格式：

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1,
    "name": "张三",
    "email": "zhangsan@example.com"
  }
}
```

分页响应示例：

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [...],
    "total": 100,
    "page": 1,
    "pageSize": 10,
    "pages": 10
  }
}
```

## 实践练习

1. 设计一个博客系统的 API，包含文章和评论资源
2. 为每个 API 编写对应的 HTTP 请求示例
3. 思考如何用 middleware 统一错误处理

## 下一步

- 学习如何使用 Node.js + Express 实现 RESTful API
- 了解 API 鉴权方案（JWT、OAuth 2.0）
- 了解 GraphQL 与传统 REST 的对比
