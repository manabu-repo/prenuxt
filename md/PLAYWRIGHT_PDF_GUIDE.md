# Playwright PDF 导出指南

## 概述

Playwright 是下一代浏览器自动化工具，提供了最佳的 PDF 导出质量：
- ✅ **文字完全可选** - 原生文本渲染
- ✅ **样式完整保留** - CSS 完美还原
- ✅ **服务端渲染** - 无浏览器限制
- ✅ **多引擎支持** - Chromium/Firefox/WebKit

## 安装

```bash
# 安装 Playwright
pnpm add -D playwright @playwright/test

# 安装浏览器（Chromium）
npx playwright install chromium
```

## 架构

```
客户端 (usePlaywright.ts)
    ↓ HTTP POST
服务端 API (/api/export-pdf)
    ↓ Playwright
Chromium 浏览器
    ↓ 渲染
高质量 PDF (文字可选 + 样式完整)
```

## 使用方式

### 1. 基础使用

```typescript
const { isExporting, exportQuillToPdf } = usePdfExport()

await exportQuillToPdf(editorElement, {
  mode: 'playwright',  // 使用 Playwright 模式
  printBackground: true
})
```

### 2. 直接使用

```typescript
const { exportQuillToPdf } = usePlaywright()

await exportQuillToPdf(editorElement, {
  margin: { top: '20mm', right: '15mm', bottom: '25mm', left: '15mm' },
  format: 'A4',
  printBackground: true
})
```

### 3. 自定义页眉页脚

```typescript
const { exportWithHeaderFooter } = usePlaywright()

await exportWithHeaderFooter(element, {
  displayHeaderFooter: true,
  headerTemplate: '<div style="font-size: 10px; text-align: center;">我的文档</div>',
  footerTemplate: '<div style="font-size: 10px; text-align: center;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>'
})
```

## API 参考

### usePlaywright()

#### exportToPdf(element, options)

导出普通 HTML 元素为 PDF。

**参数:**
- `element`: `HTMLElement | string` - HTML 元素或选择器
- `options`: `PlaywrightPdfOptions` - 导出选项

**选项:**
```typescript
interface PlaywrightPdfOptions {
  margin?: {
    top?: string      // 默认: '20mm'
    right?: string    // 默认: '15mm'
    bottom?: string   // 默认: '25mm'
    left?: string     // 默认: '15mm'
  }
  format?: 'A4' | 'A3' | 'A5' | 'Letter' | 'Legal' | 'Tabloid'
  printBackground?: boolean          // 默认: true
  displayHeaderFooter?: boolean      // 默认: false
  headerTemplate?: string
  footerTemplate?: string
  preferCSSPageSize?: boolean
  customCss?: string
}
```

#### exportQuillToPdf(editorContainer, options)

导出 Quill 编辑器为 PDF。

**参数:**
- `editorContainer`: `HTMLElement | string` - 编辑器容器或选择器
- `options`: `PlaywrightPdfOptions` - 导出选项

#### exportWithHeaderFooter(element, options)

导出带页眉页脚的 PDF。

## 服务端 API

### POST /api/export-pdf

**请求体:**
```json
{
  "html": "<div>HTML 内容</div>",
  "css": "自定义 CSS 样式",
  "options": {
    "margin": { "top": "20mm", "right": "15mm", "bottom": "25mm", "left": "15mm" },
    "format": "A4",
    "printBackground": true,
    "displayHeaderFooter": false,
    "headerTemplate": "",
    "footerTemplate": ""
  }
}
```

**响应:**
- Content-Type: `application/pdf`
- 返回 PDF 二进制数据

## 特性对比

| 特性 | Playwright | html2pdf | jspdf |
|------|-----------|----------|-------|
| 文字可选 | ✅ 完全 | ❌ | ✅ 完全 |
| 样式保留 | ✅ 完整 | ✅ 完整 | ❌ 基础 |
| 图片支持 | ✅ | ✅ | ❌ |
| 表格格式 | ✅ | ✅ | ❌ |
| 颜色样式 | ✅ | ✅ | ❌ |
| 字体支持 | ✅ 全部 | ✅ 全部 | ⚠️ 部分 |
| 运行环境 | 服务端 | 客户端 | 客户端 |
| 文件大小 | 中等 | 较大 | 较小 |
| 导出速度 | 中等 | 较慢 | 快速 |
| 部署要求 | 需要 Node.js | 无 | 无 |

## 优势

### 1. 最佳质量
- 使用真实浏览器引擎渲染
- 与网页显示完全一致
- 支持所有 CSS 特性

### 2. 文字可选
- 原生文本渲染
- 可复制、可搜索
- 支持 PDF 文本提取

### 3. 灵活配置
- 自定义页眉页脚
- 页边距控制
- 多种纸张格式

### 4. 稳定可靠
- 微软官方维护
- 成熟的测试工具
- 广泛的社区支持

## 限制

### 1. 服务端依赖
- 需要 Node.js 后端
- 无法纯客户端运行

### 2. 资源消耗
- 需要启动浏览器进程
- 内存占用较高（~100-200MB）
- 并发受限

### 3. 部署要求
- 需要安装浏览器二进制文件
- Docker 部署需要特殊配置

## 性能优化

### 1. 浏览器复用

```typescript
// 生产环境建议复用浏览器实例
let browser: Browser | null = null

async function getBrowser() {
  if (!browser) {
    browser = await chromium.launch({ headless: true })
  }
  return browser
}

// 使用完后不关闭，保持复用
const page = await (await getBrowser()).newPage()
```

### 2. 并发控制

```typescript
// 使用队列限制并发数
import pLimit from 'p-limit'

const limit = pLimit(3) // 最多 3 个并发

const tasks = urls.map(url => 
  limit(() => exportToPdf(url))
)

await Promise.all(tasks)
```

### 3. 超时控制

```typescript
await page.pdf({
  timeout: 30000 // 30 秒超时
})
```

## Docker 部署

### Dockerfile

```dockerfile
FROM node:20-slim

# 安装浏览器依赖
RUN apt-get update && apt-get install -y \
    chromium \
    libnss3 \
    libxss1 \
    libasound2 \
    fonts-liberation \
    libappindicator3-1 \
    && rm -rf /var/lib/apt/lists/*

# 设置 Playwright 使用系统 Chromium
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
ENV PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app
COPY . .

RUN npm install
RUN npm run build

CMD ["node", ".output/server/index.mjs"]
```

## 故障排查

### 1. 浏览器启动失败

```bash
# 检查依赖
npx playwright install-deps chromium

# 手动安装
npx playwright install chromium --force
```

### 2. 内存不足

```typescript
// 减少并发数
const limit = pLimit(1)

// 或增加超时时间
const pdf = await page.pdf({ timeout: 60000 })
```

### 3. 字体缺失

```bash
# Linux 安装中文字体
apt-get install fonts-noto-cjk
```

## 最佳实践

### 1. 生产环境配置

```typescript
const browser = await chromium.launch({
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu'
  ]
})
```

### 2. 错误处理

```typescript
try {
  const pdf = await exportToPdf(element, options)
  return pdf
} catch (error) {
  console.error('PDF 导出失败:', error)
  // 降级到 html2pdf
  return await fallbackToHtml2pdf(element)
} finally {
  await browser.close()
}
```

### 3. 资源清理

```typescript
// 确保浏览器关闭
try {
  await page.pdf(options)
} finally {
  await browser.close()
}
```

## 扩展功能

### 1. 批量导出

```typescript
async function batchExport(elements: HTMLElement[]) {
  const browser = await chromium.launch({ headless: true })
  
  try {
    const pdfs = await Promise.all(
      elements.map(async (element) => {
        const page = await browser.newPage()
        await page.setContent(element.innerHTML)
        const pdf = await page.pdf()
        await page.close()
        return pdf
      })
    )
    
    return pdfs
  } finally {
    await browser.close()
  }
}
```

### 2. PDF 合并

```typescript
import { PDFDocument } from 'pdf-lib'

async function mergePDFs(pdfBuffers: Buffer[]) {
  const mergedPdf = await PDFDocument.create()
  
  for (const buffer of pdfBuffers) {
    const pdf = await PDFDocument.load(buffer)
    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
    pages.forEach((page) => mergedPdf.addPage(page))
  }
  
  return await mergedPdf.save()
}
```

### 3. 添加水印

```typescript
await page.pdf({
  headerTemplate: `
    <div style="
      position: absolute; 
      top: 50%; 
      left: 50%; 
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 80px; 
      opacity: 0.1;
      color: #999;
    ">
      草稿
    </div>
  `
})
```

## 相关资源

- 📖 [Playwright 官方文档](https://playwright.dev/)
- 📖 [PDF API 参考](https://playwright.dev/docs/api/class-page#page-pdf)
- 📖 [Docker 部署指南](https://playwright.dev/docs/docker)
- 📖 [最佳实践](https://playwright.dev/docs/best-practices)

## 总结

Playwright 提供了最佳的 PDF 导出质量，是生产环境的推荐选择：

✅ **优点**:
- 文字完全可选可搜索
- CSS 样式完整保留
- 与网页显示一致
- 稳定可靠

⚠️ **注意**:
- 需要服务端支持
- 资源消耗较高
- 部署相对复杂

**推荐场景**: 需要高质量 PDF 的生产环境
**替代方案**: html2pdf（客户端简单场景）、jspdf（纯文本场景）
