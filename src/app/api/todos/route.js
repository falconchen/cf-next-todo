import { getRequestContext } from '@cloudflare/next-on-pages'

export const runtime = 'edge'

async function getUserId(request) {
  // 这里应该实现用户认证逻辑
  // 暂时使用一个模拟的userId
  return 'user123'
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
  const updatedTodo = await request.json()
  const todosKey = `todos:${userId}`
  const todos = JSON.parse(await env.MY_KV_NAMESPACE.get(todosKey) || '[]')
  const index = todos.findIndex(t => t.id === updatedTodo.id)
  if (index !== -1) {
    todos[index] = updatedTodo
    await env.MY_KV_NAMESPACE.put(todosKey, JSON.stringify(todos))
    return new Response(JSON.stringify(updatedTodo), {
      headers: { 'Content-Type': 'application/json' },
    })
  }
  return new Response('Todo not found', { status: 404 })
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
