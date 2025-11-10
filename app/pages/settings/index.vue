<script setup>
const colorMode = useColorMode()
const config = useRuntimeConfig()

// 页面元数据
useHead({
  title: '设置',
  meta: [
    { name: 'description', content: '应用设置和配置' }
  ]
})

// 设置数据
const settings = ref({
  appearance: {
    theme: colorMode.preference,
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
})

// 保存设置
const saving = ref(false)
const saveSettings = async () => {
  saving.value = true
  // 应用主题设置
  colorMode.preference = settings.value.appearance.theme
  
  // 模拟保存
  await new Promise(resolve => setTimeout(resolve, 1000))
  saving.value = false
  
  alert('设置保存成功！')
}

// 重置设置
const resetSettings = () => {
  if (confirm('确定要重置所有设置吗？')) {
    settings.value = {
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
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- 页头 -->
    <div>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">设置</h1>
      <p class="text-gray-600 dark:text-gray-400 mt-1">
        管理应用的外观、通知和隐私设置
      </p>
    </div>
    
    <!-- 设置表单 -->
    <form @submit.prevent="saveSettings" class="space-y-6">
      <!-- 外观设置 -->
      <div class="card p-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <i class="i-carbon-paint-brush w-5 h-5"></i>
          外观设置
        </h2>
        
        <div class="space-y-4">
          <!-- 主题 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              主题模式
            </label>
            <div class="grid grid-cols-3 gap-3">
              <button
                type="button"
                @click="settings.appearance.theme = 'light'"
                :class="[
                  'p-4 border-2 rounded-lg text-center transition-all',
                  settings.appearance.theme === 'light'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                ]"
              >
                <i class="i-carbon-light w-6 h-6 mx-auto mb-2"></i>
                <div class="text-sm font-medium">浅色</div>
              </button>
              
              <button
                type="button"
                @click="settings.appearance.theme = 'dark'"
                :class="[
                  'p-4 border-2 rounded-lg text-center transition-all',
                  settings.appearance.theme === 'dark'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                ]"
              >
                <i class="i-carbon-asleep w-6 h-6 mx-auto mb-2"></i>
                <div class="text-sm font-medium">深色</div>
              </button>
              
              <button
                type="button"
                @click="settings.appearance.theme = 'system'"
                :class="[
                  'p-4 border-2 rounded-lg text-center transition-all',
                  settings.appearance.theme === 'system'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                ]"
              >
                <i class="i-carbon-laptop w-6 h-6 mx-auto mb-2"></i>
                <div class="text-sm font-medium">跟随系统</div>
              </button>
            </div>
          </div>
          
          <!-- 语言 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              语言
            </label>
            <select v-model="settings.appearance.language" class="input w-full">
              <option value="zh-CN">简体中文</option>
              <option value="en-US">English</option>
              <option value="ja-JP">日本語</option>
            </select>
          </div>
          
          <!-- 字体大小 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              字体大小
            </label>
            <select v-model="settings.appearance.fontSize" class="input w-full">
              <option value="small">小</option>
              <option value="medium">中</option>
              <option value="large">大</option>
            </select>
          </div>
        </div>
      </div>
      
      <!-- 通知设置 -->
      <div class="card p-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <i class="i-carbon-notification w-5 h-5"></i>
          通知设置
        </h2>
        
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <div class="font-medium text-gray-900 dark:text-white">邮件通知</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">接收重要更新的邮件通知</div>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input v-model="settings.notifications.email" type="checkbox" class="sr-only peer" />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div class="flex items-center justify-between">
            <div>
              <div class="font-medium text-gray-900 dark:text-white">推送通知</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">浏览器推送通知</div>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input v-model="settings.notifications.push" type="checkbox" class="sr-only peer" />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div class="flex items-center justify-between">
            <div>
              <div class="font-medium text-gray-900 dark:text-white">产品更新</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">接收新功能和更新通知</div>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input v-model="settings.notifications.updates" type="checkbox" class="sr-only peer" />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
      
      <!-- 隐私设置 -->
      <div class="card p-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <i class="i-carbon-security w-5 h-5"></i>
          隐私设置
        </h2>
        
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <div class="font-medium text-gray-900 dark:text-white">数据分析</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">帮助我们改进产品体验</div>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input v-model="settings.privacy.analytics" type="checkbox" class="sr-only peer" />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div class="flex items-center justify-between">
            <div>
              <div class="font-medium text-gray-900 dark:text-white">Cookie</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">允许使用 Cookie 改善体验</div>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input v-model="settings.privacy.cookies" type="checkbox" class="sr-only peer" />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
      
      <!-- 系统信息 -->
      <div class="card p-6 bg-gray-50 dark:bg-gray-800/50">
        <h3 class="font-semibold text-gray-900 dark:text-white mb-3">系统信息</h3>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">应用名称</span>
            <span class="text-gray-900 dark:text-white font-medium">{{ config.public.appName }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">版本</span>
            <span class="text-gray-900 dark:text-white font-medium">{{ config.public.appVersion }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">当前主题</span>
            <span class="text-gray-900 dark:text-white font-medium">{{ colorMode.value }}</span>
          </div>
        </div>
      </div>
      
      <!-- 操作按钮 -->
      <div class="flex justify-between">
        <button
          type="button"
          @click="resetSettings"
          class="btn text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <i class="i-carbon-reset w-4 h-4"></i>
          重置设置
        </button>
        
        <button
          type="submit"
          class="btn-primary"
          :disabled="saving"
        >
          <i v-if="!saving" class="i-carbon-save w-4 h-4"></i>
          <i v-else class="i-carbon-renew w-4 h-4 animate-spin"></i>
          {{ saving ? '保存中...' : '保存设置' }}
        </button>
      </div>
    </form>
  </div>
</template>
