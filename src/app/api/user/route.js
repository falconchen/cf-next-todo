import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

export async function GET(request) {
  const { env } = getRequestContext();
  const authHeader = request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const sessionToken = authHeader.split(' ')[1];

  // 从 KV 存储中获取用户数据
  const userData = await env.MY_KV_NAMESPACE.get(`session:${sessionToken}`);

  if (!userData) {
    return new Response(JSON.stringify({ error: 'Session not found' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 解析用户数据
  const user = JSON.parse(userData);

  // 检查用户是否是 GitHub 用户
  const loginMethod = user.loginMethod || 'password';
  user.loginMethod = 'password';
  if (loginMethod === 'github') {
    // 如果是,从 KV 存储中获取完整的 GitHub 用户数据
    const githubUserData = await env.MY_KV_NAMESPACE.get(`githubuser:${user.id}`);
    console.log(githubUserData)
    if (githubUserData) {
      user.loginMethod = 'github';
      Object.assign(user, JSON.parse(githubUserData));
    }
  } 

  return new Response(JSON.stringify(user), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}