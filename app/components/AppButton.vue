<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'default'
  size?: 'sm' | 'md' | 'lg'
  icon?: string
  loading?: boolean
  disabled?: boolean
}>()

defineEmits<{
  click: []
}>()
</script>

<template>
  <button 
    :disabled="disabled || loading"
    :class="[
      'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors',
      {
        'btn-primary': variant === 'primary',
        'btn-secondary': variant === 'secondary',
        'btn-success': variant === 'success',
        'btn-danger': variant === 'danger',
        'btn': !variant || variant === 'default',
        'px-3 py-1.5 text-sm': size === 'sm',
        'px-4 py-2 text-base': size === 'md' || !size,
        'px-6 py-3 text-lg': size === 'lg',
        'opacity-50 cursor-not-allowed': disabled,
        'cursor-wait': loading
      }
    ]"
    @click="$emit('click')"
  >
    <i v-if="loading" class="i-carbon-spinner animate-spin w-4 h-4"></i>
    <i v-else-if="icon" :class="icon" class="w-4 h-4"></i>
    <slot />
  </button>
</template>
