# MyPastebin

一个简单的在线代码分享平台，使用 React + TypeScript + Material-UI 构建，后端使用 Cloudflare Workers。

## 功能特点

- 创建和分享代码片段
- 支持标题和内容
- 密码保护
- Cloudflare Turnstile 验证码保护
- 管理员面板
- 响应式设计

## 技术栈

- 前端：
  - React
  - TypeScript
  - Material-UI
  - React Router
  - Cloudflare Turnstile

- 后端：
  - Cloudflare Workers
  - Cloudflare KV

## 本地开发设置

1. 克隆仓库：
```bash
git clone https://github.com/yourusername/mypastebin.git
cd mypastebin
```

2. 安装依赖：
```bash
npm install
```

3. 用示例文件创建环境变量文件：
```bash
cp .env.example .env
cp .dev.vars.example .dev.vars
```
然后编辑 `.env` ‵.dev.vars` 文件，填入你的配置。

4. 启动开发服务器：
```bash
npm run dev
```

## 部署

1. 构建项目：
```bash
npm run build
```

2. 部署到 Cloudflare Workers：
```bash
npm run deploy
```

## 环境变量统一配置

所有前后端环境变量建议分开管理：

- 前端环境变量：`.env`，用于 Vite 前端项目
- 后端环境变量：`.dev.vars` 和 `.dev.vars.example`，用于 Cloudflare Worker 后端

### 前端环境变量

`.env` 示例内容：
```
VITE_TURNSTILE_SITE_KEY=your_turnstile_site_key
VITE_API_URL=https://paste.emon100.com
```

- `VITE_TURNSTILE_SITE_KEY`：前端 Turnstile 验证码 site key
- `VITE_API_URL`：API 地址（如无特殊需求可用默认）

### 后端环境变量

`.dev.vars.example` 示例内容：
```
ADMIN_PASSWORD=admin
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA # For testing: https://developers.cloudflare.com/turnstile/troubleshooting/testing/
```

- `ADMIN_PASSWORD`：管理员密码（后端校验）
- `TURNSTILE_SECRET_KEY`：后端 Turnstile 验证码 secret

### 配置步骤

1. 前端：复制 `.env.example` 为 `.env` 并填写实际值
   ```bash
   cp .env.example .env
   # 编辑 .env 填写你的配置
   ```
2. 后端：复制 `.dev.vars.example` 为 `.dev.vars` 并填写实际值
   ```bash
   cp .dev.vars.example .dev.vars
   # 编辑 .dev.vars 填写你的配置
   ```

## 许可证

MIT
