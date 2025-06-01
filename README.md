# MyPastebin

一个简单的在线代码分享平台，使用 React + TypeScript + Material-UI 构建，后端使用 Cloudflare Workers。

## 功能特点

- 创建和分享代码片段
- 支持标题和内容
- 密码保护
- 管理员面板
- Cloudflare Turnstile 验证码保护
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

## 开发设置

1. 克隆仓库：
```bash
git clone https://github.com/yourusername/mypastebin.git
cd mypastebin
```

2. 安装依赖：
```bash
npm install
```

3. 创建环境变量文件：
```bash
cp .env.example .env
```
然后编辑 `.env` 文件，填入你的配置。

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

## 环境变量

- `VITE_TURNSTILE_SITE_KEY`: Cloudflare Turnstile 站点密钥
- `VITE_API_URL`: API 地址（可选，默认使用相对路径）

## 许可证

MIT
