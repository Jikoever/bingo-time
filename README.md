# AI Bingo Grid

前端：Vite + React + TypeScript  
数据库与认证：Supabase  
部署：Cloudflare Pages

## 1. 本地运行

```bash
npm install
cp .env.example .env
```

编辑 `.env`：

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_ANON_KEY
```

启动：

```bash
npm run dev
```

## 2. Supabase 初始化

本项目已经使用 Supabase（认证 + `bingo_games` 表）。

1. 在 Supabase 创建项目。
2. 在项目里启用 Google OAuth（Authentication -> Providers -> Google）。
3. 在 Google Cloud OAuth 配置里把回调地址设为：
   - `https://<YOUR_PROJECT_REF>.supabase.co/auth/v1/callback`
4. 在 Supabase Auth URL 配置里设置：
   - `Site URL`：`https://<你的线上域名>`
   - `Redirect URLs`：`http://localhost:8080`, `https://<你的线上域名>`
5. 执行数据库迁移（使用本仓库 `supabase/migrations` 下 SQL）。

如果你使用 Supabase CLI：

```bash
supabase link --project-ref <YOUR_PROJECT_REF>
supabase db push
```

如果要用 AI 任务拆解（`supabase/functions/ai-breakdown`），还要部署该函数并配置它依赖的密钥。

## 3. 部署到 Cloudflare Pages

1. 打开 Cloudflare -> Workers & Pages -> Create application -> Pages -> Connect to Git。
2. 选择本仓库。
3. Build command 填：`npm run build`
4. Build output directory 填：`dist`
5. 在 Pages 项目设置里配置环境变量：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
6. 部署。

本仓库已添加 `public/_redirects`，用于 React Router 的 SPA 路由回退（避免刷新 404）。

## 4. 绑定你的域名

1. 进入 Cloudflare Pages 项目 -> `Custom domains`。
2. 点 `Set up a custom domain`。
3. 输入你的域名（例如 `bingo.yourdomain.com`）。
4. 按提示添加/确认 DNS 记录。
5. 等证书签发完成后即可访问。

## 5. 线上环境检查清单

1. Cloudflare Pages 已配置 `VITE_SUPABASE_URL`、`VITE_SUPABASE_PUBLISHABLE_KEY`。
2. Supabase Auth 的 `Site URL` 与正式域名一致。
3. Supabase Auth 的 `Redirect URLs` 同时包含正式域名和本地调试地址。
