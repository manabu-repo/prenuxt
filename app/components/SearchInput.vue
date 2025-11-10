<script setup lang="ts">
const modelValue = defineModel<string>()

defineProps<{
  placeholder?: string
}>()
</script>

<template>
  <div class="relative">
    <i class="i-carbon-search absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"></i>
    <input
      v-model="modelValue"
      type="text"
      :placeholder="placeholder || '搜索...'"
      class="input pl-10 w-full"
    />
  </div>
</template>
