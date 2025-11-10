export interface AppSettings {
  appearance: {
    theme: 'light' | 'dark' | 'system'
    language: string
    fontSize: 'small' | 'medium' | 'large'
  }
  notifications: {
    email: boolean
    push: boolean
    updates: boolean
  }
  privacy: {
    analytics: boolean
    cookies: boolean
  }
}

const DEFAULT_SETTINGS: AppSettings = {
  appearance: {
    theme: 'system',
    language: 'zh-CN',
    fontSize: 'medium'
  },
  notifications: {
    email: true,
    push: false,
    updates: true
  },
  privacy: {
    analytics: true,
    cookies: true
  }
}

export const useSettings = () => {
  const colorMode = useColorMode()
  
  // 使用 useState 在 SSR 和客户端之间共享状态
  const settings = useState<AppSettings>('app-settings', () => {
    // 在客户端从 localStorage 加载设置
    if (process.client) {
      const stored = localStorage.getItem('app-settings')
      if (stored) {
        try {
          return JSON.parse(stored)
        } catch (e) {
          console.error('Failed to parse stored settings:', e)
        }
      }
    }
    return { ...DEFAULT_SETTINGS }
  })

  const saving = ref(false)
  const error = ref<Error | null>(null)

  // 保存设置
  const saveSettings = async () => {
    saving.value = true
    error.value = null
    
    try {
      // 应用主题设置
      colorMode.preference = settings.value.appearance.theme
      
      // 保存到 localStorage
      if (process.client) {
        localStorage.setItem('app-settings', JSON.stringify(settings.value))
      }
      
      // TODO: 可选 - 保存到服务器
      // await $fetch('/api/settings', { method: 'PUT', body: settings.value })
      
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      saving.value = false
    }
  }

  // 重置设置
  const resetSettings = () => {
    settings.value = { ...DEFAULT_SETTINGS }
    if (process.client) {
      localStorage.removeItem('app-settings')
    }
  }

  // 更新单个设置
  const updateSetting = <K extends keyof AppSettings>(
    category: K,
    key: keyof AppSettings[K],
    value: any
  ) => {
    (settings.value[category] as any)[key] = value
  }

  // 初始化 - 在客户端加载时同步主题
  if (process.client) {
    colorMode.preference = settings.value.appearance.theme
  }

  return {
    settings,
    saving: readonly(saving),
    error: readonly(error),
    saveSettings,
    resetSettings,
    updateSetting
  }
}
