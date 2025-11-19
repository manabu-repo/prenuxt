<script setup lang="ts">
import { ref, onMounted } from 'vue'

const htmlContent = ref('加载中...')

onMounted(async () => {
	try {
		// 直接 fetch 静态 html 文件
		const res = await fetch('/demo_document.html')
		htmlContent.value = await res.text()
	} catch (err) {
		htmlContent.value = '<p style="color:red">加载失败</p>'
	}
})
</script>

<template>
	<div class="max-w-4xl mx-auto p-6 bg-white rounded shadow">
		<div v-html="htmlContent"></div>
	</div>
</template>

<style scoped>
body, html {
	background: #f8f9fa;
}
</style>

<style>
/* PDF 导出/打印时显示页码 */
@media print {
  @page {
    size: A4;
    margin: 15mm;
    @bottom-center {
      content: counter(page);
      font-size: 10pt;
      color: #999;
      padding-top: 10mm;
    }
  }
  /* 首页不显示页码 */
  /* @page :first {
    @bottom-center { content: ""; }
  } */
}
</style>
