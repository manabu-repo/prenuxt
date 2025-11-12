<script setup lang="ts">
interface MenuItem {
  label: string
  icon?: string
  onClick: () => void
  disabled?: boolean
}

interface Props {
  label?: string
  icon?: string
  variant?: 'primary' | 'secondary' | 'danger'
  loading?: boolean
  disabled?: boolean
  items: MenuItem[]
}

const props = withDefaults(defineProps<Props>(), {
  label: '操作',
  variant: 'secondary',
  loading: false,
  disabled: false
})

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

// 切换下拉菜单
const toggleDropdown = () => {
  if (!props.disabled && !props.loading) {
    isOpen.value = !isOpen.value
  }
}

// 点击菜单项
const handleItemClick = (item: MenuItem) => {
  if (!item.disabled) {
    item.onClick()
    isOpen.value = false
  }
}

// 点击外部关闭
const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

// 变体样式
const buttonClass = computed(() => {
  const base = 'inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors relative'
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 disabled:bg-gray-100',
    danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400'
  }
  const disabled = props.disabled || props.loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
  return `${base} ${variants[props.variant]} ${disabled}`
})
</script>

<template>
  <div ref="dropdownRef" class="dropdown-container relative inline-block">
    <!-- 下拉按钮 -->
    <button
      :class="buttonClass"
      @click="toggleDropdown"
      :disabled="disabled || loading"
    >
      <i v-if="icon && !loading" :class="icon" />
      <i v-if="loading" class="i-mdi-loading animate-spin" />
      <span>{{ label }}</span>
      <i 
        class="i-mdi-chevron-down transition-transform"
        :class="{ 'rotate-180': isOpen }"
      />
    </button>

    <!-- 下拉菜单 -->
    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-show="isOpen"
        class="dropdown-menu absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50"
      >
        <div class="py-1">
          <button
            v-for="(item, index) in items"
            :key="index"
            @click="handleItemClick(item)"
            :disabled="item.disabled"
            class="w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors"
            :class="[
              item.disabled 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer'
            ]"
          >
            <i v-if="item.icon" :class="item.icon" />
            <span>{{ item.label }}</span>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.dropdown-container {
  display: inline-block;
}

.dropdown-menu {
  min-width: 12rem;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
