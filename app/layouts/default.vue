<script setup lang="ts">
// 应用初始化
const config = useRuntimeConfig()

onMounted(() => {
  console.log('App initialized:', config.public.appName)
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <NuxtRouteAnnouncer />
    <AppHeader />
    
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>
  </div>
</template>
