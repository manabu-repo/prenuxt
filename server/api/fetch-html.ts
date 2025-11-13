/**
 * 服务端代理 API - 获取远程页面 HTML
 * 解决客户端跨域问题
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const targetUrl = query.url as string

  if (!targetUrl) {
    throw createError({
      statusCode: 400,
      message: '缺少 url 参数'
    })
  }

  // 验证 URL 格式
  try {
    new URL(targetUrl)
  } catch {
    throw createError({
      statusCode: 400,
      message: '无效的 URL 格式'
    })
  }

  try {
    // 使用 ofetch 或 $fetch 获取远程内容
    const response = await $fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      // 设置超时
      timeout: 30000
    })

    return {
      success: true,
      html: response,
      url: targetUrl
    }
  } catch (error: any) {
    console.error('Fetch error:', error)
    throw createError({
      statusCode: 500,
      message: `获取页面失败: ${error.message || '未知错误'}`
    })
  }
})
