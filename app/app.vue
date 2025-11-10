<script setup>
// 应用初始化
const config = useRuntimeConfig()

onMounted(() => {
  console.log('App initialized:', config.public.appName)
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
