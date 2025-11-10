<script setup>
definePageMeta({
  layout: 'default'
})

useHead({
  title: '项目列表',
  meta: [
    { name: 'description', content: '查看所有项目' }
  ]
})

// 使用 composable 获取项目数据
const { projects, loading } = useProjects()

// 过滤和搜索状态
const filter = ref('all')
const searchQuery = ref('')

// 计算显示的项目列表
const displayedProjects = computed(() => {
  let result = projects.value
  
  // 应用状态过滤
  if (filter.value !== 'all') {
    result = result.filter(p => p.status === filter.value)
  }
  
  // 应用搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query)
    )
  }
  
  return result
})
</script>

<template>
  <div class="space-y-6">
    <!-- 页头 -->
    <PageHeader 
      title="项目列表" 
      description="管理和查看所有项目"
    >
      <template #actions>
        <AppButton variant="primary" icon="i-carbon-add">
          新建项目
        </AppButton>
      </template>
    </PageHeader>
    
    <!-- 搜索和过滤 -->
    <AppCard padding="sm">
      <div class="flex flex-col sm:flex-row gap-4">
        <!-- 搜索框 -->
        <div class="flex-1">
          <SearchInput 
            v-model="searchQuery" 
            placeholder="搜索项目..."
          />
        </div>
        
        <!-- 状态过滤按钮 -->
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
    </AppCard>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="text-center py-12">
      <i class="i-carbon-spinner animate-spin w-8 h-8 mx-auto text-blue-600"></i>
      <p class="mt-4 text-gray-600 dark:text-gray-400">加载中...</p>
    </div>
    
    <!-- 项目列表 -->
    <div 
      v-else-if="displayedProjects.length > 0" 
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <AppCard
        v-for="project in displayedProjects"
        :key="project.id"
        hover
        class="cursor-pointer"
        @click="navigateTo(`/projects/${project.id}/edit`)"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
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
          <button 
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            @click.stop
          >
            <i class="i-carbon-overflow-menu-vertical w-5 h-5"></i>
          </button>
        </div>
        
        <p class="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
          {{ project.description }}
        </p>
        
        <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
          <span class="flex items-center gap-1">
            <i class="i-carbon-time w-4 h-4"></i>
            {{ project.updatedAt }}
          </span>
          <span>ID: {{ project.id }}</span>
        </div>
      </AppCard>
    </div>
    
    <!-- 空状态 -->
    <AppCard v-else padding="lg">
      <div class="text-center py-12">
        <i class="i-carbon-folder-off w-16 h-16 mx-auto text-gray-400 mb-4"></i>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          没有找到项目
        </h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          {{ searchQuery ? '试试其他搜索词' : '开始创建你的第一个项目' }}
        </p>
        <AppButton 
          v-if="!searchQuery" 
          variant="primary" 
          icon="i-carbon-add"
        >
          新建项目
        </AppButton>
      </div>
    </AppCard>
  </div>
</template>
