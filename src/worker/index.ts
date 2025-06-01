/// <reference types="@cloudflare/workers-types" />

interface Env {
  PASTES: KVNamespace;
  ADMIN_PASSWORD: string;
  TURNSTILE_SECRET_KEY: string;
}

interface PasteRequest {
  content: string;
  title?: string;
}

interface Paste {
  id: string;
  content: string;
  title: string;
  createdAt: string;
}

interface TurnstileResponse {
  success: boolean;
  error_codes?: string[];
}

async function validateTurnstileToken(token: string, env: Env): Promise<boolean> {
  const formData = new FormData();
  formData.append('secret', env.TURNSTILE_SECRET_KEY);
  formData.append('response', token);

  const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: formData,
  });

  const outcome = await result.json() as TurnstileResponse;
  return outcome.success;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // 验证管理员密码
    const authHeader = request.headers.get('Authorization');
    const isAdmin = authHeader === `Bearer ${env.ADMIN_PASSWORD}`;

    // 获取所有 paste（仅管理员）
    if (path === '/api/pastes' && request.method === 'GET') {
      // 先验证验证码
      const token = request.headers.get('CF-Turnstile-Token');
      if (!token) {
        return new Response('验证码未提供', { status: 400 });
      }

      const isValidToken = await validateTurnstileToken(token, env);
      if (!isValidToken) {
        return new Response('验证码验证失败', { status: 400 });
      }

      // 再验证密码
      if (!isAdmin) {
        return new Response('密码错误', { status: 401 });
      }

      const list = await env.PASTES.list();
      const pastes: Paste[] = [];
      
      for (const key of list.keys) {
        const paste = await env.PASTES.get(key.name);
        if (paste) {
          pastes.push(JSON.parse(paste));
        }
      }

      // 按创建时间倒序排序
      pastes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return new Response(JSON.stringify(pastes), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 删除所有 paste（仅管理员）
    if (path === '/api/pastes' && request.method === 'DELETE') {
      // 先验证验证码
      const token = request.headers.get('CF-Turnstile-Token');
      if (!token) {
        return new Response('验证码未提供', { status: 400 });
      }

      const isValidToken = await validateTurnstileToken(token, env);
      if (!isValidToken) {
        return new Response('验证码验证失败', { status: 400 });
      }

      // 再验证密码
      if (!isAdmin) {
        return new Response('密码错误', { status: 401 });
      }

      const list = await env.PASTES.list();
      for (const key of list.keys) {
        await env.PASTES.delete(key.name);
      }

      return new Response(JSON.stringify({ message: '所有 paste 已删除' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 删除单个 paste（仅管理员）
    if (path.startsWith('/api/paste/') && request.method === 'DELETE') {
      // 先验证验证码
      const token = request.headers.get('CF-Turnstile-Token');
      if (!token) {
        return new Response('验证码未提供', { status: 400 });
      }

      const isValidToken = await validateTurnstileToken(token, env);
      if (!isValidToken) {
        return new Response('验证码验证失败', { status: 400 });
      }

      // 再验证密码
      if (!isAdmin) {
        return new Response('密码错误', { status: 401 });
      }

      const id = path.split('/').pop();
      if (!id) {
        return new Response('Invalid ID', { status: 400 });
      }

      await env.PASTES.delete(id);
      return new Response(JSON.stringify({ message: 'Paste 已删除' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 创建新的 paste
    if (path === '/api/paste' && request.method === 'POST') {
      const { content, title } = await request.json() as PasteRequest;
      if (!content) {
        return new Response('Content is required', { status: 400 });
      }

      // 先验证验证码
      const token = request.headers.get('CF-Turnstile-Token');
      if (!token) {
        return new Response('验证码未提供', { status: 400 });
      }

      const isValidToken = await validateTurnstileToken(token, env);
      if (!isValidToken) {
        return new Response('验证码验证失败', { status: 400 });
      }

      // 再验证密码
      if (!isAdmin) {
        return new Response('密码错误', { status: 401 });
      }

      const id = crypto.randomUUID();
      const paste = {
        id,
        content,
        title: title || 'Untitled',
        createdAt: new Date().toISOString(),
      };

      await env.PASTES.put(id, JSON.stringify(paste));
      return new Response(JSON.stringify(paste), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 获取单个 paste
    if (path.startsWith('/api/paste/')) {
      const id = path.split('/').pop();
      if (!id) {
        return new Response('Invalid ID', { status: 400 });
      }

      // 先验证验证码
      const token = request.headers.get('CF-Turnstile-Token');
      if (!token) {
        return new Response('验证码未提供', { status: 400 });
      }

      const isValidToken = await validateTurnstileToken(token, env);
      if (!isValidToken) {
        return new Response('验证码验证失败', { status: 400 });
      }

      const paste = await env.PASTES.get(id);
      if (!paste) {
        return new Response('Not found', { status: 404 });
      }

      // 添加缓存控制头
      return new Response(paste, {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600', // 缓存1小时
        },
      });
    }

    return new Response('Not found', { status: 404 });
  },
}; 