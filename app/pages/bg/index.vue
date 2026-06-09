<template>
  <!-- 父容器：相对定位，作为层叠上下文 -->
  <div class="relative flex items-center justify-center min-h-screen p-4">
    <!-- 后节点：背景图片，绝对定位置于底层 -->
    <div class="background absolute inset-0 w-full h-full">
      <NuxtImg
        src="/images/bg.png"
        class="object-cover w-full h-full z-1"
        alt="Background"
      />

      <div class="bg-filter absolute inset-0 w-full h-full z-2" />
    </div>

    <!-- 前节点：相对定位，浮于背景之上 -->
    <!-- <div
      class="relative bg-white/90 rounded-xl shadow-lg p-6 text-center max-w-sm z-10"
    >
      <h2 class="text-xl font-bold text-gray-800">前景内容</h2>
      <p class="mt-2 text-gray-600">背景图片位于下方</p>
    </div> -->

     <div class="relative z-10 flex items-center justify-center w-full h-full">
      <slot name="foreground">
        <!-- 默认内容：纯色半透明卡片 + 提示文字 -->
        <div class="bg-black/50 backdrop-blur-sm text-white p-4 rounded-xl text-center">
          <p class="text-sm">未提供自定义内容</p>
          <p class="text-xs mt-1">请使用 <code class="bg-white/20 px-1 rounded">#foreground</code> 插槽</p>
        </div>
      </slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
// 极简 SCSS（可选，确保父级创建独立层叠上下文）
.relative {
  isolation: isolate;
}

.bg-filter {
  // 可选：添加滤镜或调整背景样式
  // filter: brightness(0.8);
  background: linear-gradient(180deg, rgba(21, 120, 208, 0.80) 0%, rgba(21, 120, 208, 0.00) 30%, rgba(18, 18, 18, 0.00) 50%, rgba(18, 18, 18, 0.50) 75%, #121212 100%);
}
</style>
