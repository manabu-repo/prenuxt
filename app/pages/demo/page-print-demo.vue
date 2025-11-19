<template>
  <div class="print-demo-container">
    <h1>打印页码演示 Demo</h1>
    <p>本页面用于演示 CSS <code>@page</code> 规则在打印时自动显示页码的效果。</p>
    <div class="demo-content">
      <h2>内容分页示例</h2>
      <div v-for="i in 10" :key="i" class="demo-page-block">
        <h3>第 {{ i }} 页内容</h3>
        <p>这是第 {{ i }} 页的内容。请使用浏览器打印预览（Ctrl+P / Cmd+P）查看底部页码效果。</p>
        <div style="height: 600px; background: #f5f5f5; margin: 16px 0; border-radius: 8px;"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 无需特殊逻辑
</script>

<style>
.print-demo-container {
  max-width: 800px;
  margin: 40px auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  padding: 32px;
}
.demo-content {
  margin-top: 32px;
}
.demo-page-block {
  page-break-after: always;
  padding-bottom: 24px;
}
.demo-page-block:last-child {
  page-break-after: auto;
}
@media print {
  @page {
    size: A4;
    margin: 20mm;
    z-index: 999;
    @bottom-center {
      content: counter(page);
      font-size: 12pt;
      color: #888;
    }
  }
  @page :first {
    @bottom-center { content: ""; }
  }
  .print-demo-container {
    box-shadow: none;
    border-radius: 0;
    background: #fff;
    padding: 0;
  }
}
</style>
