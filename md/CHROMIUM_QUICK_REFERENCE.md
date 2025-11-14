# @sparticuz/chromium 快速参考

## 🚀 快速开始

### 1. 安装依赖

```bash
pnpm add @sparticuz/chromium puppeteer-core
```

### 2. 在代码中使用

```typescript
// 使用统一接口
const { exportToPdf } = usePdfExport()

await exportToPdf('#content', {
  mode: 'chromium',  // 🚀 Serverless 优化
  format: 'A4',
  margin: [20, 15, 25, 15]
})
```

---

## 📊 核心优势

| 特性 | @sparticuz/chromium | Playwright |
|------|---------------------|------------|
| 二进制大小 | ~50MB | ~300MB |
| 冷启动时间 | 2-3 秒 | 3-4 秒 |
| 内存占用 | 150-200MB | 250-300MB |
| Serverless 适用 | ✅ 优秀 | ⚠️ 可能超限 |

---

## 🎯 使用场景

### ✅ 统一推荐使用 @sparticuz/chromium

**本地和生产环境都使用 chromium 模式：**

- ✅ 本地开发：自动处理权限，统一使用优化二进制
- ✅ 生产环境：部署到 Vercel/Netlify/Lambda
- ✅ 一致性保证：本地测试 = 生产环境
- ✅ 无需安装：不需要系统 Chrome

### 📝 使用 Playwright 的场景

- ✅ 需要完整浏览器功能（截图、录制等）
- ✅ 自动化测试和 E2E 测试
- ✅ 需要调试和查看浏览器界面
- ✅ 多浏览器支持（Chromium、Firefox、WebKit）

---

## 📁 项目文件结构

```
server/api/
└── export-chromium.post.ts    # Serverless 优化的 API

app/composables/
├── useChromium.ts              # 客户端封装
└── usePdfExport.ts             # 统一接口（支持 6 种方案）

md/
└── CHROMIUM_IMPLEMENTATION.md  # 完整实现文档
```

---

## 🔧 API 参数

### ChromiumPdfOptions

```typescript
interface ChromiumPdfOptions {
  format?: 'A4' | 'A3' | 'Letter' | 'Legal' | 'Tabloid'  // 默认 'A4'
  printBackground?: boolean                              // 默认 true
  margin?: {
    top?: string      // 例如 '20mm'
    right?: string
    bottom?: string
    left?: string
  }
  displayHeaderFooter?: boolean  // 默认 false
  headerTemplate?: string
  footerTemplate?: string
  landscape?: boolean            // 默认 false
  scale?: number                 // 默认 1
  pageRanges?: string            // 例如 '1-5, 8, 11-13'
}
```

---

## 💻 代码示例

### 基础使用

```typescript
const { exportToPdf, downloadPdf } = useChromium()

// 导出 HTML
const blob = await exportToPdf('<h1>Hello World</h1>', {
  format: 'A4',
  printBackground: true
})

// 下载 PDF
downloadPdf(blob, 'my-document.pdf')
```

### 导出 Quill 编辑器

```typescript
const { exportQuillToPdf } = useChromium()

const blob = await exportQuillToPdf(quillHtmlContent, {
  format: 'A4',
  margin: { top: '20mm', right: '15mm', bottom: '25mm', left: '15mm' }
})
```

### 在新标签页预览

```typescript
const { previewPdf } = useChromium()

previewPdf(blob)
```

---

## 🐛 常见问题

### 1. "spawn ENOEXEC" 或 "Could not find Chromium"

**原因**：本地开发环境未找到 Chrome 浏览器

**解决方案（选择其一）**：

**方案 1：安装 Google Chrome（推荐）**
```bash
# macOS
brew install --cask google-chrome

# 或直接下载安装
# https://www.google.com/chrome/
```

**方案 2：本地开发使用 Playwright**
```typescript
// 本地开发推荐使用 playwright 模式
await exportToPdf('#content', {
  mode: 'playwright'  // 本地开发使用
})

// 生产环境使用 chromium 模式
await exportToPdf('#content', {
  mode: 'chromium'    // 生产环境使用
})
```

**方案 3：环境变量配置**
```bash
# .env.development
PDF_ENGINE=playwright

# .env.production
PDF_ENGINE=chromium
```

### 2. Lambda 部署包过大

**解决**：使用 Lambda Layer
```bash
make chromium.x64.zip
aws lambda publish-layer-version --layer-name chromium ...
```

### 3. 本地开发时想看到浏览器界面

**解决**：使用 Playwright（开发环境）
```typescript
await exportToPdf('#content', {
  mode: 'playwright'  // 支持 headless: false
})
```

---

## ⚙️ 本地开发配置

### 方式 1：安装 Chrome（推荐）

本地开发时，API 会自动检测并使用系统安装的 Chrome：

```bash
# macOS
brew install --cask google-chrome
```

### 方式 2：使用 Playwright

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      // 根据环境自动选择
      pdfEngine: process.env.NODE_ENV === 'production' ? 'chromium' : 'playwright'
    }
  }
})
```

### 方式 3：混合使用

```vue
<script setup>
const isDev = process.dev

// 开发环境用 playwright，生产用 chromium
const pdfMode = isDev ? 'playwright' : 'chromium'

await exportToPdf('#content', { mode: pdfMode })
</script>
```

---

## 🎉 6 种 PDF 方案对比

| 方案 | 类型 | 大小 | 分页 | 推荐场景 |
|------|------|------|------|----------|
| html2pdf | 客户端 | 大 | ✅ | 保留样式 |
| jsPDF | 客户端 | 小 | ✅ | 简单文本 |
| pdfmake | 客户端 | 中 | ✅ | 结构化 |
| dompdf | 客户端 | 大 | ❌ | 单页内容 |
| **chromium** | 服务端 | 小 | ✅ | **生产环境** 🚀 |
| playwright | 服务端 | 大 | ✅ | 本地开发 |

---

## 📚 更多资源

- [完整实现文档](./CHROMIUM_IMPLEMENTATION.md)
- [@sparticuz/chromium GitHub](https://github.com/Sparticuz/chromium)
- [Puppeteer 文档](https://pptr.dev/)

---

## 🎯 推荐配置

**环境变量配置：**

```bash
# .env.production
PDF_ENGINE=chromium

# .env.development  
PDF_ENGINE=playwright
```

**Nuxt 配置：**

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      pdfEngine: process.env.PDF_ENGINE || 'chromium'
    }
  }
})
```
