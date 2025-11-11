<script setup lang="ts">
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
</script>

<template>
  <div class="space-y-6">
    <PageHeader 
      title="Quill Editor Demo" 
      description="演示富文本编辑器加载外部文本文件"
    />
    
    <AppCard padding="lg">
      <div class="quill-container">
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
