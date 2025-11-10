<script setup lang="ts">
defineProps<{
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
}>()
</script>

<template>
  <div 
    :class="[
      'card',
      {
        'p-0': padding === 'none',
        'p-4': padding === 'sm',
        'p-6': padding === 'md' || !padding,
        'p-8': padding === 'lg',
        'hover:shadow-lg transition-shadow cursor-pointer': hover
      }
    ]"
  >
    <slot />
  </div>
</template>
