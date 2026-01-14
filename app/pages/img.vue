<script lang="ts" setup>
// 宽高比常量，用于防止 CLS
const ASPECT_RATIO = '4 / 3'
</script>

<template>
  <div class="flex flex-col lg:flex-row items-center justify-center min-h-screen bg-gray-50 p-4 gap-4">
    <div
      class="w-full lg:w-1/2 max-w-2xl flex-shrink-0"
      :style="{ aspectRatio: ASPECT_RATIO }"
    >
      <NuxtImg
        src="/images/ian-1.png"
        alt="Preference Page"
        width="800"
        height="600"
        :sizes="'800'"
        loading="lazy"
        format="webp"
        quality="80"
        fetchpriority="high"
        class="w-full h-full object-cover rounded-lg shadow-lg"
        @error="console.error('Image 1 loading failed')"
      />
      NuxtImg
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

/* 确保图片不会导致布局溢出 */
:deep(img),
:deep([role="img"]) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
