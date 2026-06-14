# 第五章：Node.js 与 Express 入门

## 为什么选择 Node.js

Node.js 让 JavaScript 可以在服务端运行，前后端使用同一门语言，降低学习成本。

### 安装与运行

```bash
# 安装 Node.js（推荐 LTS 版本）
node -v  # 查看版本
npm -v   # 查看 npm 版本

# 创建项目
mkdir my-api && cd my-api
npm init -y

# 安装 Express
npm install express
```

### 第一个 Express 应用

```javascript
const express = require('express');
const app = express();
const PORT = 3000;

// 解析 JSON 请求体
app.use(express.json());

// 简单路由
app.get('/', (req, res) => {
  res.json({ message: 'Hello World!' });
});

// 获取路径参数
app.get('/users/:id', (req, res) => {
  res.json({ id: req.params.id });
});

// 获取查询参数
app.get('/users', (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  res.json({ page, limit });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

## Express 中间件

中间件是 Express 的核心概念，每个请求都会经过一系列中间件处理。

### 内置中间件

```javascript
// 解析 JSON
app.use(express.json());

// 解析 URL 编码
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use(express.static('public'));
```

### 自定义中间件

```javascript
// 日志中间件
function logger(req, res, next) {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next(); // 传递给下一个中间件
}
app.use(logger);

// 认证中间件
function authenticate(req, res, next) {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: '未授权' });
  }
  // 验证 token...
  req.user = decoded; // 将用户信息附加到请求对象
  next();
}
```

### 错误处理中间件

```javascript
// 错误处理中间件有 4 个参数
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    code: 500,
    message: '服务器内部错误'
  });
});
```

## 路由模块化管理

```javascript
// routes/users.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => { /* ... */ });
router.post('/', (req, res) => { /* ... */ });
router.get('/:id', (req, res) => { /* ... */ });
router.put('/:id', (req, res) => { /* ... */ });
router.delete('/:id', (req, res) => { /* ... */ });

module.exports = router;

// app.js
const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);
```

## 实践练习

1. 创建一个用户 CRUD API（内存存储即可）
2. 添加日志中间件记录所有请求
3. 添加全局错误处理

## 下一步

- 学习使用 MongoDB 作为持久化存储
- 了解 JWT 认证流程
- 学习使用 PM2 部署 Node.js 应用
