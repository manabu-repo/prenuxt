// https://nuxt.com/docs/api/configuration/nuxt-config
// Centralized env loader and schema validation
import { parsedEnv, NODE_ENV, allowDevtools } from './server/env'
import strip from 'vite-plugin-strip'

// Console control: enable console in 'local' and 'test', disable in others
const allowConsole = ['local', 'test'].includes(NODE_ENV)

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
  },

  // Vite build configuration: in production we strip console/debugger using terser.
  vite: {
    plugins: [
      // Remove console/debugger calls during dev and build when consoles are not allowed
      // (we cast to any to avoid type mismatches between vite/plugin versions)
      ...(allowConsole ? [] : [ (strip as any)({
        include: ['**/*.(ts|js|vue)'],
        functions: ['console.*'],
        debugger: true
      }) as any ])
    ],
    build: {
      // Use terser in production to allow drop_console option; esbuild is faster but
      // doesn't support all terser options. We switch based on NODE_ENV.
      minify: NODE_ENV === 'production' ? 'terser' : 'esbuild',
      // If console is NOT allowed, instruct terser to drop console/debugger in built bundles
      terserOptions: !allowConsole && NODE_ENV === 'production' ? {
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      } : undefined
    }
  }
})
