<script lang="ts" setup>
import flowerImg from '~/assets/img/flower.jpg'
import { useOptimizedImage } from '~/composables/useOptimizedImage'

// 宽高比常量，用于防止 CLS
const ASPECT_RATIO = '4 / 3'

// 使用图片优化 composable
const { getImageAttrs } = useOptimizedImage()
</script>

<template>
  <div class="flex flex-col lg:flex-row items-center justify-center min-h-screen bg-gray-50 p-4 gap-4">
    <!-- 第一张图片：LCP 关键内容 -->
    <div
      class="w-full lg:w-1/2 max-w-2xl flex-shrink-0"
      :style="{ aspectRatio: ASPECT_RATIO }"
    >
      <NuxtImg
        src="/images/cat.jpg"
        alt="Preference Page"
        width="800"
        height="600"
        :sizes="'800px'"
        loading="eager"
        fetchpriority="high"
        format="webp"
        quality="80"
        class="w-full h-full object-cover rounded-lg shadow-lg object-cover"
        @error="console.error('Image 1 loading failed')"
      />
    </div>

    <!-- 第二张图片：辅助内容 -->
    <div
      class="w-full lg:w-1/2 max-w-2xl flex-shrink-0"
      :style="{ aspectRatio: ASPECT_RATIO }"
    >
      <img
        v-bind="getImageAttrs(flowerImg, 'Flower Image', {
          width: 800,
          height: 600,
          fetchPriority: 'auto'
        })"
        class="w-full h-full object-cover rounded-lg shadow-lg"
        @error="console.error('Image 2 loading failed')"
      />
    </div>
  </div>
</template>

<style scoped>
/* 防止 CLS 和布局抖动 */
div[style*="aspectRatio"] {
  box-sizing: border-box;
  /* ✅ 关键：防止 flex 容器在内容加载前收缩 */
  min-height: 0;
  /* 防止图片导致容器变形 */
  overflow: hidden;
}
</style>
