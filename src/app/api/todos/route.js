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
    return `${user.loginMethod}@${user.username}`    
  } else {
    return `${user.loginMethod}@${user.id}`      
  }      
}
async function getStorage(env) {
  if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
    
    return {
      async get(key) {
        const prefix = env.UPSTASH_PREFIX ? `${env.UPSTASH_PREFIX}:` : ''
        const response = await fetch(`${env.UPSTASH_REDIS_REST_URL}/get/${prefix}${key}`, {
          headers: { Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}` }
        })
        if (!response.ok) throw new Error('Failed to get value from Redis')
        const data = await response.json()
        return data.result
      },
      async put(key, value) {
        const prefix = env.UPSTASH_PREFIX ? `${env.UPSTASH_PREFIX}:` : ''
        const response = await fetch(`${env.UPSTASH_REDIS_REST_URL}/set/${prefix}${key}`, {
          method: 'POST',
          body: value,
          headers: { 
            Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}`,
            
          }
        })
        // console.log({response})
        if (!response.ok) throw new Error('Failed to set value in Redis')
      }
    }
  } else {
    return env.MY_KV_NAMESPACE
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
    const storage = await getStorage(env)
    const todosKey = `todos:${userId}`
    const todos = await storage.get(todosKey) || '[]'
    const validTodos = JSON.parse(todos).filter(t => !t.permanentlyDeleted)
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
      const storage = await getStorage(env)
      const serverTodos = JSON.parse(await storage.get(todosKey) || '[]')

      
      // const updatedTodos = [{"id":1726167709712,"text":"测试同步","completed":false,"createdAt":1726167709712,"updatedAt":1726167709712}]
      // const serverTodos = [{"id":1726167709712,"text":"测试同步","completed":false,"createdAt":1726167709712,"updatedAt":1726167747896,"deleted":true,"deletedAt":1726167747896}]

      

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
      
      // console.log({serverTodos, updatedTodos,mergedTodos})



      // 按 updatedAt 降序排列
      mergedTodos.sort((a, b) => b.updatedAt - a.updatedAt)


      
      
      // await storage.put(todosKey, JSON.stringify(mergedTodos))
      await storage.put(todosKey, JSON.stringify(mergedTodos))
      
      //过滤掉 permanentlyDeleted 的任务。

      
      const validTodos = mergedTodos.filter(t => !t.permanentlyDeleted)
      return new Response(JSON.stringify(validTodos), {
        headers: { 'Content-Type': 'application/json' },
      })

    } else {
      // 更新单个任务（弃用）      
      // return new Response('Todo not found', { status: 404 })
      return new Response('请求参数错误', { status: 400 })
    }
  })
}

// 添加任务(弃用)
export async function POST(request) {
  return new Response('请求方法错误', { status: 405 })
  // return handleRequest(request, async (userId) => {
    
  //   const { env } = getRequestContext()
  //   const todo = await request.json()
  //   const todosKey = `todos:${userId}`
  //   const todos = JSON.parse(await env.MY_KV_NAMESPACE.get(todosKey) || '[]')
  //   todos.push(todo)
  //   await env.MY_KV_NAMESPACE.put(todosKey, JSON.stringify(todos))
  //   return new Response(JSON.stringify(todo), {
  //     headers: { 'Content-Type': 'application/json' },
  //   })
  // })
}

// 删除任务(弃用)
export async function DELETE(request) {
  return new Response('请求方法错误', { status: 405 })
  // return handleRequest(request, async (userId) => {
  //   const { env } = getRequestContext()
  //   const { id } = await request.json()
  //   const todosKey = `todos:${userId}`
  //   const todos = JSON.parse(await env.MY_KV_NAMESPACE.get(todosKey) || '[]')
  //   const newTodos = todos.filter(t => t.id !== id)
  //   await env.MY_KV_NAMESPACE.put(todosKey, JSON.stringify(newTodos))
  //   return new Response('Todo permanently deleted', { status: 200 })
  // })
}
