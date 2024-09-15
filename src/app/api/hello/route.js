import { getRequestContext } from '@cloudflare/next-on-pages'

export const runtime = 'edge'

export async function GET(request) {
  const { env } = getRequestContext()
  let responseText = 'Hello World'

  try {
    // 使用 Upstash Redis REST API
    const url = env.UPSTASH_REDIS_REST_URL
    const token = env.UPSTASH_REDIS_REST_TOKEN

    // 设置一个测试键值对
    const setResponse = await fetch(`${url}/set/testKey/testValue`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (!setResponse.ok) {
      throw new Error('Failed to set value in Redis')
    }

    // 获取刚刚设置的值
    const getResponse = await fetch(`${url}/get/testKey`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (!getResponse.ok) {
      throw new Error('Failed to get value from Redis')
    }

    const data = await getResponse.json()
    responseText += ` - Redis value: ${data.result}`

  } catch (error) {
    console.error('Error interacting with Upstash Redis:', error)
    responseText += ` - Error: ${error.message}`
  }

  return new Response(responseText)
}
