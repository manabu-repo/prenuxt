# PDF 导出方案对比分析

## html2pdf.js 分页截断问题的解决方案

### 方案 1: CSS 优化（当前可实施）
```css
/* 在要导出的内容中添加 */
p, h1, h2, h3, h4, h5, h6 {
  page-break-inside: avoid;
  break-inside: avoid;
}

/* 强制分页 */
.page-break {
  page-break-before: always;
}
```

**优点：**
- 实施简单，无需更换库
- 可以控制分页位置

**缺点：**
- 效果不稳定，依赖浏览器实现
- 对 Quill 等富文本编辑器效果有限

### 方案 2: 预处理内容
```javascript
// 将长段落拆分为较短段落
function preprocessContent(html) {
  const maxParagraphHeight = 600 // 像素
  // 动态拆分长段落...
}
```

**优点：**
- 可以减少截断概率

**缺点：**
- 实现复杂
- 可能破坏原有格式

### 方案 3: 使用更大的边距
```javascript
margin: [30, 20, 30, 20] // 增加上下边距
```

**优点：**
- 简单直接

**缺点：**
- 浪费页面空间
- 不能完全解决问题

## 替代 PDF 导出方案对比

| 方案 | 原理 | 优点 | 缺点 | 适用场景 | 推荐度 |
|------|------|------|------|----------|--------|
| **html2pdf.js** (当前) | HTML→Canvas→PDF | • 简单易用<br>• 保留样式<br>• 客户端生成 | • 分页截断问题严重<br>• 性能较差<br>• 文件体积大<br>• 文字不可选择 | 简单文档，样式重要 | ⭐⭐⭐ |
| **jsPDF + html2canvas** | HTML→Canvas→PDF | • 灵活性高<br>• 可添加自定义内容<br>• 客户端生成 | • 需要手动处理分页<br>• 文字不可选择<br>• 配置复杂 | 需要精确控制的场景 | ⭐⭐⭐ |
| **Puppeteer (服务端)** | Headless Chrome | • **分页完美**<br>• **文字可选择**<br>• 高保真度<br>• 支持复杂 CSS | • 需要 Node.js 后端<br>• 服务器资源消耗大<br>• 部署复杂 | **推荐用于生产环境** | ⭐⭐⭐⭐⭐ |
| **pdfmake** | 直接生成 PDF | • 文件体积小<br>• **文字可选择**<br>• 客户端生成<br>• **无截断问题** | • **需要重写内容结构**<br>• 样式受限<br>• 学习曲线陡峭 | 结构化文档（发票、报告） | ⭐⭐⭐⭐ |
| **react-pdf** | React 组件→PDF | • 声明式 API<br>• 文字可选择<br>• 客户端或服务端 | • 仅支持 React<br>• 需要重写组件<br>• 样式受限 | React 项目 | ⭐⭐⭐ |
| **PrintJS** | 浏览器打印 | • **最简单**<br>• 利用浏览器打印<br>• **完美分页** | • 需要用户手动保存<br>• 依赖浏览器实现<br>• 无法自动化 | 用户主动打印场景 | ⭐⭐⭐⭐ |
| **wkhtmltopdf (服务端)** | Webkit→PDF | • 高质量<br>• 文字可选择<br>• 分页较好 | • 需要后端<br>• 已停止维护<br>• 部署麻烦 | 后端生成 PDF | ⭐⭐⭐ |
| **服务端 API (推荐)** | 后端生成 | • **专业质量**<br>• 无客户端压力<br>• 可缓存结果 | • 需要后端开发<br>• 增加服务器成本 | **大型项目推荐** | ⭐⭐⭐⭐⭐ |

## 详细方案分析

### 🏆 推荐方案 1: Puppeteer (服务端)

```javascript
// 服务端 API (Node.js + Nuxt)
// server/api/export-pdf.post.ts
import puppeteer from 'puppeteer'

export default defineEventHandler(async (event) => {
  const { html } = await readBody(event)
  
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  
  await page.setContent(html)
  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' }
  })
  
  await browser.close()
  
  return pdf
})
```

**特点：**
- ✅ **完美解决分页截断问题**
- ✅ 文字可选择、可复制
- ✅ 支持完整 CSS（包括 Grid、Flexbox）
- ✅ 生成的 PDF 质量最高
- ⚠️ 需要 Node.js 后端支持

### 🏆 推荐方案 2: pdfmake (客户端)

```javascript
import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'

pdfMake.vfs = pdfFonts.pdfMake.vfs

// 需要将 HTML 转换为 pdfMake 格式
const docDefinition = {
  content: [
    { text: '标题', style: 'header' },
    { text: '段落内容...' },
    { text: '第二段落...' }
  ],
  styles: {
    header: { fontSize: 18, bold: true }
  }
}

pdfMake.createPdf(docDefinition).open()
```

**特点：**
- ✅ **完全避免截断问题**
- ✅ 文件体积小
- ✅ 客户端生成，无需后端
- ⚠️ 需要将 HTML 转换为 pdfMake 数据结构
- ⚠️ 样式能力有限

### 方案 3: 使用浏览器打印 API (PrintJS)

```javascript
import printJS from 'print-js'

printJS({
  printable: 'element-id',
  type: 'html',
  css: ['styles.css'],
  scanStyles: true
})
```

**特点：**
- ✅ 最简单的实现
- ✅ 完美的分页（浏览器原生）
- ✅ 文字可选择
- ⚠️ 需要用户手动"打印→另存为 PDF"
- ⚠️ 不同浏览器效果可能不同

## 针对 Quill 编辑器的特殊建议

### 方案 A: Quill Delta → pdfmake
```javascript
// 将 Quill Delta 格式转换为 pdfmake
function deltaToDocDefinition(delta) {
  const content = []
  
  delta.ops.forEach(op => {
    if (op.insert) {
      content.push({
        text: op.insert,
        bold: op.attributes?.bold,
        italic: op.attributes?.italic
        // ... 其他样式
      })
    }
  })
  
  return { content }
}
```

### 方案 B: Quill → 服务端渲染
```javascript
// 1. 客户端：发送 Quill HTML 到服务端
const html = quillEditor.root.innerHTML

await $fetch('/api/export-pdf', {
  method: 'POST',
  body: { html }
})

// 2. 服务端：使用 Puppeteer 渲染
```

## 最终推荐

### 🥇 最佳方案（生产环境）
**Puppeteer + Nuxt Server API**
- 完美的分页和渲染质量
- 适合需要高质量 PDF 的场景
- 实施成本：中等（需要配置服务器）

### 🥈 次佳方案（快速实施）
**pdfmake**
- 客户端生成，无需后端
- 需要转换 Quill 内容格式
- 实施成本：中等（需要格式转换）

### 🥉 临时方案（当前）
**html2pdf.js + CSS 优化**
- 继续使用但添加 CSS 优化
- 接受部分分页不完美
- 实施成本：低

## 实施建议

### 短期（1-2天）
1. 优化当前 html2pdf.js 的 CSS
2. 增加边距，添加 `page-break-inside: avoid`
3. 提示用户可能存在分页问题

### 中期（1-2周）
1. 实施 Puppeteer 后端方案
2. 在 Nuxt 中创建 `/api/export-pdf` 接口
3. 客户端调用 API 生成 PDF

### 长期优化
1. 考虑使用专业 PDF 服务（如 DocRaptor、PDFShift）
2. 添加 PDF 生成队列和缓存
3. 支持模板自定义和批量生成

## 代码示例：Puppeteer 方案实施

### 1. 安装依赖
```bash
pnpm add puppeteer
```

### 2. 创建服务端 API
```typescript
// server/api/export-pdf.post.ts
import puppeteer from 'puppeteer'

export default defineEventHandler(async (event) => {
  const { html, filename } = await readBody(event)
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox']
  })
  
  const page = await browser.newPage()
  await page.setContent(html, { waitUntil: 'networkidle0' })
  
  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: `
      <div style="font-size: 10px; text-align: center; width: 100%;">
        <span class="pageNumber"></span> / <span class="totalPages"></span>
      </div>
    `,
    margin: {
      top: '20mm',
      bottom: '25mm',
      left: '15mm',
      right: '15mm'
    }
  })
  
  await browser.close()
  
  setHeader(event, 'Content-Type', 'application/pdf')
  setHeader(event, 'Content-Disposition', `inline; filename="${filename || 'document.pdf'}"`)
  
  return pdf
})
```

### 3. 客户端调用
```typescript
// composables/usePdfExport.ts (重构版)
export function usePdfExport() {
  const isExporting = ref(false)

  const exportToPdf = async (element: HTMLElement, filename = 'document.pdf') => {
    isExporting.value = true
    
    try {
      const html = element.outerHTML
      
      const blob = await $fetch('/api/export-pdf', {
        method: 'POST',
        body: { html, filename },
        responseType: 'blob'
      })
      
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
      
      return { success: true }
    } catch (error) {
      console.error('PDF 导出失败:', error)
      return { success: false, error }
    } finally {
      isExporting.value = false
    }
  }

  return { isExporting, exportToPdf }
}
```

## 性能对比

| 方案 | 1页耗时 | 10页耗时 | 内存占用 | 文件大小(10页) |
|------|---------|----------|----------|----------------|
| html2pdf.js | ~2秒 | ~8秒 | 高 (200MB+) | 大 (2-5MB) |
| Puppeteer | ~1秒 | ~3秒 | 中 (100MB) | 小 (500KB-1MB) |
| pdfmake | ~0.5秒 | ~2秒 | 低 (50MB) | 最小 (100-300KB) |
| PrintJS | 即时 | 即时 | 极低 | 取决于浏览器 |

## 总结

**如果你的项目：**
- ✅ 有 Node.js 后端 → **使用 Puppeteer**
- ✅ 纯客户端项目 → **使用 pdfmake**
- ✅ 只需简单打印 → **使用 PrintJS**
- ⚠️ 继续使用 html2pdf.js → 添加 CSS 优化 + 用户提示
