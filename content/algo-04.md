# 第三章：二叉树与图

## 树的基本概念

树是一种层级数据结构，由节点组成，每个节点可以有零个或多个子节点。

### 核心术语

- **根节点（Root）** — 树的顶层节点
- **叶子节点（Leaf）** — 没有子节点的节点
- **深度（Depth）** — 从根到该节点的路径长度
- **高度（Height）** — 从该节点到最远叶子的路径长度
- **二叉树** — 每个节点最多有两个子节点的树

### 二叉树的遍历

```javascript
function TreeNode(val) {
  this.val = val;
  this.left = this.right = null;
}

// 层次遍历（BFS）— 使用队列
function levelOrder(root) {
  if (!root) return [];
  const result = [];
  const queue = [root];
  
  while (queue.length > 0) {
    const level = [];
    const size = queue.length;
    
    for (let i = 0; i < size; i++) {
      const node = queue.shift();
      level.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    
    result.push(level);
  }
  
  return result;
}
```

## 图的基本概念

图由顶点（Vertex）和边（Edge）组成。

### 图的表示

```javascript
// 邻接矩阵 — 适合稠密图
const adjMatrix = [
  [0, 1, 1, 0],
  [1, 0, 1, 0],
  [1, 1, 0, 1],
  [0, 0, 1, 0]
];

// 邻接表 — 适合稀疏图（更常用）
const adjList = {
  A: ['B', 'C'],
  B: ['A', 'C'],
  C: ['A', 'B', 'D'],
  D: ['C']
};
```

### 图的遍历

```javascript
// BFS — 最短路径（无权图）
function bfs(graph, start) {
  const visited = new Set([start]);
  const queue = [start];
  const result = [];
  
  while (queue.length > 0) {
    const node = queue.shift();
    result.push(node);
    
    for (const neighbor of graph[node]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  
  return result;
}

// DFS — 使用栈（迭代版本）
function dfs(graph, start) {
  const visited = new Set();
  const stack = [start];
  const result = [];
  
  while (stack.length > 0) {
    const node = stack.pop();
    if (visited.has(node)) continue;
    visited.add(node);
    result.push(node);
    
    for (const neighbor of graph[node]) {
      if (!visited.has(neighbor)) {
        stack.push(neighbor);
      }
    }
  }
  
  return result;
}
```

## 常见算法

| 算法 | 用途 | 时间复杂度 |
|------|------|-----------|
| BFS | 最短路径（无权） | O(V + E) |
| DFS | 连通分量、拓扑排序 | O(V + E) |
| Dijkstra | 最短路径（有权） | O((V+E) log V) |
| Kruskal | 最小生成树 | O(E log E) |
| Topological Sort | 拓扑排序 | O(V + E) |

## 实践练习

1. 实现二叉树的层序遍历
2. 判断一个图是否连通
3. 实现拓扑排序检测环路
4. 用 Dijkstra 算法找最短路径

## 下一步

- 学习平衡树（AVL 树、红黑树）
- 了解堆与优先队列
- 学习图论中的经典应用
