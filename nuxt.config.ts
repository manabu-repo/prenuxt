// https://nuxt.com/docs/api/configuration/nuxt-config
// Centralized env loader and schema validation
import { parsedEnv, NODE_ENV, allowDevtools} from './server/env'

// Set environment variables that some client setups and libraries check to allow
// Vue devtools. We set both VUE_DEVTOOLS and VUE_APP_DEVTOOLS for broader coverage.
if (allowDevtools) {
  process.env.VUE_DEVTOOLS = 'true'
  process.env.VUE_APP_DEVTOOLS = 'true'
} else {
  process.env.VUE_DEVTOOLS = 'false'
  process.env.VUE_APP_DEVTOOLS = 'false'
}

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  // Enable Nuxt devtools only for allowed environments (dev/test/local).
  devtools: { enabled: allowDevtools },
  
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
  // Expose selected env vars to the client via `public` runtime config.
  runtimeConfig: {
    public: {
      appName: parsedEnv.NUXT_PUBLIC_APP_NAME,
      appVersion: parsedEnv.NUXT_PUBLIC_APP_VERSION,
      apiBase: parsedEnv.NUXT_PUBLIC_API_BASE_URL || parsedEnv.API_BASE_URL || 'http://localhost:3000/api',
      envName: NODE_ENV
    },
    // server-only values can be added here if needed:
    // apiSecret: parsedEnv.API_SECRET
  }
})
