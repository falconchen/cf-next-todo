import { getRequestContext } from '@cloudflare/next-on-pages'
import { SHA256 } from 'crypto-js'

export const runtime = 'edge'

export async function POST(request) {
  const { env } = getRequestContext()
  const { username, email, password } = await request.json()

  // 服务端数据验证
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const passwordRegex = /^.{7,}$/

  if (!usernameRegex.test(username) || !emailRegex.test(email) || !passwordRegex.test(password)) {
    return new Response(JSON.stringify({ error: '无效的输入数据' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // 检查用户名是否已存在
  const existingUser = await env.MY_KV_NAMESPACE.get(`user:${username}`)
  if (existingUser) {
    return new Response(JSON.stringify({ error: '用户名已存在' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // 检查邮箱是否已存在
  const userList = JSON.parse(await env.MY_KV_NAMESPACE.get('userList') || '[]')
  for (const existingUsername of userList) {
    const user = JSON.parse(await env.MY_KV_NAMESPACE.get(`user:${existingUsername}`))
    if (user.email === email) {
      return new Response(JSON.stringify({ error: '邮箱已被使用' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }

  // 创建新用户
  const hashedPassword = SHA256(password).toString()
  const newUser = { 
    username: username.trim(), 
    email: email.trim().toLowerCase(), 
    password: hashedPassword,
    loginMethod: 'password'
  }
  await env.MY_KV_NAMESPACE.put(`user:${username}`, JSON.stringify(newUser))

  // 更新用户列表
  userList.push(username)
  await env.MY_KV_NAMESPACE.put('userList', JSON.stringify(userList))

    
  const sessionExpirationTtlInSeconds = env.SESSION_EXPIRATION_TTL_IN_SECONDS || 31536000;
  // 登录成功，生成一个简单的会话token
  const sessionToken = crypto.randomUUID()
  await env.MY_KV_NAMESPACE.put(`session:${sessionToken}`, JSON.stringify(newUser), { expirationTtl: sessionExpirationTtlInSeconds }) 


  return new Response(JSON.stringify({ message: '用户注册成功' , sessionToken}), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
