# Playwright PDF 页码功能

## 📝 功能说明

**Playwright 模式现在默认显示页码，无需任何配置！**

### 核心特性

✅ **默认启用**：无需传入 `showPageNumbers` 参数  
✅ **自动分页**：使用 Playwright 内置的 `headerTemplate`/`footerTemplate`  
✅ **可自定义**：支持通过 `pageNumberFormat` 自定义格式  
✅ **质量优秀**：渲染质量与原生 PDF 一致  

---

## 💻 使用方式

### 基础使用（默认页码）

```typescript
// ✅ 直接使用，自动显示页码
const { exportToPdf } = usePdfExport()

await exportToPdf('#content', {
  mode: 'playwright',
  format: 'A4'
})

// 结果：PDF 页面底部会自动显示 "页码 1 / 共 5 页" 格式
```

### 自定义页码格式

```typescript
// 自定义页码格式（注意：在 API 端会被转换为模板）
await exportToPdf('#content', {
  mode: 'playwright',
  format: 'A4',
  pageNumberFormat: 'Page {pageNumber}'
  // 结果：显示 "Page 1", "Page 2", ...
})

// 或使用占位符
await exportToPdf('#content', {
  mode: 'playwright',
  pageNumberFormat: '{pageNumber} / {totalPages}'
  // 结果：显示 "1 / 5", "2 / 5", ...
})
```

### 自定义页脚模板（完全控制）

```typescript
// 完全自定义页脚 HTML（会覆盖默认页码）
await exportToPdf('#content', {
  mode: 'playwright',
  footerTemplate: `
    <div style="width: 100%; text-align: center; font-size: 10pt;">
      Custom Footer - Page <span class="pageNumber"></span>
    </div>
  `
})
```

---

## 🎨 页码样式

### 默认样式

```
位置：页面底部中央
字体：系统默认（system-ui, -apple-system, sans-serif）
大小：10pt
颜色：黑色 (#000)
格式：页码 X / 共 Y 页
间距：上方 10px
```

### HTML 模板中的占位符

Playwright 支持的特殊标签：

| 标签 | 说明 |
|------|------|
| `<span class="pageNumber"></span>` | 当前页码 |
| `<span class="totalPages"></span>` | 总页数 |
| `<span class="date"></span>` | 当前日期 |
| `<span class="title"></span>` | 文档标题 |
| `<span class="url"></span>` | 页面 URL |

---

## 📋 实现细节

### 服务端处理（`export-playwright.post.ts`）

```typescript
// 1. 默认启用页脚
displayHeaderFooter: true,

// 2. 自动生成页码模板
footerTemplate: generatePageNumberFooter(options.pageNumberFormat)

// 3. 支持覆盖
if (options.footerTemplate) {
  pdfOptions.footerTemplate = options.footerTemplate
}
```

### 页码模板生成

```typescript
function generatePageNumberFooter(format?: string): string {
  if (typeof format === 'string') {
    // 将占位符转换为 HTML 标签
    const template = format
      .replace('{pageNumber}', '<span class="pageNumber"></span>')
      .replace('{totalPages}', '<span class="totalPages"></span>')
    
    return `<div style="...styles...">${template}</div>`
  }

  // 默认格式
  return `<div style="...">
    页码 <span class="pageNumber"></span> / 共 <span class="totalPages"></span> 页
  </div>`
}
```

---

## 🎯 常见场景

### 场景 1：保留默认页码

```vue
<script setup>
const handleExport = async () => {
  await exportToPdf('#content', {
    mode: 'playwright'
    // 页码自动显示为 "页码 1 / 共 X 页"
  })
}
</script>
```

### 场景 2：简化页码格式

```typescript
await exportToPdf('#content', {
  mode: 'playwright',
  pageNumberFormat: '{pageNumber}'
  // 显示：1, 2, 3, ...
})
```

### 场景 3：添加日期和页码

```typescript
await exportToPdf('#content', {
  mode: 'playwright',
  footerTemplate: `
    <div style="width: 100%; display: flex; justify-content: space-between; 
                font-size: 10pt; padding: 0 20mm;">
      <span><span class="date"></span></span>
      <span>页 <span class="pageNumber"></span> / <span class="totalPages"></span></span>
    </div>
  `
})
```

### 场景 4：禁用页脚（使用空模板）

```typescript
await exportToPdf('#content', {
  mode: 'playwright',
  footerTemplate: '<div></div>'  // 空页脚，不显示页码
})
```

---

## 🔄 与其他模式对比

| 功能 | html2pdf | jsPDF | pdfmake | **playwright** | chromium |
|------|----------|-------|---------|----------------|----------|
| **页码支持** | ⚠️ 需 CSS | ✅ 手动 | ✅ 手动 | **✅ 自动** | ❌ 无 |
| **默认页码** | ❌ | ❌ | ❌ | **✅ 是** | ❌ |
| **自定义格式** | ⚠️ 困难 | ✅ 简单 | ✅ 简单 | **✅ 灵活** | ❌ |
| **质量** | 低 | 中 | 中 | **⭐ 最高** | ⭐ 最高 |
| **推荐** | 简单样式 | 文本PDF | 结构化 | **生产推荐** | Serverless |

---

## 🐛 常见问题

### Q: 如何关闭页码？

**A:** 使用空模板：
```typescript
footerTemplate: '<div></div>'
```

### Q: 页码显示不正确？

**A:** 确认：
1. 使用了 `mode: 'playwright'`
2. 不需要传入 `showPageNumbers` 参数
3. 页面内容足够创建多页 PDF

### Q: 如何改变页码颜色？

**A:** 使用自定义 `footerTemplate`：
```typescript
footerTemplate: `
  <div style="color: #999; font-size: 10pt; text-align: center;">
    Page <span class="pageNumber"></span>
  </div>
`
```

### Q: 页码位置可以改变吗？

**A:** 可以，使用 `headerTemplate` 放在页面顶部：
```typescript
headerTemplate: `
  <div style="text-align: right; padding-right: 20mm;">
    <span class="pageNumber"></span>/<span class="totalPages"></span>
  </div>
`
```

---

## 📚 代码示例

### 完整示例

```vue
<template>
  <div>
    <button @click="exportDefault">导出（默认页码）</button>
    <button @click="exportCustom">导出（自定义格式）</button>
    <button @click="exportWithDate">导出（含日期）</button>
  </div>
</template>

<script setup>
import { usePdfExport } from '~/composables/usePdfExport'

const { exportToPdf } = usePdfExport()

// 默认页码
const exportDefault = () => {
  exportToPdf('#content', { mode: 'playwright' })
}

// 自定义格式
const exportCustom = () => {
  exportToPdf('#content', {
    mode: 'playwright',
    pageNumberFormat: 'Page {pageNumber} of {totalPages}'
  })
}

// 含日期
const exportWithDate = () => {
  exportToPdf('#content', {
    mode: 'playwright',
    footerTemplate: `
      <div style="width: 100%; display: flex; justify-content: space-between;
                  padding: 10px 20mm; font-size: 10pt;">
        <span><span class="date"></span></span>
        <span><span class="pageNumber"></span>/<span class="totalPages"></span></span>
      </div>
    `
  })
}
</script>
```

---

## ✨ 总结

**Playwright 模式现在开箱即用的页码功能：**

✅ 默认启用，无需额外配置  
✅ 自动处理分页  
✅ 灵活的自定义选项  
✅ 生产级别的质量  

**推荐场景：**
- 需要默认页码的文档导出
- 多页 PDF 生成
- 专业级 PDF 输出

**快速开始：**
```typescript
// 仅需一行代码即可获得带页码的 PDF
await exportToPdf('#content', { mode: 'playwright' })
```
