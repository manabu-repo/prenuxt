<script setup>
// 导入 PDF 导出优化样式
import '~/assets/css/pdf-export.css'

definePageMeta({
  layout: 'default'
})

const route = useRoute()
const router = useRouter()

// 页面元数据
useHead({
  title: `编辑项目 #${route.params.id}`,
  meta: [
    { name: 'description', content: '编辑项目信息' }
  ]
})

// 模拟获取项目数据
const project = ref({
  id: route.params.id,
  name: '示例项目 ' + route.params.id,
  description: '这是一个示例项目的详细描述',
  content: '<h2>项目详细内容</h2><p>使用 Quill 编辑器编辑项目的详细内容，支持富文本格式。</p><ul><li>支持列表</li><li>支持格式化</li><li>支持插入图片和链接</li></ul>',
  status: 'active',
  tags: ['nuxt', 'vue', 'typescript'],
  createdAt: '2025-11-01',
  updatedAt: '2025-11-10'
})

// 表单状态
const saving = ref(false)

// 保存项目
const saveProject = async () => {
  saving.value = true
  // 模拟保存
  await new Promise(resolve => setTimeout(resolve, 1000))
  saving.value = false
  
  // 使用 Nuxt 的通知系统（这里简化为 alert）
  alert('项目保存成功！')
}

// 返回列表
const goBack = () => {
  router.push('/projects')
}

// 删除项目
const deleteProject = () => {
  if (confirm('确定要删除这个项目吗？此操作无法撤销。')) {
    // 模拟删除
    alert('项目已删除')
    router.push('/projects')
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- 面包屑导航 -->
    <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
      <NuxtLink to="/projects" class="hover:text-blue-600 dark:hover:text-blue-400">
        项目
      </NuxtLink>
      <i class="i-carbon-chevron-right w-4 h-4"></i>
      <span class="text-gray-900 dark:text-white">编辑项目 #{{ route.params.id }}</span>
    </div>
    
    <!-- 页头 -->
    <PageHeader 
      title="编辑项目" 
      :description="`项目 ID: ${route.params.id}`"
    >
      <template #actions>
        <AppButton @click="goBack" icon="i-carbon-arrow-left">
          返回列表
        </AppButton>
      </template>
    </PageHeader>
    
    <!-- 编辑表单 -->
    <AppCard padding="lg">
      <form @submit.prevent="saveProject" class="space-y-6">
        <!-- 项目名称 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            项目名称
          </label>
          <input
            v-model="project.name"
            type="text"
            class="input w-full"
            placeholder="输入项目名称"
            required
          />
        </div>
        
        <!-- 项目简述 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            项目简述
          </label>
          <textarea
            v-model="project.description"
            class="input w-full"
            rows="3"
            placeholder="输入项目简短描述"
          />
        </div>
        
        <!-- 项目详细内容（Quill 编辑器）-->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            项目详细内容
          </label>
          <QuillEditor
            v-model="project.content"
            placeholder="编辑项目的详细内容..."
            toolbar="full"
          />
        </div>
        
        <!-- 项目状态 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            项目状态
          </label>
          <select v-model="project.status" class="input w-full">
            <option value="active">活跃</option>
            <option value="archived">归档</option>
            <option value="draft">草稿</option>
          </select>
        </div>
        
        <!-- 标签 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            标签
          </label>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="tag in project.tags"
              :key="tag"
              class="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-full text-sm"
            >
              {{ tag }}
            </span>
            <button
              type="button"
              class="px-3 py-1 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-full text-sm text-gray-600 dark:text-gray-400 hover:border-blue-500 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
            >
              + 添加标签
            </button>
          </div>
        </div>
        
        <!-- 项目信息 -->
        <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
            项目信息
          </h3>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-gray-600 dark:text-gray-400">创建时间:</span>
              <span class="ml-2 text-gray-900 dark:text-white">{{ project.createdAt }}</span>
            </div>
            <div>
              <span class="text-gray-600 dark:text-gray-400">更新时间:</span>
              <span class="ml-2 text-gray-900 dark:text-white">{{ project.updatedAt }}</span>
            </div>
          </div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            @click="goBack"
            class="btn"
          >
            <i class="i-carbon-arrow-left w-4 h-4"></i>
            取消
          </button>
          <button
            type="submit"
            class="btn-primary"
            :disabled="saving"
          >
            <i v-if="!saving" class="i-carbon-save w-4 h-4"></i>
            <i v-else class="i-carbon-renew w-4 h-4 animate-spin"></i>
            {{ saving ? '保存中...' : '保存更改' }}
          </button>
        </div>
      </form>
    </AppCard>
    
    <!-- 危险操作区域 -->
    <AppCard class="border-red-200 dark:border-red-900">
      <h3 class="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
        危险操作
      </h3>
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
        删除项目将无法恢复，请谨慎操作
      </p>
      <AppButton variant="danger" icon="i-carbon-trash-can" @click="deleteProject">
        删除项目
      </AppButton>
    </AppCard>
  </div>
</template>
