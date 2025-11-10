<script setup>
// 页面元数据
useHead({
  title: '项目列表',
  meta: [
    { name: 'description', content: '查看所有项目' }
  ]
})

// 模拟项目数据
const projects = ref([
  {
    id: 1,
    name: '示例项目 1',
    description: '这是一个使用 Nuxt 3 构建的示例项目',
    status: 'active',
    updatedAt: '2025-11-10'
  },
  {
    id: 2,
    name: '示例项目 2',
    description: '集成了 UnoCSS 的现代化项目',
    status: 'active',
    updatedAt: '2025-11-09'
  },
  {
    id: 3,
    name: '示例项目 3',
    description: '展示中间件和路由功能的项目',
    status: 'archived',
    updatedAt: '2025-11-08'
  }
])

// 过滤器
const filter = ref('all')
const filteredProjects = computed(() => {
  if (filter.value === 'all') return projects.value
  return projects.value.filter(p => p.status === filter.value)
})

// 搜索
const searchQuery = ref('')
const searchedProjects = computed(() => {
  if (!searchQuery.value) return filteredProjects.value
  return filteredProjects.value.filter(p => 
    p.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})
</script>

<template>
  <div class="space-y-6">
    <!-- 页头 -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">项目列表</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">
          管理和查看所有项目
        </p>
      </div>
      <button class="btn-primary">
        <i class="i-carbon-add w-4 h-4"></i>
        新建项目
      </button>
    </div>
    
    <!-- 搜索和过滤 -->
    <div class="card p-4">
      <div class="flex flex-col sm:flex-row gap-4">
        <!-- 搜索框 -->
        <div class="flex-1">
          <div class="relative">
            <i class="i-carbon-search absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"></i>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索项目..."
              class="input pl-10 w-full"
            />
          </div>
        </div>
        
        <!-- 状态过滤 -->
        <div class="flex gap-2">
          <button
            @click="filter = 'all'"
            :class="[
              'px-4 py-2 rounded-lg font-medium transition-colors',
              filter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            ]"
          >
            全部 ({{ projects.length }})
          </button>
          <button
            @click="filter = 'active'"
            :class="[
              'px-4 py-2 rounded-lg font-medium transition-colors',
              filter === 'active' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            ]"
          >
            活跃
          </button>
          <button
            @click="filter = 'archived'"
            :class="[
              'px-4 py-2 rounded-lg font-medium transition-colors',
              filter === 'archived' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            ]"
          >
            归档
          </button>
        </div>
      </div>
    </div>
    
    <!-- 项目列表 -->
    <div v-if="searchedProjects.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="project in searchedProjects"
        :key="project.id"
        class="card p-6 hover:shadow-lg transition-shadow cursor-pointer"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {{ project.name }}
            </h3>
            <span
              :class="[
                'inline-flex items-center px-2 py-1 rounded text-xs font-medium',
                project.status === 'active'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
              ]"
            >
              {{ project.status === 'active' ? '活跃' : '归档' }}
            </span>
          </div>
          <button class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <i class="i-carbon-overflow-menu-vertical w-5 h-5"></i>
          </button>
        </div>
        
        <p class="text-gray-600 dark:text-gray-400 text-sm mb-4">
          {{ project.description }}
        </p>
        
        <div class="flex items-center justify-between text-sm">
          <span class="text-gray-500 dark:text-gray-500">
            更新于 {{ project.updatedAt }}
          </span>
          <NuxtLink
            :to="`/projects/${project.id}/edit`"
            class="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-1"
          >
            编辑
            <i class="i-carbon-arrow-right w-4 h-4"></i>
          </NuxtLink>
        </div>
      </div>
    </div>
    
    <!-- 空状态 -->
    <div v-else class="card p-12 text-center">
      <i class="i-carbon-folder-off w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4"></i>
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        未找到项目
      </h3>
      <p class="text-gray-600 dark:text-gray-400 mb-6">
        {{ searchQuery ? '没有匹配的项目' : '还没有项目，开始创建第一个吧' }}
      </p>
      <button v-if="!searchQuery" class="btn-primary">
        <i class="i-carbon-add w-4 h-4"></i>
        创建项目
      </button>
    </div>
  </div>
</template>
