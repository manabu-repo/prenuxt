// https://nuxt.com/docs/api/configuration/nuxt-config
// Centralized env loader and schema validation
import { parsedEnv, NODE_ENV, allowDevtools } from './server/env'
import strip from 'vite-plugin-strip'

// Console control: enable console in 'local' and 'test', disable in others
const allowConsole = ['local', 'test'].includes(NODE_ENV)

// Source map strategy:
// - development: 'inline' (fast rebuilds, easier local debugging)
// - test: true (generate .map files to help debugging in CI or test viewers)
// - production: 'hidden' (generate source maps but don't expose via sourceMappingURL; upload to error tracking)
// If you don't want source maps in production at all, set to false.
const sourceMapSetting = NODE_ENV === 'development' ? 'inline' : NODE_ENV === 'test' ? true : 'hidden'

// Set environment variables that some client setups and libraries check to allow
// Vue devtools. We set both VUE_DEVTOOLS and VUE_APP_DEVTOOLS for broader coverage.
if (allowDevtools) {
  process.env.VUE_DEVTOOLS = 'true'
  process.env.VUE_APP_DEVTOOLS = 'true'
} else {
  process.env.VUE_DEVTOOLS = 'false'
  process.env.VUE_APP_DEVTOOLS = 'false'
}

// Allow skipping UnoCSS (useful for diagnosing build issues) by setting SKIP_UNOCSS=true
const skipUno = process.env.SKIP_UNOCSS === 'true'
const modulesList = skipUno ? ['@nuxtjs/color-mode'] : ['@unocss/nuxt', '@nuxtjs/color-mode']

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  // Enable Nuxt devtools only for allowed environments (dev/test/local).
  devtools: { enabled: allowDevtools },
  
  // HTML head 配置：预加载关键资源
  app: {
    head: {
      link: [
        // ✅ 预加载关键 CSS 文件
        { rel: 'preload', as: 'style', href: '/_nuxt/entry.css' },
        { rel: 'preload', as: 'style', href: '/_nuxt/__uno.css' },
        { rel: 'preload', as: 'style', href: '/reset/tailwind.css' },
      ],
    }
  },
  
  // 模块配置
  modules: ['@nuxt/image', ...modulesList],
  
  // @nuxt/image 配置 - 优化图片加载性能
  image: {
    // 使用默认提供者处理图片
    provider: 'ipx',
    // 图片优化配置
    format: ['webp'], // 优先使用 webp 格式
    quality: 80, // JPEG/WebP 质量
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536
    },
    // 支持标准和高清屏幕
    densities: [1, 2],
    presets: {
      avatar: {
        modifiers: {
          width: 50,
          height: 50
        }
      },
      thumbnail: {
        modifiers: {
          width: 200,
          height: 200
        }
      }
    }
  },
  
  // @nuxt/content configuration
  content: {
    sources: {
      docs: {
        driver: 'fs',
        base: './md'
      }
    }
  },
  
  // UnoCSS 配置
  css: [
    '@unocss/reset/tailwind.css',
    '~/assets/css/main.css'
  ],
  
  // UnoCSS 优化配置
  unocss: {
    // ✅ 预缓存常用类名，加快首屏 CSS 生成
    safelist: [
      'flex', 'flex-col', 'lg:flex-row',
      'items-center', 'justify-center',
      'min-h-screen', 'bg-gray-50', 'p-4', 'gap-4',
      'w-full', 'lg:w-1/2', 'max-w-2xl',
      'flex-shrink-0', 'overflow-hidden',
      'rounded-lg', 'shadow-lg',
      'w-full', 'h-full', 'object-cover'
    ]
  },
  
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
      // Source maps strategy (see top-level `sourceMapSetting` for policy)
      sourcemap: sourceMapSetting as any,
      // If console is NOT allowed, instruct terser to drop console/debugger in built bundles
      terserOptions: !allowConsole && NODE_ENV === 'production' ? {
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      } : undefined
    },
    // 图片优化配置
    assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg', '**/*.webp'],
    ssr: {
      // 确保导入的图片在 SSR 时也能被正确处理
      external: []
    }
  }
})
