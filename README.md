# 我的学习站

个人学习笔记 + 云端进度同步，部署在 GitHub Pages，数据保存在 Supabase。

## 在线访问

部署完成后地址为：

`https://<你的GitHub用户名>.github.io/learning-site/`

若仓库名不是 `learning-site`，请同步修改 `vite.config.js` 和 `.github/workflows/deploy.yml` 中的 `VITE_BASE_PATH`。

## 功能

- Markdown 课程笔记（`content/`）
- 章节完成标记与总进度百分比
- 同步码跨设备同步（无需注册登录）
- JSON 导出/导入备份
- 推送 `main` 分支自动部署

## 本地开发

```bash
npm install
cp .env.example .env
# 编辑 .env 填入 Supabase URL 和 anon key
npm run dev
```

## 创建 GitHub 仓库并部署

1. 在 GitHub 新建仓库 `learning-site`（Public）
2. 在本项目目录执行：

```bash
git init
git add -A
git commit -m "Initial learning site"
git branch -M main
git remote add origin https://github.com/<用户名>/learning-site.git
git push -u origin main
```

3. 打开仓库 **Settings → Pages**
4. **Build and deployment → Source** 选择 **GitHub Actions**
5. 首次 push 后 Actions 会自动构建部署

## 配置 Supabase（进度云端同步）

1. 注册 [Supabase](https://supabase.com) 并新建项目
2. 打开 **SQL Editor**，运行 [`supabase/schema.sql`](supabase/schema.sql)
3. 在 **Project Settings → API** 复制：
   - Project URL → `VITE_SUPABASE_URL`
   - anon public key → `VITE_SUPABASE_ANON_KEY`
4. 在 GitHub 仓库 **Settings → Secrets and variables → Actions** 添加：

| Secret | 值 |
|--------|-----|
| `VITE_SUPABASE_URL` | 你的 Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | 你的 anon public key |

5. 重新运行 Actions 工作流（或再 push 一次）

未配置 Supabase 时，进度仅保存在浏览器本地。

## 添加新课程章节

1. 在 `content/` 新建 Markdown，如 `chapter-04.md`
2. 在 `content/courses.json` 的 `chapters` 数组添加条目：

```json
{
  "id": "chapter-04",
  "title": "第四章：标题",
  "file": "chapter-04.md",
  "order": 4
}
```

3. `git push` 后自动部署

## 同步码说明

- 首次访问自动生成，保存在浏览器
- 在 **设置** 页复制同步码，换设备时输入同一同步码即可合并进度
- **务必保存同步码或定期导出 JSON**，丢失后无法从云端恢复

## 项目结构

```
content/          # 课程 Markdown 与 courses.json
src/              # 前端逻辑
supabase/         # 数据库 SQL
.github/workflows # GitHub Pages 部署
```
