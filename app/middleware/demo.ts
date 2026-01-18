/**
 * Demo 路由的 Nuxt 导航中间件
 * 在客户端拦截 demo 路由的导航请求
 */
export default defineNuxtRouteMiddleware(async (to, from) => {
  // 检查是否尝试访问 demo 路由
  // if (to.path.startsWith('/demo')) {
  //   // 获取运行时配置
  //   const config = useRuntimeConfig()
    
  //   // 如果 PDF 功能未启用，则重定向到首页
  //   if (!config.public.enablePdfExport) {
  //     console.warn(`[DEMO Middleware] Demo route access denied: ${to.path}`)
      
  //     // 返回到首页而不是显示 404
  //     return navigateTo('/')
  //   }
  // }

  if (to.path.startsWith('/demo')) {
    // 开发环境允许访问
    if (import.meta.dev) {
      return
    }

    // 生产环境重定向或返回404
    if (process.env.NODE_ENV === 'production') {
      // 方案1: 重定向到首页
      return navigateTo('/')

      // 方案2: 返回404页面
      // throw createError({
      //   statusCode: 404,
      //   statusMessage: 'Page Not Found'
      // })
    }
  }
})
