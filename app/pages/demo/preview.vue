<script setup lang="ts">
// 导入 PDF 导出优化样式
import '~/assets/css/pdf-export.css'

definePageMeta({
  layout: 'default'
})

useHead({
  title: 'Quill Editor Demo',
  meta: [
    { name: 'description', content: 'Quill 编辑器演示页面' }
  ]
})

// 加载文本文件
const content = ref('<p>正在加载文件...</p>')
const textData = ref<string | null>(null)
const editorRef = ref<HTMLElement | null>(null)

// 使用 PDF 导出
const { isExporting, exportQuillToPdf } = usePdfExport()

// 使用文件保存
const { isSaving, saveQuillContent } = useFileSave()

onMounted(async () => {
  try {
    const response = await $fetch<string>('/demo.text', {
      responseType: 'text'
    })

    // 将纯文本转换为 HTML 格式（保留换行和段落）
    const htmlContent = response
      .split('\n\n')
      .map((para: string) => para.trim())
      .filter((para: string) => para.length > 0)
      .map((para: string) => `<p>${para.replace(/\n/g, '<br>')}</p>`)
      .join('')

    textData.value = htmlContent
    content.value = htmlContent
  } catch (error) {
    console.error('Failed to load demo.text:', error)
    content.value = '<p style="color: red;">❌ 文件加载失败</p>'
  }
})

// 导出为 PDF
const exportToPDF = async () => {
  if (!editorRef.value) return

  const result = await exportQuillToPdf(editorRef.value as HTMLElement, {
    showPageNumbers: true,
    quality: 0.98,
    scale: 2
  })

  if (!result?.success) {
    alert('导出 PDF 失败，请查看控制台')
  }
}

// 保存文件
const saveFile = async (format: 'html' | 'text' | 'markdown') => {
  if (!editorRef.value) return

  const result = await saveQuillContent(editorRef.value as HTMLElement, {
    filename: 'demo_document',
    format,
    includeStyles: true
  })

  if (!result?.success) {
    alert('保存文件失败，请查看控制台')
  }
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader 
      title="Quill Editor Demo" 
      description="演示富文本编辑器加载外部文本文件"
    >
      <template #actions>
        <div class="flex gap-2">
          <!-- 保存下拉菜单 -->
          <AppDropdown
            label="保存文件"
            icon="i-mdi-content-save"
            variant="secondary"
            :loading="isSaving"
            :disabled="isSaving"
            :items="[
              {
                label: '保存为 HTML',
                icon: 'i-mdi-language-html5',
                onClick: () => saveFile('html')
              },
              {
                label: '保存为 Markdown',
                icon: 'i-mdi-markdown',
                onClick: () => saveFile('markdown')
              },
              {
                label: '保存为文本',
                icon: 'i-mdi-text',
                onClick: () => saveFile('text')
              }
            ]"
          />

          <!-- PDF 导出按钮 -->
          <AppButton 
            @click="exportToPDF"
            :loading="isExporting"
            :disabled="isExporting"
            variant="primary"
          >
            <i class="i-mdi-file-pdf-box mr-2" />
            {{ isExporting ? '导出中...' : '导出 PDF' }}
          </AppButton>
        </div>
      </template>
    </PageHeader>

    <AppCard padding="lg">
      <div ref="editorRef" class="quill-container">
        <QuillEditor
          v-model="content"
          theme="snow"
          toolbar="full"
          placeholder="开始编辑..."
        />
      </div>
    </AppCard>

    <AppCard padding="sm">
      <div class="text-sm text-gray-600 dark:text-gray-400">
        <strong>源文件:</strong> /public/demo.text 
        <span class="ml-2" :class="textData ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'">
          ({{ textData ? '✓ 已加载' : '⏳ 加载中...' }})
        </span>
      </div>
    </AppCard>
  </div>
</template>

<style scoped>
.quill-container :deep(.ql-container) {
  max-height: 500px;
  overflow-y: auto;
}
</style>
