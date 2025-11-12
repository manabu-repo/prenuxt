# PDF 导出模块化架构

## 概述

PDF 导出功能已重构为模块化、解耦的架构，将不同的导出方式拆分为独立的 composables，提供统一的接口。

## 架构设计

```
usePdfExport (统一接口)
    ├── useHtml2pdf (客户端 - 图片模式)
    │   └── html2pdf.js
    ├── useJspdf (客户端 - 文本模式)
    │   └── jsPDF
    └── usePlaywright (服务端 - 完美模式) ⭐ 推荐
        └── Playwright + Chromium
```

## Composables

### 1. useHtml2pdf (客户端 - 图片模式)

**文件**: `app/composables/useHtml2pdf.ts`

**特点**:
- ✅ 完整保留 CSS 样式
- ✅ 支持复杂布局和格式
- ❌ 文字不可选中/复制
- 🌐 客户端运行，无需后端
- 📦 依赖: html2pdf.js, html2canvas

**使用场景**: 需要完美保留视觉样式的文档导出（客户端）

**API**:
```typescript
const { isExporting, exportToPdf, exportQuillToPdf } = useHtml2pdf()

// 导出普通 HTML 元素
await exportToPdf(element, {
  margin: [20, 15, 25, 15],
  showPageNumbers: true,
  quality: 0.98,
  scale: 2,
  format: 'a4',
  orientation: 'portrait'
})

// 导出 Quill 编辑器
await exportQuillToPdf(editorContainer, options)
```

**选项**:
- `margin`: 页边距 [上, 右, 下, 左]，单位: mm
- `showPageNumbers`: 是否显示页码
- `pageNumberFormat`: 页码格式化函数
- `quality`: 图片质量 (0-1)
- `scale`: 缩放比例
- `format`: 纸张格式 (a4, letter, legal)
- `orientation`: 页面方向 (portrait, landscape)

---

### 2. useJspdf (客户端 - 文本模式)

**文件**: `app/composables/useJspdf.ts`

**特点**:
- ✅ 文字完全可选中/复制
- ✅ 文件体积小
- ❌ 仅保留基础文本格式
- 🌐 客户端运行，无需后端
- 📦 依赖: jsPDF

**使用场景**: 需要文字可选、可复制的纯文本文档（客户端）

**API**:
```typescript
const { isExporting, exportTextPdf, exportQuillTextPdf } = useJspdf()

// 导出普通 HTML 元素
await exportTextPdf(element, {
  margin: [20, 15, 25, 15],
  showPageNumbers: true,
  fontSize: 12,
  lineHeight: 7,
  paragraphSpacing: 3,
  format: 'a4',
  orientation: 'portrait'
})

// 导出 Quill 编辑器
await exportQuillTextPdf(editorContainer, options)
```

**选项**:
- `margin`: 页边距 [上, 右, 下, 左]，单位: mm
- `showPageNumbers`: 是否显示页码
- `pageNumberFormat`: 页码格式化函数
- `fontSize`: 字体大小
- `lineHeight`: 行高（mm）
- `paragraphSpacing`: 段落间距（mm）
- `format`: 纸张格式
- `orientation`: 页面方向

---

### 3. usePlaywright (服务端 - 完美模式) ⭐ 推荐

**文件**: `app/composables/usePlaywright.ts`

**特点**:
- ✅ 文字完全可选中/复制
- ✅ CSS 样式完整保留
- ✅ 与网页显示完全一致
- ✅ 支持所有现代 CSS 特性
- 🖥️ 服务端渲染，需要 Node.js 后端
- 📦 依赖: Playwright, Chromium

**使用场景**: 生产环境高质量 PDF 导出（推荐）

**API**:
```typescript
const { isExporting, exportToPdf, exportQuillToPdf } = usePlaywright()

// 导出普通 HTML 元素
await exportToPdf(element, {
  margin: { top: '20mm', right: '15mm', bottom: '25mm', left: '15mm' },
  format: 'A4',
  printBackground: true,
  displayHeaderFooter: false
})

// 导出 Quill 编辑器
await exportQuillToPdf(editorContainer, options)

// 带页眉页脚导出
await exportWithHeaderFooter(element, {
  displayHeaderFooter: true,
  footerTemplate: '<div>页码: <span class="pageNumber"></span></div>'
})
```

**选项**:
- `margin`: 页边距对象 `{ top, right, bottom, left }`
- `format`: 纸张格式 (A4, A3, A5, Letter, Legal, Tabloid)
- `printBackground`: 是否打印背景色和图片
- `displayHeaderFooter`: 是否显示页眉页脚
- `headerTemplate`: 页眉 HTML 模板
- `footerTemplate`: 页脚 HTML 模板
- `customCss`: 自定义 CSS 样式

**服务端 API**: `POST /api/export-pdf`

---

### 4. usePdfExport (统一接口)

**文件**: `app/composables/usePdfExport.ts`

**特点**:
- 统一的导出接口
- 自动选择底层实现
- 简化使用方式

**推荐使用方式**:

```typescript
const { isExporting, exportToPdf, exportQuillToPdf } = usePdfExport()

// 图片模式（客户端）
await exportQuillToPdf(editorElement, {
  mode: 'html2pdf',
  showPageNumbers: true,
  quality: 0.98,
  scale: 2
})

// 文本模式（客户端）
await exportQuillToPdf(editorElement, {
  mode: 'jspdf',
  showPageNumbers: true,
  fontSize: 12
})

// Playwright 模式（服务端）⭐ 推荐
await exportQuillToPdf(editorElement, {
  mode: 'playwright',
  printBackground: true
})
```

**直接访问底层函数**（可选）:

```typescript
const { 
  exportHtml2pdf,        // 直接使用 html2pdf
  exportJspdf,           // 直接使用 jspdf
  exportPlaywright,      // 直接使用 playwright
  exportQuillHtml2pdf,   // Quill 图片模式
  exportQuillJspdf,      // Quill 文本模式
  exportQuillPlaywright  // Quill Playwright 模式
} = usePdfExport()
```

## 使用示例

### 在页面中使用

```vue
<script setup lang="ts">
const { isExporting, exportQuillToPdf } = usePdfExport()
const editorRef = ref<HTMLElement>()

// 图片模式（客户端）
const exportAsImage = async () => {
  await exportQuillToPdf(editorRef.value!, {
    mode: 'html2pdf',
    showPageNumbers: true,
    quality: 0.98
  })
}

// 文本模式（客户端）
const exportAsText = async () => {
  await exportQuillToPdf(editorRef.value!, {
    mode: 'jspdf',
    showPageNumbers: true
  })
}

// Playwright 模式（服务端）⭐ 推荐
const exportAsPlaywright = async () => {
  await exportQuillToPdf(editorRef.value!, {
    mode: 'playwright',
    printBackground: true
  })
}
</script>

<template>
  <AppButton @click="exportAsImage" :loading="isExporting">
    图片模式
  </AppButton>
  <AppButton @click="exportAsText" :loading="isExporting">
    文本模式
  </AppButton>
  <AppButton @click="exportAsPlaywright" :loading="isExporting">
    Playwright (推荐)
  </AppButton>
</template>
```

### 使用下拉菜单选择模式

```vue
<AppDropdown
  label="导出 PDF"
  :loading="isExporting"
  :items="[
    {
      label: '图片模式（客户端）',
      icon: 'i-mdi-image',
      onClick: () => exportQuillToPdf(editor, { mode: 'html2pdf' })
    },
    {
      label: '文本模式（客户端）',
      icon: 'i-mdi-text-box-outline',
      onClick: () => exportQuillToPdf(editor, { mode: 'jspdf' })
    },
    {
      label: 'Playwright（服务端）⭐',
      icon: 'i-mdi-server',
      onClick: () => exportQuillToPdf(editor, { mode: 'playwright' })
    }
  ]"
/>
/>
```

## 模式对比

| 特性 | html2pdf | jspdf | playwright ⭐ |
|------|----------|-------|--------------|
| CSS 样式 | ✅ 完整 | ❌ 基础 | ✅ 完整 |
| 文字可选 | ❌ | ✅ | ✅ |
| 图片支持 | ✅ | ❌ | ✅ |
| 表格格式 | ✅ | ❌ | ✅ |
| 颜色样式 | ✅ | ❌ | ✅ |
| 字体支持 | ✅ | ⚠️ 部分 | ✅ 全部 |
| 运行环境 | 客户端 | 客户端 | 服务端 |
| 文件大小 | 较大 | 较小 | 中等 |
| 导出速度 | 较慢 | 快速 | 中等 |
| 部署要求 | 无 | 无 | Node.js |
| 适用场景 | 简单客户端场景 | 纯文本报告 | **生产环境推荐** |

## 技术实现

### html2pdf 模式

1. 使用 html2canvas 将 HTML 渲染为 Canvas
2. 将 Canvas 转换为图片
3. 使用 jsPDF 将图片嵌入 PDF

**优点**: 所见即所得，完美还原
**优点**: 所见即所得，完美还原
**缺点**: 生成的是图片，文字不可选

### jspdf 模式

1. 提取 HTML 元素的纯文本内容
2. 使用 jsPDF 的文本 API 直接写入
3. 自动处理换行和分页

**优点**: 文字可选可复制，文件小
**缺点**: 丢失所有样式（颜色、粗体、斜体等）

### playwright 模式 ⭐ 推荐

1. 客户端提取 HTML 内容和样式
2. 发送到服务端 API (`POST /api/export-pdf`)
3. 服务端启动 Chromium 浏览器
4. 使用真实浏览器引擎渲染
5. 生成原生 PDF（非图片）

**优点**: 文字可选、样式完整、质量最佳
**缺点**: 需要服务端支持，资源消耗较高

## 解耦优势

### 1. 独立维护
每个导出方式独立维护，互不影响

### 2. 按需加载
可以根据需要只导入特定的 composable

### 3. 易于扩展
添加新的导出方式只需创建新的 composable，无需修改现有代码

### 4. 清晰职责
- `useHtml2pdf`: 负责客户端图片模式导出
- `useJspdf`: 负责客户端文本模式导出
- `usePlaywright`: 负责服务端完美质量导出
- `usePdfExport`: 提供统一接口和模式选择

### 5. 类型安全
每个 composable 都有独立的 TypeScript 类型定义

## 未来扩展

可以轻松添加新的导出方式：

```typescript
// app/composables/usePuppeteer.ts
export const usePuppeteer = () => {
  // Puppeteer 实现
}

// 在 usePdfExport.ts 中集成
const puppeteerComposable = usePuppeteer()

const exportToPdf = async (element, options) => {
  if (options.mode === 'puppeteer') {
    return await puppeteerComposable.export(element, options)
  }
  // ... 其他模式
}
```

## 迁移指南

### 从旧版本迁移

**旧代码**:
```typescript
const { exportQuillToPdf, exportQuillTextPdf } = usePdfExport()

// 图片模式
await exportQuillToPdf(editor, options)

// 文本模式
await exportQuillTextPdf(editor, options)
```

**新代码**:
```typescript
const { exportQuillToPdf } = usePdfExport()

// 图片模式
await exportQuillToPdf(editor, { mode: 'html2pdf', ...options })

// 文本模式
await exportQuillToPdf(editor, { mode: 'jspdf', ...options })
```

## 相关文档

- [PDF 导出方案对比](./PDF_EXPORT_SOLUTIONS.md)
- [PDF CSS 优化指南](./PDF_CSS_OPTIMIZATION_GUIDE.md)
- [Quill 集成指南](./QUILL_INTEGRATION.md)
- [文件保存功能](./FILE_SAVE_GUIDE.md)
