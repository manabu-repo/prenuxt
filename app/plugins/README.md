# Nuxt Plugins 使用指南

## 插件类型和执行顺序

### 1. 文件命名约定
- `plugin-name.ts` - 通用插件，在客户端和服务端都运行
- `plugin-name.client.ts` - 只在客户端运行
- `plugin-name.server.ts` - 只在服务端运行
- `00.plugin-name.ts` - 数字前缀控制执行顺序（00最先执行）

### 2. 插件执行时机
- **服务端渲染时**: 在服务器上运行，用于初始化服务端状态
- **客户端激活时**: 在浏览器中运行，用于客户端特定功能
- **路由变化时**: 不会重新执行，只在应用启动时执行一次

## 常见使用场景总结

### 1. 第三方库集成
```typescript
// plugins/ui-library.client.ts
import ElementPlus from 'element-plus'
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(ElementPlus)
})
```

### 2. 全局API扩展
```typescript
// plugins/global-api.ts
export default defineNuxtPlugin(() => {
  return {
    provide: {
      api: {
        formatDate: (date) => { /* ... */ },
        formatCurrency: (amount) => { /* ... */ }
      }
    }
  }
})
```

### 3. 状态管理初始化
```typescript
// plugins/global-state.ts
export default defineNuxtPlugin(() => {
  const globalState = reactive({
    user: null,
    theme: 'light'
  })
  
  return {
    provide: {
      globalState,
      stateManager: {
        setUser: (user) => globalState.user = user
      }
    }
  }
})
```

### 4. HTTP客户端配置
```typescript
// plugins/http-client.ts
export default defineNuxtPlugin(() => {
  const http = {
    get: (url) => fetch(url).then(r => r.json()),
    post: (url, data) => fetch(url, { method: 'POST', body: JSON.stringify(data) })
  }
  
  return {
    provide: { http }
  }
})
```

### 5. 国际化/本地化
```typescript
// plugins/i18n.ts
export default defineNuxtPlugin(() => {
  const messages = { /* 语言包 */ }
  const t = (key) => { /* 翻译逻辑 */ }
  
  return {
    provide: { t }
  }
})
```

### 6. 错误处理和日志
```typescript
// plugins/logger.ts
export default defineNuxtPlugin((nuxtApp) => {
  const logger = {
    error: (msg, data) => console.error(msg, data),
    info: (msg, data) => console.log(msg, data)
  }
  
  // 全局错误处理
  nuxtApp.vueApp.config.errorHandler = (error) => {
    logger.error('Vue Error', error)
  }
  
  return {
    provide: { logger }
  }
})
```

### 7. 性能监控
```typescript
// plugins/analytics.ts
export default defineNuxtPlugin(() => {
  const analytics = {
    trackPageView: (path) => { /* 追踪页面访问 */ },
    trackEvent: (event, data) => { /* 追踪事件 */ }
  }
  
  return {
    provide: { analytics }
  }
})
```

### 8. 开发工具
```typescript
// plugins/dev-tools.client.ts
export default defineNuxtPlugin(() => {
  if (process.dev) {
    const debugTools = {
      showComponentBounds: () => { /* 显示组件边界 */ }
    }
    
    return {
      provide: { debugTools }
    }
  }
})
```

## 在组件中使用插件

### 1. 通过 useNuxtApp 使用
```vue
<script setup>
const { $api, $logger, $analytics } = useNuxtApp()

const handleClick = () => {
  $analytics.trackEvent('button_click')
  $logger.info('Button clicked')
}
</script>
```

### 2. 类型安全的使用方式
```typescript
// types/nuxt.d.ts
declare module '#app' {
  interface NuxtApp {
    $api: {
      formatDate: (date: Date) => string
      formatCurrency: (amount: number) => string
    }
    $logger: {
      info: (message: string, data?: any) => void
      error: (message: string, data?: any) => void
    }
  }
}
```

## 最佳实践

1. **插件应该是无状态的**: 避免在插件中维护可变状态
2. **合理使用执行环境**: 区分客户端和服务端插件
3. **控制执行顺序**: 使用数字前缀或依赖关系
4. **错误处理**: 插件中的错误会影响整个应用启动
5. **性能考虑**: 插件在应用启动时执行，避免耗时操作
6. **类型安全**: 为插件提供的功能添加TypeScript类型定义

## 调试插件

1. **检查执行顺序**: 在插件中添加console.log查看执行顺序
2. **使用Vue DevTools**: 检查插件提供的状态和方法
3. **条件执行**: 使用环境变量控制插件的执行
