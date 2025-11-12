# 文件保存功能使用指南

## 功能概述

`useFileSave` composable 提供了将 Quill 编辑器内容保存为多种格式的功能。

## 支持的格式

### 1. HTML 格式 (推荐)
- **扩展名**: `.html`
- **特点**: 
  - ✅ 保留所有样式和格式
  - ✅ 包含完整的 HTML 文档结构
  - ✅ 可在浏览器中直接打开查看
  - ✅ 支持粗体、斜体、下划线、链接等
  - ✅ 包含内嵌 CSS 样式

### 2. Markdown 格式
- **扩展名**: `.md`
- **特点**:
  - ✅ 轻量级标记语言
  - ✅ 易于编辑和版本控制
  - ✅ 支持标题、列表、链接、粗体、斜体
  - ⚠️ 部分样式会丢失（如颜色、字体大小）

### 3. 纯文本格式
- **扩展名**: `.txt`
- **特点**:
  - ✅ 最小文件体积
  - ✅ 通用兼容性
  - ⚠️ 不保留任何格式和样式
  - ⚠️ 仅保留文本内容

## 使用方法

### 基础用法

```vue
<script setup>
import { useFileSave } from '~/composables/useFileSave'

const editorRef = ref<HTMLElement | null>(null)
const { isSaving, saveQuillContent } = useFileSave()

// 保存为 HTML
const saveAsHTML = async () => {
  await saveQuillContent(editorRef.value, {
    filename: 'my_document',
    format: 'html',
    includeStyles: true
  })
}

// 保存为 Markdown
const saveAsMarkdown = async () => {
  await saveQuillContent(editorRef.value, {
    filename: 'my_document',
    format: 'markdown'
  })
}

// 保存为纯文本
const saveAsText = async () => {
  await saveQuillContent(editorRef.value, {
    filename: 'my_document',
    format: 'text'
  })
}
</script>

<template>
  <div ref="editorRef">
    <QuillEditor v-model="content" />
  </div>
  
  <button @click="saveAsHTML" :disabled="isSaving">
    保存 HTML
  </button>
</template>
```

### 高级用法

#### 1. 直接保存 HTML 内容

```typescript
const { saveAsHTML } = useFileSave()

const content = '<p>Hello <strong>World</strong></p>'
saveAsHTML(content, 'document.html', true)
```

#### 2. 保存纯文本

```typescript
const { saveAsText } = useFileSave()

const content = '<p>Hello World</p>'
saveAsText(content, 'document.txt')
// 输出: Hello World
```

#### 3. 保存 Markdown

```typescript
const { saveAsMarkdown } = useFileSave()

const content = '<h1>Title</h1><p>Content</p>'
saveAsMarkdown(content, 'document.md')
// 输出: # Title\n\nContent
```

## API 文档

### `useFileSave()`

返回对象：

```typescript
{
  isSaving: Ref<boolean>,          // 保存状态
  saveQuillContent: Function,       // 保存 Quill 内容
  saveAsHTML: Function,             // 保存为 HTML
  saveAsText: Function,             // 保存为文本
  saveAsMarkdown: Function          // 保存为 Markdown
}
```

### `saveQuillContent(element, options)`

保存 Quill 编辑器内容。

**参数：**
- `element: HTMLElement` - Quill 编辑器容器或 `.ql-editor` 元素
- `options: SaveOptions` - 保存选项
  - `filename?: string` - 文件名（不含扩展名），默认: `document_时间戳`
  - `format?: 'html' | 'text' | 'markdown'` - 保存格式，默认: `'html'`
  - `includeStyles?: boolean` - 是否包含样式（仅 HTML 格式），默认: `true`

**返回值：**
```typescript
Promise<{ success: boolean; error?: any }>
```

### `saveAsHTML(content, filename, includeStyles)`

保存 HTML 内容。

**参数：**
- `content: string` - HTML 内容
- `filename?: string` - 文件名，默认: `'document.html'`
- `includeStyles?: boolean` - 是否包含完整样式，默认: `true`

### `saveAsText(content, filename)`

保存纯文本内容。

**参数：**
- `content: string` - HTML 内容（会自动转换为纯文本）
- `filename?: string` - 文件名，默认: `'document.txt'`

### `saveAsMarkdown(content, filename)`

保存 Markdown 内容。

**参数：**
- `content: string` - HTML 内容（会自动转换为 Markdown）
- `filename?: string` - 文件名，默认: `'document.md'`

## 格式转换规则

### HTML → Markdown

| HTML | Markdown |
|------|----------|
| `<h1>Title</h1>` | `# Title` |
| `<h2>Title</h2>` | `## Title` |
| `<strong>Bold</strong>` | `**Bold**` |
| `<em>Italic</em>` | `*Italic*` |
| `<a href="url">Link</a>` | `[Link](url)` |
| `<li>Item</li>` | `- Item` |
| `<code>code</code>` | `` `code` `` |

### HTML → Text

- 移除所有 HTML 标签
- `<br>` 转换为换行符
- `</p>` 转换为双换行
- 解码 HTML 实体（`&nbsp;`, `&lt;`, `&gt;`, `&amp;`）

## 完整示例

### 示例 1: 多格式保存按钮

```vue
<script setup>
const { isSaving, saveQuillContent } = useFileSave()
const editorRef = ref(null)

const saveFile = async (format: 'html' | 'text' | 'markdown') => {
  const result = await saveQuillContent(editorRef.value, {
    filename: 'my_document',
    format,
    includeStyles: true
  })
  
  if (result.success) {
    console.log('保存成功')
  } else {
    alert('保存失败')
  }
}
</script>

<template>
  <div ref="editorRef">
    <QuillEditor v-model="content" />
  </div>
  
  <div class="actions">
    <button @click="saveFile('html')" :disabled="isSaving">
      保存 HTML
    </button>
    <button @click="saveFile('markdown')" :disabled="isSaving">
      保存 Markdown
    </button>
    <button @click="saveFile('text')" :disabled="isSaving">
      保存文本
    </button>
  </div>
</template>
```

### 示例 2: 自动保存

```vue
<script setup>
const { saveQuillContent } = useFileSave()
const content = ref('')
const editorRef = ref(null)

// 每 30 秒自动保存
const autoSave = async () => {
  if (!editorRef.value) return
  
  await saveQuillContent(editorRef.value, {
    filename: `autosave_${Date.now()}`,
    format: 'html'
  })
}

onMounted(() => {
  setInterval(autoSave, 30000) // 30 秒
})
</script>
```

## 注意事项

### 1. 浏览器限制
由于浏览器安全限制，**无法直接覆盖本地文件**。文件会下载到浏览器的下载目录。

### 2. 样式保留
- **HTML 格式**: 完整保留所有样式
- **Markdown 格式**: 保留基本格式（标题、粗体、斜体等）
- **文本格式**: 不保留任何样式

### 3. 文件名规则
- 自动添加扩展名
- 不要在 `filename` 参数中包含扩展名
- 使用时间戳避免文件名冲突

### 4. 性能考虑
- 大文件（>1MB）转换可能较慢
- Markdown 转换使用正则表达式，复杂内容可能不完美
- HTML 格式性能最好，推荐优先使用

## 故障排除

### 问题 1: 文件未下载
**原因**: 弹窗拦截或下载被阻止
**解决**: 检查浏览器设置，允许自动下载

### 问题 2: 样式丢失
**原因**: `includeStyles` 设置为 `false`
**解决**: 设置 `includeStyles: true` 或使用 HTML 格式

### 问题 3: Markdown 格式不正确
**原因**: 复杂 HTML 结构转换有限
**解决**: 
- 简化 HTML 结构
- 手动调整 Markdown 输出
- 使用专业的 HTML to Markdown 库

### 问题 4: 编辑器内容为空
**原因**: 传入的元素不正确
**解决**: 确保传入的是包含 `.ql-editor` 的容器元素

## 相关文件

- `app/composables/useFileSave.ts` - 保存功能实现
- `app/pages/demo/preview.vue` - 使用示例
- `app/composables/usePdfExport.ts` - PDF 导出功能

## 未来改进

- [ ] 支持保存为 Word 文档（.docx）
- [ ] 支持批量保存
- [ ] 添加云存储集成（Google Drive, Dropbox）
- [ ] 改进 Markdown 转换质量
- [ ] 添加保存历史记录
- [ ] 支持自定义样式模板
