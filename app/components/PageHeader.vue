<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
    <div>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">{{ title }}</h1>
      <p v-if="description" class="text-gray-600 dark:text-gray-400 mt-1">
        {{ description }}
      </p>
    </div>
    <div class="flex gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>
