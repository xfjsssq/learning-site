# 第三章：递归与分治

## 什么是递归

递归是一种函数调用自身的编程技巧，适用于可以分解为相似子问题的问题。

### 递归三要素

1. **终止条件（Base Case）** — 递归何时停止
2. **递归条件（Recursive Case）** — 如何分解为更小的子问题
3. **问题规模递减** — 每次递归问题规模必须变小

### 经典示例

#### 斐波那契数列

```javascript
// 直接递归 — 简洁但低效 O(2^n)
function fib(n) {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
}

// 记忆化递归 — 高效 O(n)
function fibMemo(n, memo = {}) {
  if (n in memo) return memo[n];
  if (n <= 1) return n;
  memo[n] = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
  return memo[n];
}

// 迭代版 — 最优 O(n) 空间 O(1)
function fibIter(n) {
  if (n <= 1) return n;
  let a = 0, b = 1;
  for (let i = 2; i <= n; i++) {
    [a, b] = [b, a + b];
  }
  return b;
}
```

#### 快速排序（分治法）

```javascript
function quickSort(arr) {
  // 终止条件
  if (arr.length <= 1) return arr;
  
  // 分
  const pivot = arr[arr.length - 1];
  const left = arr.filter(x => x < pivot);
  const right = arr.filter(x => x >= pivot);
  
  // 治 + 合
  return [...quickSort(left), pivot, ...quickSort(right)];
}
```

#### 二叉树遍历

```javascript
function TreeNode(val) {
  this.val = val;
  this.left = this.right = null;
}

// 前序遍历：根 → 左 → 右
function preorder(root) {
  if (!root) return [];
  return [
    root.val,
    ...preorder(root.left),
    ...preorder(root.right)
  ];
}

// 后序遍历：左 → 右 → 根
function postorder(root) {
  if (!root) return [];
  return [
    ...postorder(root.left),
    ...postorder(root.right),
    root.val
  ];
}
```

## 递归复杂度分析

| 算法 | 时间复杂度 | 空间复杂度 |
|------|-----------|-----------|
| 斐波那契（朴素） | O(2^n) | O(n) |
| 斐波那契（记忆化） | O(n) | O(n) |
| 快速排序 | O(n log n) 平均 | O(log n) |
| 归并排序 | O(n log n) | O(n) |
| 汉诺塔 | O(2^n) | O(n) |

## 递归转迭代

递归可能产生栈溢出，可以手动维护栈转换为迭代：

```javascript
// 二叉树 DFS（递归 → 迭代）
function iterativeDFS(root) {
  const stack = root ? [root] : [];
  const result = [];
  
  while (stack.length > 0) {
    const node = stack.pop();
    result.push(node.val);
    if (node.right) stack.push(node.right);
    if (node.left) stack.push(node.left);
  }
  
  return result;
}
```

## 实践练习

1. 用递归实现阶乘、组合数 C(n,k)
2. 实现归并排序（Merge Sort）
3. 用递归解决汉诺塔问题
4. 实现图的深度优先搜索（DFS）

## 下一步

- 学习动态规划（DP）— 递归的进阶优化
- 了解尾递归优化
- 学习回溯算法
