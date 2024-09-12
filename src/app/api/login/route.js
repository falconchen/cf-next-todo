import { getRequestContext } from '@cloudflare/next-on-pages'
import { SHA256 } from 'crypto-js'

export const runtime = 'edge'

export async function POST(request) {
  const { env } = getRequestContext()
  const { username, password } = await request.json()

  // 服务端数据验证
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
  const passwordRegex = /^.{7,}$/

  if (!usernameRegex.test(username) || !passwordRegex.test(password)) {
    return new Response(JSON.stringify({ error: '无效的用户名或密码' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // 获取用户信息
  const userJson = await env.MY_KV_NAMESPACE.get(`user:${username}`)
  if (!userJson) {
    return new Response(JSON.stringify({ error: '用户名或密码错误' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const user = JSON.parse(userJson)

  const hashedPassword = SHA256(password).toString()

  if (user.password !== hashedPassword) {
    return new Response(JSON.stringify({ error: '用户名或密码错误' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  //移除user的password字段
  delete user.password
  user.loginMethod = 'password'

  
  const sessionExpirationTtlInSeconds = env.SESSION_EXPIRATION_TTL_IN_SECONDS || 31536000;
  // 登录成功，生成一个简单的会话token
  
  const sessionToken = crypto.randomUUID()
  await env.MY_KV_NAMESPACE.put(`session:${sessionToken}`, JSON.stringify(user), { expirationTtl: sessionExpirationTtlInSeconds }) 

  return new Response(JSON.stringify({ message: '登录成功', sessionToken }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
