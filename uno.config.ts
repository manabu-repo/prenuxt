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
    ['text-gradient', 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent']
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
      }
    }
  },
  
  // 安全列表 - 确保这些类不会被清除
  safelist: [
    'bg-red-500',
    'bg-green-500',
    'bg-blue-500'
  ]
})
