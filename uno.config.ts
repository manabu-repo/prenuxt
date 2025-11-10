import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup
} from 'unocss'

export default defineConfig({
  // 预设
  presets: [
    presetUno(), // 默认预设，包含 Tailwind CSS 兼容的工具类
    presetAttributify(), // 属性化模式
    presetIcons({
      collections: {
        // 图标集合
        carbon: () => import('@iconify-json/carbon/icons.json').then(i => i.default),
        mdi: () => import('@iconify-json/mdi/icons.json').then(i => i.default),
        tabler: () => import('@iconify-json/tabler/icons.json').then(i => i.default)
      },
      extraProperties: {
        display: 'inline-block',
        'vertical-align': 'middle'
      }
    }),
    presetTypography(), // 排版预设
    presetWebFonts({
      fonts: {
        sans: 'Inter:400,500,600,700',
        mono: 'Fira Code:400,500'
      }
    })
  ],
  
  // 转换器
  transformers: [
    transformerDirectives(), // 支持 @apply 指令
    transformerVariantGroup() // 支持变体组语法
  ],
  
  // 快捷方式
  shortcuts: [
    // 按钮样式
    ['btn', 'px-4 py-2 rounded inline-block bg-teal-600 text-white cursor-pointer hover:bg-teal-700 disabled:cursor-default disabled:bg-gray-600 disabled:opacity-50'],
    ['btn-primary', 'btn bg-blue-600 hover:bg-blue-700'],
    ['btn-secondary', 'btn bg-gray-600 hover:bg-gray-700'],
    ['btn-success', 'btn bg-green-600 hover:bg-green-700'],
    ['btn-warning', 'btn bg-yellow-600 hover:bg-yellow-700'],
    ['btn-danger', 'btn bg-red-600 hover:bg-red-700'],
    
    // 卡片样式
    ['card', 'p-6 rounded-lg border border-gray-200 bg-white shadow-sm'],
    ['card-dark', 'card border-gray-700 bg-gray-800 text-white'],
    
    // 输入框样式
    ['input', 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'],
    ['input-dark', 'input border-gray-600 bg-gray-700 text-white'],
    
    // 布局辅助
    ['flex-center', 'flex items-center justify-center'],
    ['flex-between', 'flex items-center justify-between'],
    ['absolute-center', 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'],
    
    // 文本样式
    ['text-gradient', 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'],
    
    // 动画
    ['animate-fade-in', 'animate-duration-300 animate-ease-in-out animate-fade-in'],
    ['animate-slide-up', 'animate-duration-300 animate-ease-out animate-slide-in-up']
  ],
  
  // 规则
  rules: [
    // 自定义规则示例
    ['shadow-glass', { 'box-shadow': '0 8px 32px 0 rgba(31, 38, 135, 0.37)' }],
    ['backdrop-glass', { 
      'backdrop-filter': 'blur(4px)', 
      '-webkit-backdrop-filter': 'blur(4px)',
      'background': 'rgba(255, 255, 255, 0.18)',
      'border': '1px solid rgba(255, 255, 255, 0.18)'
    }],
    // 动态规则
    [/^grid-cols-(\d+)$/, ([, d]: string[]) => ({ 'grid-template-columns': `repeat(${d}, minmax(0, 1fr))` })],
    [/^grid-rows-(\d+)$/, ([, d]: string[]) => ({ 'grid-template-rows': `repeat(${d}, minmax(0, 1fr))` })]
  ],
  
  // 主题配置
  theme: {
    colors: {
      primary: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a'
      },
      gray: {
        50: '#f9fafb',
        100: '#f3f4f6',
        200: '#e5e7eb',
        300: '#d1d5db',
        400: '#9ca3af',
        500: '#6b7280',
        600: '#4b5563',
        700: '#374151',
        800: '#1f2937',
        900: '#111827'
      }
    },
    fontFamily: {
      sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      mono: ['Fira Code', 'ui-monospace', 'monospace']
    },
    animation: {
      keyframes: {
        'fade-in': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 }
        },
        'slide-in-up': {
          '0%': { transform: 'translateY(100%)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 }
        }
      }
    }
  },
  
  // 安全列表 - 确保这些类不会被清除
  safelist: [
    'bg-red-500',
    'bg-green-500',
    'bg-blue-500',
    'bg-yellow-500',
    'text-red-500',
    'text-green-500',
    'text-blue-500',
    'text-yellow-500'
  ],
  
  // 内容检测配置
  content: {
    pipeline: {
      include: [
        /\.(vue|svelte|[jt]sx?|mdx?|astro|elm|php|phtml|html)($|\?)/,
        'components/**/*.{vue,js,ts}',
        'layouts/**/*.vue',
        'pages/**/*.vue',
        'composables/**/*.{js,ts}',
        'plugins/**/*.{js,ts}',
        'app.vue'
      ]
    }
  }
})
