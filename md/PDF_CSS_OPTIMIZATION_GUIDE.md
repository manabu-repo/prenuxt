# PDF 导出 CSS 优化使用指南

## 文件说明

### `app/assets/css/pdf-export.css`
专门用于优化 html2pdf.js 导出效果的样式文件，包含：
- 分页保护规则
- Quill 编辑器优化
- 图片、表格、列表格式化
- 手动分页控制类

## 使用方法

### 1. 在页面中导入样式

```vue
<script setup>
// 导入 PDF 导出优化样式
import '~/assets/css/pdf-export.css'
</script>
```

### 2. 为要导出的内容添加类名

composable 会自动为克隆的元素添加 `pdf-export-content` 类，无需手动添加。

### 3. 使用导出功能

```vue
<script setup>
import '~/assets/css/pdf-export.css'

const editorRef = ref<HTMLElement | null>(null)
const { isExporting, exportQuillToPdf } = usePdfExport()

const exportToPDF = async () => {
  if (!editorRef.value) return
  
  await exportQuillToPdf(editorRef.value, {
    showPageNumbers: true,
    quality: 0.98,
    scale: 2
  })
}
</script>

<template>
  <div ref="editorRef">
    <QuillEditor v-model="content" />
  </div>
  
  <button @click="exportToPDF">导出 PDF</button>
</template>
```

## 手动分页控制

如果需要手动控制分页位置，可以使用以下类：

### 在元素前强制分页
```html
<div class="page-break-before">
  这个内容会出现在新页面
</div>
```

### 在元素后强制分页
```html
<div class="page-break-after">
  这个内容后会强制分页
</div>
```

### 避免元素被分页截断
```html
<div class="page-break-avoid">
  这个内容不会在中间被截断
</div>
```

## 优化效果

### ✅ 自动优化的元素
- 段落 (`<p>`)
- 标题 (`<h1>` - `<h6>`)
- 列表项 (`<li>`)
- 图片 (`<img>`)
- 表格 (`<table>`, `<tr>`, `<td>`)
- 代码块 (`<pre>`, `<code>`)
- 引用块 (`<blockquote>`)

### ✅ Quill 编辑器特殊优化
- `.ql-editor` 内的所有段落
- 自动添加适当的行高和间距
- 保持格式化文本样式（粗体、斜体、下划线）

### ✅ 自动处理
- 孤行和寡行控制（orphans/widows）
- 标题后避免分页
- 表格行避免在中间断开
- 图片完整显示不被截断

## 性能优化

### CSS 文件优势
1. **代码分离** - CSS 逻辑与业务逻辑分离
2. **易于维护** - 统一管理所有 PDF 导出样式
3. **性能更好** - 浏览器原生 CSS 解析，无 JS 开销
4. **可复用** - 多个页面共享同一套样式规则

### 与 JS 处理对比

| 方案 | 优点 | 缺点 |
|------|------|------|
| **CSS 文件（推荐）** | • 代码清晰<br>• 性能好<br>• 易维护<br>• 可复用 | • 需要导入文件 |
| JS 动态添加 | • 无需导入<br>• 动态灵活 | • 代码混乱<br>• 性能较差<br>• 难以维护 |

## 高级用法

### 自定义分页样式

如果默认样式不满足需求，可以在页面中覆盖：

```vue
<style>
/* 覆盖默认样式 */
.pdf-export-content p {
  margin-bottom: 1em; /* 增加段落间距 */
}

.pdf-export-content h1 {
  margin-top: 2em; /* 增加标题上边距 */
}
</style>
```

### 特定内容使用不同规则

```html
<!-- 这个段落允许被分页截断 -->
<p style="page-break-inside: auto;">
  长段落内容...
</p>

<!-- 这个区域强制保持完整 -->
<div style="page-break-inside: avoid;">
  <h2>重要标题</h2>
  <p>重要内容，必须保持在同一页...</p>
</div>
```

## 问题排查

### 1. 样式未生效
**问题**：导出的 PDF 没有应用样式
**解决**：检查是否在页面中导入了 `pdf-export.css`

### 2. 仍然有文字被截断
**问题**：部分内容仍在分页时被截断
**解决**：
- 为特定元素添加 `page-break-avoid` 类
- 增加上下边距 `margin: [25, 15, 30, 15]`
- 使用手动分页控制

### 3. 页面空白过多
**问题**：分页后页面出现大量空白
**解决**：
- 减少 `page-break-inside: avoid` 的使用
- 允许某些长段落被分页
- 调整边距设置

## 最佳实践

1. **始终导入 CSS** - 在使用 PDF 导出的页面导入样式文件
2. **测试长文档** - 用长文档测试分页效果
3. **适当分段** - 将超长段落拆分为较短段落
4. **使用手动控制** - 在关键位置使用分页控制类
5. **保持简洁** - 避免过于复杂的嵌套结构

## 示例项目

已应用 PDF 导出优化的页面：
- `app/pages/demo/preview.vue` - Quill 编辑器演示
- `app/pages/projects/[id]/edit.vue` - 项目编辑页面

## 相关文件

- `app/assets/css/pdf-export.css` - PDF 导出样式
- `app/composables/usePdfExport.ts` - PDF 导出 composable
- `md/PDF_EXPORT_SOLUTIONS.md` - PDF 导出方案对比
