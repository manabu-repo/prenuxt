/**
 * Demo 路由中间件
 * 拦截所有 /demo 路由，检查是否允许访问
 * 在生产环境中可以返回 404，或根据需要进行重定向
 */

export default defineEventHandler((event) => {
  const path = event.node.req.url || '/'
  
  // 检查是否为 demo 路由
  if (path.startsWith('/demo') || path.startsWith('/demo/')) {
    const config = useRuntimeConfig()
    const isDemoAllowed = config.public.enablePdfExport !== false
    
    if (!isDemoAllowed) {
      // 禁用时返回 404
      throw createError({
        statusCode: 404,
        statusMessage: 'Demo routes are not available in this environment'
      })
    }
    
    // 可选：添加日志记录
    console.log(`[DEMO] 访问演示路由: ${path}`, {
      timestamp: new Date().toISOString(),
      userAgent: getHeader(event, 'user-agent')
    })
    
    // 添加响应头标记这是 demo 请求
    setHeader(event, 'X-Demo-Route', 'true')
  }
})
