# 第二章：NoSQL 与文档数据库

## 为什么需要 NoSQL

关系型数据库在以下场景面临挑战：
- **海量数据** — 单表超过千万行，JOIN 性能急剧下降
- **高并发读写** — 社交网络每秒百万级请求
- **灵活 schema** — 电商商品字段差异大
- **水平扩展** — 需要跨多台机器分布数据

## MongoDB 基础

### 核心概念

| SQL 概念 | MongoDB 概念 | 说明 |
|---------|-------------|------|
| Database | Database | 数据库 |
| Table | Collection | 集合 |
| Row | Document | 文档（JSON 格式） |
| Column | Field | 字段 |
| JOIN | $lookup / 引用 | 关联查询 |
| Index | Index | 索引 |

### 基本 CRUD 操作

```javascript
// 插入文档
db.posts.insertOne({
  title: "Hello MongoDB",
  content: "NoSQL 入门",
  author: { name: "张三", age: 25 },
  tags: ["nosql", "mongodb"],
  createdAt: new Date()
});

// 查询
db.posts.find({ "author.name": "张三" });
db.posts.find({ tags: "mongodb" }).sort({ createdAt: -1 }).limit(10);

// 更新
db.posts.updateOne(
  { _id: ObjectId("...") },
  { $set: { title: "新标题" }, $inc: { views: 1 } }
);

// 删除
db.posts.deleteOne({ _id: ObjectId("...") });
```

### 索引与聚合

```javascript
// 创建索引
db.posts.createIndex({ author: 1, createdAt: -1 });

// 聚合管道
db.posts.aggregate([
  { $match: { tags: "mongodb" } },
  { $group: { _id: "$author.name", count: { $sum: 1 } } },
  { $sort: { count: -1 } },
  { $limit: 5 }
]);
```

## Redis — 内存数据库

### 五种基本数据类型

```javascript
// String
redis.set("user:1:name", "张三");
redis.get("user:1:name");

// Hash
redis.hset("user:1", "name", "张三", "age", "25");
redis.hgetall("user:1");

// List
redis.lpush("posts", "post1", "post2", "post3");
redis.lrange("posts", 0, -1);

// Set
redis.sadd("tags", "mongodb", "nosql", "db");
redis.smembers("tags");

// ZSet
redis.zadd("leaderboard", 100, "Alice", 90, "Bob");
redis.zrange("leaderboard", 0, -1, { withScores: true });
```

### Redis 应用场景

1. **缓存** — 减轻数据库压力
2. **会话存储** — 用户登录状态
3. **计数器** — 点赞数、浏览量
4. **消息队列** — 异步任务处理
5. **排行榜** — 基于 Sorted Set

## 实践练习

1. 设计一个电商产品的 MongoDB schema
2. 用 Redis 实现一个简单的计数器
3. 比较 MongoDB 和 MySQL 在查询性能上的差异

## 下一步

- 学习 Redis 持久化机制（RDB/AOF）
- 了解分布式锁的实现
- 学习 CAP 定理与 BASE 理论
