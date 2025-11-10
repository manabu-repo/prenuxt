<script setup>
const config = useRuntimeConfig()

// 页面元数据
useHead({
  title: '首页',
  meta: [
    { name: 'description', content: '欢迎来到 Nuxt 3 应用' }
  ]
})
</script>

<template>
  <div class="space-y-8">
    <!-- 欢迎区域 -->
    <div class="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 text-white">
      <h1 class="text-4xl font-bold mb-4">
        欢迎来到 {{ config.public.appName }}
      </h1>
      <p class="text-xl text-blue-100 mb-6">
        使用 Nuxt 3 + UnoCSS 构建的现代化 Web 应用
      </p>
      <div class="flex gap-4">
        <NuxtLink 
          to="/projects" 
          class="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
        >
          查看项目
        </NuxtLink>
        <NuxtLink 
          to="/settings" 
          class="px-6 py-3 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors"
        >
          前往设置
        </NuxtLink>
      </div>
    </div>
    
    <!-- 功能特性 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="card p-6">
        <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
          <i class="i-carbon-rocket text-2xl text-blue-600 dark:text-blue-400"></i>
        </div>
        <h3 class="text-lg font-semibold mb-2 text-gray-900 dark:text-white">快速开发</h3>
        <p class="text-gray-600 dark:text-gray-400 text-sm">
          基于 Nuxt 3 的强大功能，实现快速开发和部署
        </p>
      </div>
      
      <div class="card p-6">
        <div class="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
          <i class="i-carbon-paint-brush text-2xl text-green-600 dark:text-green-400"></i>
        </div>
        <h3 class="text-lg font-semibold mb-2 text-gray-900 dark:text-white">UnoCSS 样式</h3>
        <p class="text-gray-600 dark:text-gray-400 text-sm">
          原子化 CSS 引擎，按需生成，极致性能
        </p>
      </div>
      
      <div class="card p-6">
        <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
          <i class="i-carbon-lightning text-2xl text-purple-600 dark:text-purple-400"></i>
        </div>
        <h3 class="text-lg font-semibold mb-2 text-gray-900 dark:text-white">高性能</h3>
        <p class="text-gray-600 dark:text-gray-400 text-sm">
          服务端渲染、自动代码分割、优化的构建输出
        </p>
      </div>
    </div>
    
    <!-- 快速开始 -->
    <div class="card p-8">
      <h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">快速开始</h2>
      <div class="space-y-4">
        <div class="flex items-start gap-4">
          <div class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
            1
          </div>
          <div>
            <h4 class="font-semibold text-gray-900 dark:text-white mb-1">浏览项目</h4>
            <p class="text-gray-600 dark:text-gray-400 text-sm">
              访问 <NuxtLink to="/projects" class="text-blue-600 hover:underline">项目页面</NuxtLink> 查看所有项目
            </p>
          </div>
        </div>
        
        <div class="flex items-start gap-4">
          <div class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
            2
          </div>
          <div>
            <h4 class="font-semibold text-gray-900 dark:text-white mb-1">配置设置</h4>
            <p class="text-gray-600 dark:text-gray-400 text-sm">
              在 <NuxtLink to="/settings" class="text-blue-600 hover:underline">设置页面</NuxtLink> 自定义应用配置
            </p>
          </div>
        </div>
        
        <div class="flex items-start gap-4">
          <div class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
            3
          </div>
          <div>
            <h4 class="font-semibold text-gray-900 dark:text-white mb-1">开始开发</h4>
            <p class="text-gray-600 dark:text-gray-400 text-sm">
              查看文档，了解更多关于 Nuxt 3 和 UnoCSS 的使用方法
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
