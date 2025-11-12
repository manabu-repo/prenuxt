# PDF 导出快速参考

## 快速开始

### 1. 基础使用（推荐）

```typescript
// 导入
const { isExporting, exportQuillToPdf } = usePdfExport()

// 图片模式（客户端，保留样式）
await exportQuillToPdf(editorElement, {
  mode: 'html2pdf',
  showPageNumbers: true,
  quality: 0.98,
  scale: 2
})

// 文本模式（客户端，可选中）
await exportQuillToPdf(editorElement, {
  mode: 'jspdf',
  showPageNumbers: true,
  fontSize: 12
})

// Playwright 模式（服务端，完美质量）⭐ 推荐
await exportQuillToPdf(editorElement, {
  mode: 'playwright',
  printBackground: true
})
```

### 2. 直接使用底层函数

```typescript
// 只使用 html2pdf（客户端）
const { exportQuillToPdf } = useHtml2pdf()

// 只使用 jspdf（客户端）
const { exportQuillTextPdf } = useJspdf()

// 只使用 playwright（服务端）⭐
const { exportQuillToPdf } = usePlaywright()
```

## 模式选择

| 需求 | 选择模式 | 特点 |
|------|---------|------|
| 生产环境高质量 | `playwright` ⭐ | **文字可选+样式完整** |
| 简单客户端场景 | `html2pdf` | 完整样式，不可选文字 |
| 纯文本报告 | `jspdf` | 可选文字，简单格式 |
| 包含图片/表格 | `playwright` / `html2pdf` | 完整支持 |
| 无服务端环境 | `html2pdf` / `jspdf` | 纯客户端 |
| 小文件体积 | `jspdf` | 文件最小 |
| 快速导出 | `jspdf` | 速度最快 |

## 常用配置

### html2pdf 模式（客户端）
```typescript
{
  mode: 'html2pdf',
  margin: [20, 15, 25, 15],  // [上, 右, 下, 左] mm
  showPageNumbers: true,
  quality: 0.98,              // 图片质量 0-1
  scale: 2,                   // 缩放比例
  format: 'a4',
  orientation: 'portrait'
}
```

### jspdf 模式（客户端）
```typescript
{
  mode: 'jspdf',
  margin: [20, 15, 25, 15],  // [上, 右, 下, 左] mm
  showPageNumbers: true,
  fontSize: 12,               // 字体大小
  lineHeight: 7,              // 行高 mm
  paragraphSpacing: 3,        // 段落间距 mm
  format: 'a4',
  orientation: 'portrait'
}
```

### playwright 模式（服务端）⭐ 推荐
```typescript
{
  mode: 'playwright',
  margin: [20, 15, 25, 15],  // 会自动转换为 mm 单位
  printBackground: true,      // 打印背景色
  displayHeaderFooter: false, // 页眉页脚
  format: 'a4'
}
```

## 在组件中使用

### 下拉菜单方式
```vue
<script setup lang="ts">
const { isExporting, exportQuillToPdf } = usePdfExport()

const exportPDF = (mode: 'html2pdf' | 'jspdf' | 'playwright') => {
  exportQuillToPdf(editorRef.value, { mode })
}
</script>

<template>
  <AppDropdown
    label="导出 PDF"
    :loading="isExporting"
    :items="[
      { label: '图片模式（客户端）', onClick: () => exportPDF('html2pdf') },
      { label: '文本模式（客户端）', onClick: () => exportPDF('jspdf') },
      { label: 'Playwright（服务端）⭐', onClick: () => exportPDF('playwright') }
    ]"
  />
</template>
```

### 独立按钮方式
```vue
<template>
  <AppButton 
    @click="exportQuillToPdf(editor, { mode: 'html2pdf' })"
    :loading="isExporting"
  >
    导出图片 PDF
  </AppButton>
  
  <AppButton 
    @click="exportQuillToPdf(editor, { mode: 'jspdf' })"
    :loading="isExporting"
  >
    导出文本 PDF
  </AppButton>
</template>
```

## 自定义页码

```typescript
await exportQuillToPdf(editor, {
  showPageNumbers: true,
  pageNumberFormat: (current, total) => `第 ${current} 页 / 共 ${total} 页`
})
```

## 页面分隔优化（html2pdf）

```typescript
// 添加 CSS 类，避免元素被截断
const { addPageBreakSafetyMargin } = usePdfExport()
addPageBreakSafetyMargin(element)

// 导出后移除
removePageBreakSafetyMargin(element)
```

或在 CSS 中直接使用：
```css
/* 应用于 PDF 导出的内容 */
.pdf-export-content * {
  page-break-inside: avoid;
}
```

## 错误处理

```typescript
const result = await exportQuillToPdf(editor, options)

if (!result?.success) {
  console.error('导出失败:', result?.error)
  // 显示错误提示
}
```

## 依赖包

```json
{
  "html2pdf.js": "^0.12.1",  // html2pdf 模式（客户端）
  "jspdf": "^3.0.3",          // jspdf 模式（客户端）
  "playwright": "^1.56.1"     // playwright 模式（服务端）⭐
}
```

## 文件结构

```
app/composables/
├── useHtml2pdf.ts      # html2pdf 封装（客户端）
├── useJspdf.ts         # jsPDF 封装（客户端）
├── usePlaywright.ts    # Playwright 封装（服务端）⭐
└── usePdfExport.ts     # 统一接口 ⭐ 推荐使用

server/api/
└── export-pdf.post.ts  # Playwright API 端点
```

## 常见问题

### Q: 如何选择模式？
A: 
- **生产环境**: 使用 `playwright`（最佳质量）
- **无服务端**: 使用 `html2pdf`（客户端，样式完整）
- **纯文本**: 使用 `jspdf`（文字可选）

### Q: Playwright 需要什么环境？
A: 需要 Node.js 后端和 Chromium 浏览器

### Q: 能否同时保留样式和文字可选？
A: 可以！使用 `playwright` 模式（服务端）

### Q: jspdf 模式为什么没有颜色？
A: jspdf 使用纯文本 API，只支持基础格式

### Q: 如何部署 Playwright？
A: 参考 [Playwright PDF 指南](./PLAYWRIGHT_PDF_GUIDE.md)

### Q: 如何添加新的导出方式？
A: 创建新 composable，在 usePdfExport 中集成即可

## 性能提示

- ✅ 库文件按需动态导入
- ✅ 只在用户点击时加载
- ✅ 避免在 setup 时直接导入

## 相关文档

- 📖 [架构文档](./PDF_EXPORT_ARCHITECTURE.md)
- 📖 [Playwright 指南](./PLAYWRIGHT_PDF_GUIDE.md) ⭐
- 📖 [重构总结](./PDF_EXPORT_REFACTOR.md)
- 📖 [方案对比](./PDF_EXPORT_SOLUTIONS.md)
