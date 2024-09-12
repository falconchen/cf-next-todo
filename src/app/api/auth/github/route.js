import { getRequestContext } from '@cloudflare/next-on-pages';
import { SHA256 } from 'crypto-js';

export const runtime = 'edge';

export async function GET(request) {
  const { env } = getRequestContext();
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  const clientId = env.GITHUB_CLIENT_ID;
  const clientSecret = env.GITHUB_CLIENT_SECRET;
  const redirectUri = env.GITHUB_REDIRECT_URI;
  const sessionExpirationTtlInSeconds = env.SESSION_EXPIRATION_TTL_IN_SECONDS || 31536000; // 1年

  if (!code) {
    // 如果没有 code,重定向到 GitHub 授权页面
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'user',
    });
    const githubAuthUrl = `https://github.com/login/oauth/authorize?${params}`;
    return new Response(null, {
      status: 302,
      headers: {
        Location: githubAuthUrl,
      },
    });
  } else {
    try {
      // 用授权码换取访问令牌
      const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: redirectUri,
        }),
      });
      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      // 使用访问令牌获取用户信息
      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const githubUserData = await userResponse.json();

      // 使用 `githubuser:` 前缀和 GitHub 用户 ID 作为 KV 的键
      const githubUserKey = `githubuser:${githubUserData.id}`;

      // 检查用户是否已存在
      // const existingUser = await env.MY_KV_NAMESPACE.get(githubUserKey);
      const githubUser = {
        id: githubUserData.id,
        username: githubUserData.login,
        email: githubUserData.email || '',
        avatar: githubUserData.avatar_url,
        loginMethod: 'github',
        
      };
      
      // if (!existingUser) {
      //   // 如果用户不存在,创建新用户
      //   const newUser = githubUser
      //   await env.MY_KV_NAMESPACE.put(githubUserKey, JSON.stringify(githubUser));
      // }
      await env.MY_KV_NAMESPACE.put(githubUserKey, JSON.stringify(githubUser));
      // 生成一个简单的会话token
      const sessionToken = crypto.randomUUID();
      await env.MY_KV_NAMESPACE.put(`session:${sessionToken}`, JSON.stringify(githubUser), { expirationTtl: sessionExpirationTtlInSeconds }); 

      const redirectUrl = `/?sessionToken=${sessionToken}`;
      return new Response(null, {
        status: 302,
        headers: {
          Location: redirectUrl,
        },
      });
    } catch (error) {
      console.error('GitHub 登录出错：', error);
      return new Response(JSON.stringify({ error: '登录失败,请重试。' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }
}