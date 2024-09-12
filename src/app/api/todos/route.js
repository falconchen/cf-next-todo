import { getRequestContext } from '@cloudflare/next-on-pages'

export const runtime = 'edge'

async function getUserId(request) {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Invalid Authorization header')
  }
  const sessionToken = authHeader.split(' ')[1]
  
  const { env } = getRequestContext()
  const userStr = await env.MY_KV_NAMESPACE.get(`session:${sessionToken}`)
  if (!userStr) {
    throw new Error('Invalid or expired session token')
  }
  const user = JSON.parse(userStr)

  if (user.loginMethod === 'password') {
    return `${user.loginMethod}#${user.username}`    
  } else {
    return `${user.loginMethod}#${user.id}`
  }
}

async function handleRequest(request, handler) {
  try {
    const userId = await getUserId(request)
    return await handler(userId)
  } catch (error) {
    if (error.message === 'Invalid or expired session token') {
      return new Response(JSON.stringify({ error: 'Session expired' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export async function GET(request) {
  return handleRequest(request, async (userId) => {
    const { env } = getRequestContext()
    const validTodos = JSON.parse(await env.MY_KV_NAMESPACE.get(`todos:${userId}`) || '[]').filter(t => !t.permanentlyDeleted)
    return new Response(JSON.stringify(validTodos), {
      headers: { 'Content-Type': 'application/json' },
    })
  })
}



export async function PUT(request) {
  return handleRequest(request, async (userId) => {
    const { env } = getRequestContext()
    const updatedTodos = await request.json()
    const todosKey = `todos:${userId}`

    if (Array.isArray(updatedTodos)) {
      // 合并多个任务
      const serverTodos = JSON.parse(await env.MY_KV_NAMESPACE.get(todosKey) || '[]')
      
      // 合并服务器和本地任务，保留 updatedAt 最大的 item
      let mergedTodos = [...serverTodos, ...updatedTodos].reduce((acc, task) => {
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


      
      // 按 updatedAt 降序排列
      mergedTodos.sort((a, b) => b.updatedAt - a.updatedAt)
      
      await env.MY_KV_NAMESPACE.put(todosKey, JSON.stringify(mergedTodos))
      
      //过滤掉 permanentlyDeleted 的任务。
      const validTodos = mergedTodos.filter(t => !t.permanentlyDeleted)

      return new Response(JSON.stringify(validTodos), {
        headers: { 'Content-Type': 'application/json' },
      })
    } else {
      // 更新单个任务（弃用）
      const existingTodos = JSON.parse(await env.MY_KV_NAMESPACE.get(todosKey) || '[]')
      const index = existingTodos.findIndex(t => t.id === updatedTodos.id)
      if (index !== -1) {
        existingTodos[index] = { ...existingTodos[index], ...updatedTodos }
        existingTodos.sort((a, b) => b.updatedAt - a.updatedAt) // 按 updatedAt 降序排列
        await env.MY_KV_NAMESPACE.put(todosKey, JSON.stringify(existingTodos))
        return new Response(JSON.stringify(existingTodos[index]), {
          headers: { 'Content-Type': 'application/json' },
        })
      }
      return new Response('Todo not found', { status: 404 })
    }
  })
}

// 添加任务(弃用)
export async function POST(request) {
  return handleRequest(request, async (userId) => {
    const { env } = getRequestContext()
    const todo = await request.json()
    const todosKey = `todos:${userId}`
    const todos = JSON.parse(await env.MY_KV_NAMESPACE.get(todosKey) || '[]')
    todos.push(todo)
    await env.MY_KV_NAMESPACE.put(todosKey, JSON.stringify(todos))
    return new Response(JSON.stringify(todo), {
      headers: { 'Content-Type': 'application/json' },
    })
  })
}

// 删除任务(弃用)
export async function DELETE(request) {
  return handleRequest(request, async (userId) => {
    const { env } = getRequestContext()
    const { id } = await request.json()
    const todosKey = `todos:${userId}`
    const todos = JSON.parse(await env.MY_KV_NAMESPACE.get(todosKey) || '[]')
    const newTodos = todos.filter(t => t.id !== id)
    await env.MY_KV_NAMESPACE.put(todosKey, JSON.stringify(newTodos))
    return new Response('Todo permanently deleted', { status: 200 })
  })
}
