import { getRequestContext } from '@cloudflare/next-on-pages'

export const runtime = 'edge'

async function getUserId(request) {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Invalid Authorization header')
  }
  const sessionToken = authHeader.split(' ')[1]
  
  // 在这里验证会话令牌的有效性
  // 可以将会话令牌存储在 KV 存储或数据库中，并在这里进行查询验证
  // 如果令牌无效，可以抛出错误或返回 null
  // 如果令牌有效，返回对应的用户 ID
  
  // 示例：从 KV 存储中获取用户 ID
  const { env } = getRequestContext()
  const userId = await env.MY_KV_NAMESPACE.get(`session:${sessionToken}`)
  if (!userId) {
    throw new Error('Invalid session token')
  }
  return userId
}

export async function GET(request) {
  const { env } = getRequestContext()
  const userId = await getUserId(request)
  const todos = await env.MY_KV_NAMESPACE.get(`todos:${userId}`)
  return new Response(todos || '[]', {
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function POST(request) {
  const { env } = getRequestContext()
  const userId = await getUserId(request)
  const todo = await request.json()
  const todosKey = `todos:${userId}`
  const todos = JSON.parse(await env.MY_KV_NAMESPACE.get(todosKey) || '[]')
  todos.push(todo)
  await env.MY_KV_NAMESPACE.put(todosKey, JSON.stringify(todos))
  return new Response(JSON.stringify(todo), {
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function PUT(request) {
  const { env } = getRequestContext()
  const userId = await getUserId(request)
  const updatedTodos = await request.json()
  const todosKey = `todos:${userId}`

  if (Array.isArray(updatedTodos)) {
    // 合并多个任务
    const serverTodos = JSON.parse(await env.MY_KV_NAMESPACE.get(todosKey) || '[]')
    
    // 合并服务器和本地任务，保留 updatedAt 最大的 item
    const mergedTodos = [...serverTodos, ...updatedTodos].reduce((acc, task) => {
      const getUpdatedAt = (t) => t.updatedAt || Math.max(t.completedAt || 0, t.deletedAt || 0, t.createdAt || 0);
      const existingTask = acc.find(t => t.id === task.id);
      if (!existingTask || getUpdatedAt(task) > getUpdatedAt(existingTask)) {
        const index = acc.findIndex(t => t.id === task.id);
        if (index !== -1) {
          acc[index] = { ...task, updatedAt: getUpdatedAt(task) };
        } else {
          acc.push({ ...task, updatedAt: getUpdatedAt(task) });
        }
      }
      return acc;
    }, []);    
    
    await env.MY_KV_NAMESPACE.put(todosKey, JSON.stringify(mergedTodos))
    
    return new Response(JSON.stringify(mergedTodos), {
      headers: { 'Content-Type': 'application/json' },
    })
  } else {
    // 更新单个任务
    const existingTodos = JSON.parse(await env.MY_KV_NAMESPACE.get(todosKey) || '[]')
    console.log(existingTodos)
    const index = existingTodos.findIndex(t => t.id === updatedTodos.id)
    if (index !== -1) {
      existingTodos[index] = { ...existingTodos[index], ...updatedTodos }
      await env.MY_KV_NAMESPACE.put(todosKey, JSON.stringify(existingTodos))
      return new Response(JSON.stringify(existingTodos[index]), {
        headers: { 'Content-Type': 'application/json' },
      })
    }
    return new Response('Todo not found', { status: 404 })
  }
}

export async function DELETE(request) {
  const { env } = getRequestContext()
  const userId = await getUserId(request)
  const { id } = await request.json()
  const todosKey = `todos:${userId}`
  const todos = JSON.parse(await env.MY_KV_NAMESPACE.get(todosKey) || '[]')
  const newTodos = todos.filter(t => t.id !== id)
  await env.MY_KV_NAMESPACE.put(todosKey, JSON.stringify(newTodos))
  return new Response('Todo deleted', { status: 200 })
}
