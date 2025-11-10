// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  
  // 模块配置
  modules: [
    '@unocss/nuxt',
    '@nuxtjs/color-mode'
  ],
  
  // UnoCSS 配置
  css: [
    '@unocss/reset/tailwind.css',
    '~/assets/css/main.css'
  ],
  
  // Color Mode 配置
  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'light'
  },
  
  // 运行时配置
  runtimeConfig: {
    public: {
      appName: 'PreNuxt',
      appVersion: '1.0.0',
      apiBase: process.env.API_BASE_URL || 'http://localhost:3000/api'
    }
  }
})
