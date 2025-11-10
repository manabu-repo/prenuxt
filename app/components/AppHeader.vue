<script setup lang="ts">
const config = useRuntimeConfig()
</script>

<template>
  <header class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
    <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center gap-8">
          <NuxtLink 
            to="/" 
            class="text-xl font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            {{ config.public.appName }}
          </NuxtLink>
          
          <div class="hidden md:flex gap-6">
            <NuxtLink 
              to="/" 
              class="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium"
              active-class="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
            >
              首页
            </NuxtLink>
            <NuxtLink 
              to="/projects" 
              class="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium"
              active-class="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
            >
              项目
            </NuxtLink>
            <NuxtLink 
              to="/settings" 
              class="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium"
              active-class="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
            >
              设置
            </NuxtLink>
          </div>
        </div>
        
        <div class="text-sm text-gray-500 dark:text-gray-400">
          v{{ config.public.appVersion }}
        </div>
      </div>
    </nav>
  </header>
</template>
