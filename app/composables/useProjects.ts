export interface Project {
  id: number
  name: string
  description: string
  status: 'active' | 'archived' | 'draft'
  tags?: string[]
  createdAt?: string
  updatedAt?: string
}

export const useProjects = () => {
  // 使用 useState 在 SSR 和客户端之间共享状态
  const projects = useState<Project[]>('projects', () => [
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

  const loading = ref(false)
  const error = ref<Error | null>(null)

  // 获取所有项目
  const fetchProjects = async () => {
    loading.value = true
    error.value = null
    try {
      // TODO: 替换为真实 API 调用
      // const data = await $fetch('/api/projects')
      // projects.value = data
      await new Promise(resolve => setTimeout(resolve, 300))
    } catch (e) {
      error.value = e as Error
      console.error('Failed to fetch projects:', e)
    } finally {
      loading.value = false
    }
  }

  // 根据 ID 获取单个项目
  const getProjectById = (id: number | string) => {
    return computed(() => 
      projects.value.find(p => p.id === Number(id))
    )
  }

  // 过滤项目
  const filterProjects = (status?: string) => {
    return computed(() => {
      if (!status || status === 'all') return projects.value
      return projects.value.filter(p => p.status === status)
    })
  }

  // 搜索项目
  const searchProjects = (query: string) => {
    return computed(() => {
      if (!query) return projects.value
      const lowerQuery = query.toLowerCase()
      return projects.value.filter(p => 
        p.name.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery)
      )
    })
  }

  // 更新项目
  const updateProject = async (id: number, updates: Partial<Project>) => {
    loading.value = true
    error.value = null
    try {
      // TODO: 替换为真实 API 调用
      // await $fetch(`/api/projects/${id}`, { method: 'PUT', body: updates })
      const index = projects.value.findIndex(p => p.id === id)
      if (index !== -1) {
        projects.value[index] = { ...projects.value[index], ...updates } as Project
      }
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  // 创建项目
  const createProject = async (project: Omit<Project, 'id'>) => {
    loading.value = true
    error.value = null
    try {
      // TODO: 替换为真实 API 调用
      const newId = Math.max(...projects.value.map(p => p.id)) + 1
      const newProject = { ...project, id: newId }
      projects.value.push(newProject)
      await new Promise(resolve => setTimeout(resolve, 500))
      return newProject
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  // 删除项目
  const deleteProject = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      // TODO: 替换为真实 API 调用
      // await $fetch(`/api/projects/${id}`, { method: 'DELETE' })
      projects.value = projects.value.filter(p => p.id !== id)
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    projects: readonly(projects),
    loading: readonly(loading),
    error: readonly(error),
    fetchProjects,
    getProjectById,
    filterProjects,
    searchProjects,
    updateProject,
    createProject,
    deleteProject
  }
}
