# Quill Editor 集成说明

## ✅ 已完成

1. **安装依赖**
   ```bash
   pnpm add quill @vueup/vue-quill
   ```

2. **创建 QuillEditor 组件** (`app/components/QuillEditor.vue`)
   - ✅ 支持 v-model 双向绑定
   - ✅ 三种工具栏预设：`minimal`, `essential`, `full`
   - ✅ 支持暗色模式
   - ✅ 响应式设计
   - ✅ **SSR 兼容** - 使用 `ClientOnly` 包装，避免 `document is not defined` 错误
   - ✅ 加载状态显示（服务端渲染时显示"加载编辑器..."）

3. **集成到项目编辑页** (`app/pages/projects/[id]/edit.vue`)
   - 添加了富文本编辑器用于编辑项目详细内容
   - 使用 `toolbar="full"` 提供完整的编辑功能

4. **创建演示页面** (`app/pages/demo/preview.vue`)
   - 从 `/public/demo.text` 加载外部文本文件 (40KB)
   - 自动转换纯文本为 HTML 格式（段落和换行）
   - 展示 Quill 编辑器的完整功能

## 使用方法

### 基本用法
```vue
<template>
  <QuillEditor v-model="content" />
</template>

<script setup>
const content = ref('<p>初始内容</p>')
</script>
```

### 自定义工具栏
```vue
<!-- 使用预设 -->
<QuillEditor 
  v-model="content" 
  toolbar="minimal"  <!-- minimal | essential | full -->
/>

<!-- 自定义工具栏 -->
<QuillEditor 
  v-model="content" 
  :toolbar="[
    ['bold', 'italic'],
    ['link', 'image']
  ]"
/>
```

### 其他选项
```vue
<QuillEditor
  v-model="content"
  placeholder="请输入内容..."
  theme="snow"  <!-- snow | bubble -->
  :read-only="false"
  toolbar="full"
/>
```

## 工具栏预设

- **minimal**: 基础格式化（加粗、斜体、下划线、列表、链接）
- **essential**: 常用功能（包含代码块、引用、标题、图片）
- **full**: 完整功能（包含字体、颜色、对齐、视频等）

## 注意事项

1. QuillEditor 在客户端渲染，SSR 时需要注意
2. 样式使用 UnoCSS 的 `@apply` 指令（linter 警告可忽略）
3. 编辑器内容以 HTML 格式存储

## 测试步骤

1. 启动开发服务器: `npm run dev`
2. 访问任意项目编辑页: `http://localhost:3000/projects/1/edit`
3. 在"项目详细内容"区域测试富文本编辑器
4. 测试功能：
   - 文本格式化（加粗、斜体、下划线等）
   - 插入列表
   - 插入链接和图片
   - 代码块
   - 标题样式
