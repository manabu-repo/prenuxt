<template>
  <div class="min-h-screen bg-gray-50">
    <PageHeader title="Documentation" description="Browse and view project documentation" />
    
    <div class="container mx-auto p-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <!-- Sidebar with doc list -->
        <aside class="md:col-span-1">
          <div class="bg-white rounded-lg shadow p-4 sticky top-6">
            <h2 class="text-lg font-semibold mb-4">Documentation</h2>
            <nav class="space-y-2">
              <NuxtLink
                v-for="doc in docs"
                :key="doc._id"
                :to="`/docs/${doc._path}`"
                class="block px-3 py-2 rounded-lg text-sm hover:bg-blue-50 transition-colors"
                :class="{ 'bg-blue-100 text-blue-900 font-semibold': isActive(doc._path) }"
              >
                {{ doc.title || doc._path }}
              </NuxtLink>
            </nav>
          </div>
        </aside>

        <!-- Main content area -->
        <main class="md:col-span-3">
          <div class="bg-white rounded-lg shadow p-8">
            <ContentViewer :doc="doc" />
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { data: docs } = await useFetch('/api/docs/list')
const currentPath = computed(() => route.params.path ? route.params.path.join('/') : '')
const { data: doc } = await useFetch(
  computed(() => `/api/docs/${currentPath}`)
)

const isActive = (path: string) => {
  return currentPath.value === path
}

// Redirect to first doc if none selected
if (!currentPath.value && Array.isArray(docs.value) && docs.value.length > 0) {
  await navigateTo(`/docs/${docs.value[0]._path}`)
}
</script>
