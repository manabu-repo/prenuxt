<script setup>
// Import only on client side to avoid SSR issues
const QuillEditor = process.client ? (await import('@vueup/vue-quill')).QuillEditor : null

// Import styles only on client
if (process.client) {
  await import('@vueup/vue-quill/dist/vue-quill.snow.css')
}

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '开始编辑...'
  },
  theme: {
    type: String,
    default: 'snow',
    validator: (value) => ['snow', 'bubble'].includes(value)
  },
  readOnly: {
    type: Boolean,
    default: false
  },
  toolbar: {
    type: [String, Array, Object],
    default: 'essential'
  }
})

const emit = defineEmits(['update:modelValue'])

const content = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 预设工具栏配置
const toolbarOptions = {
  essential: [
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote', 'code-block'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'header': [1, 2, 3, false] }],
    ['link', 'image'],
    ['clean']
  ],
  minimal: [
    ['bold', 'italic', 'underline'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['link']
  ],
  full: [
    [{ 'font': [] }],
    [{ 'size': ['small', false, 'large', 'huge'] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'script': 'sub'}, { 'script': 'super' }],
    [{ 'header': 1 }, { 'header': 2 }],
    ['blockquote', 'code-block'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'indent': '-1'}, { 'indent': '+1' }],
    [{ 'direction': 'rtl' }],
    [{ 'align': [] }],
    ['link', 'image', 'video'],
    ['clean']
  ]
}

const editorToolbar = computed(() => {
  if (typeof props.toolbar === 'string') {
    return toolbarOptions[props.toolbar] || toolbarOptions.essential
  }
  return props.toolbar
})
</script>

<template>
  <ClientOnly>
    <div class="quill-editor-wrapper">
      <component
        :is="QuillEditor"
        v-model:content="content"
        :theme="theme"
        :toolbar="editorToolbar"
        :placeholder="placeholder"
        :readOnly="readOnly"
        contentType="html"
      />
    </div>
    <template #fallback>
      <div class="quill-editor-wrapper">
        <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 p-4 min-h-[200px] flex items-center justify-center">
          <div class="text-gray-400 dark:text-gray-500 flex items-center gap-2">
            <i class="i-carbon-spinner animate-spin w-5 h-5"></i>
            <span>加载编辑器...</span>
          </div>
        </div>
      </div>
    </template>
  </ClientOnly>
</template>

<style scoped>
.quill-editor-wrapper {
  @apply bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700;
}

.quill-editor-wrapper :deep(.ql-toolbar) {
  @apply border-b border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-t-lg;
}

.quill-editor-wrapper :deep(.ql-container) {
  @apply rounded-b-lg;
}

.quill-editor-wrapper :deep(.ql-editor) {
  @apply min-h-[200px] text-gray-900 dark:text-gray-100;
}

.quill-editor-wrapper :deep(.ql-editor.ql-blank::before) {
  @apply text-gray-400 dark:text-gray-500;
}

/* 工具栏按钮样式 */
.quill-editor-wrapper :deep(.ql-toolbar button) {
  @apply text-gray-700 dark:text-gray-300;
}

.quill-editor-wrapper :deep(.ql-toolbar button:hover) {
  @apply text-blue-600 dark:text-blue-400;
}

.quill-editor-wrapper :deep(.ql-toolbar button.ql-active) {
  @apply text-blue-600 dark:text-blue-400;
}

.quill-editor-wrapper :deep(.ql-toolbar .ql-stroke) {
  @apply stroke-gray-700 dark:stroke-gray-300;
}

.quill-editor-wrapper :deep(.ql-toolbar .ql-fill) {
  @apply fill-gray-700 dark:fill-gray-300;
}

.quill-editor-wrapper :deep(.ql-toolbar button:hover .ql-stroke) {
  @apply stroke-blue-600 dark:stroke-blue-400;
}

.quill-editor-wrapper :deep(.ql-toolbar button:hover .ql-fill) {
  @apply fill-blue-600 dark:fill-blue-400;
}

.quill-editor-wrapper :deep(.ql-toolbar button.ql-active .ql-stroke) {
  @apply stroke-blue-600 dark:stroke-blue-400;
}

.quill-editor-wrapper :deep(.ql-toolbar button.ql-active .ql-fill) {
  @apply fill-blue-600 dark:fill-blue-400;
}
</style>
