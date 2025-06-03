# MyPastebin

一个简单的在线剪切板，使用 React + TypeScript + Material-UI 构建，后端使用 Cloudflare Workers。

![效果图](/public/preview.png)

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
然后编辑 `.env` 和 `.dev.vars` 文件，填入你的配置。

所有前后端环境变量建议分开管理：

- 前端环境变量：`.env`，用于 Vite 前端项目
- 后端环境变量：`.dev.vars` 和 `.dev.vars.example`，用于本地启动 Cloudflare Worker 后端

### 前端环境变量

`.env` 示例内容：
```
VITE_TURNSTILE_SITE_KEY=your_turnstile_site_key
VITE_API_URL=https://paste.emon100.com
```

- `VITE_TURNSTILE_SITE_KEY`：前端 Turnstile 验证码 site key 测试默认值详见：https://developers.cloudflare.com/turnstile/troubleshooting/testing/
- `VITE_API_URL`：API 地址（如无特殊需求可用默认）

### 后端环境变量

`.dev.vars.example` 示例内容：
```
ADMIN_PASSWORD=admin
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
```

- `ADMIN_PASSWORD`：管理员密码（后端校验）
- `TURNSTILE_SECRET_KEY`：后端 Turnstile 验证码 secret 测试默认值详见：https://developers.cloudflare.com/turnstile/troubleshooting/testing/

1. 启动开发服务器：

启动后端：
```bash
npx wrangler dev # 本地模拟cloudflare后端
```

启动前端
```bash
npm run dev # 启动前端页面
```

## 部署前： Cloudflare 配置步骤

### 1. 新建 Worker KV

1. 登录 Cloudflare 控制台，进入 Workers & Pages。
2. 点击 "KV" 标签，然后点击 "Create a namespace"。
3. 输入命名空间名称（例如 `PASTES`），点击 "Add"。
4. 记录下命名空间的 ID，后续在 `wrangler.toml` 中配置。

### 2. 设置域名

1. 在 Cloudflare 控制台，进入 "Workers & Pages"。
2. 选择你的 Worker，点击 "Triggers" 标签。
3. 在 "Custom Domains" 部分，点击 "Add Custom Domain"。
4. 输入你的域名（例如 `paste.emon100.com`），并按照提示完成 DNS 配置。

### 3. 创建 Turnstile 站点

1. 登录 Cloudflare 控制台，进入 "Security" 部分。
2. 点击 "Turnstile"，然后点击 "Add site"。
3. 输入站点名称（例如 `MyPastebin`），选择验证方式（推荐 "Managed"），点击 "Create"。
4. 记录下生成的 Site Key 和 Secret Key，后续在环境变量中配置。
5. 验证码保护的站点，除了你的域名，还可以加上localhost，方便调试。

### 4. 配置 Secret

1. 在 Cloudflare 控制台，进入 "Workers & Pages"。
2. 选择你的 Worker，点击 "Settings" 标签。
3. 在 "Environment Variables" 部分，点击 "Add Secret"。
4. 输入变量名（例如 `ADMIN_PASSWORD` 和 `TURNSTILE_SECRET_KEY`），并填入对应的值。
5. 点击 "Save and Deploy" 保存配置。

完成以上步骤后，你的 Worker 将能够使用 KV 存储、自定义域名和 Secret 变量。

## 部署

### 0. 配置好前端验证码环境变量

然后将 .env 中的环境变量设置为你的 turnstile 站点密钥（前端配置使用的密钥）。

### 1. 构建项目

在项目根目录下运行以下命令构建前端项目：

```bash
npm run build
```

### 2. 部署到 Cloudflare Workers

使用 Wrangler 部署到 Cloudflare Workers：

```bash
npm run deploy
```

确保在部署前已配置好 `.dev.vars` 文件，以便 Wrangler 能够读取后端环境变量。

### 3. 验证部署

部署完成后，访问你的自定义域名，确认应用正常运行。

## 许可证

MIT

