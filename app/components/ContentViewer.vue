<template>
  <div class="content-viewer">
    <article v-if="doc" class="prose">
      <h1>{{ doc.title || doc._path }}</h1>
      <ContentDoc :value="doc" />
    </article>
    <div v-else class="text-gray-500">
      No content found.
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  doc: {
    type: Object,
    default: null
  }
})
</script>

<style scoped>
.content-viewer {
  max-w-4xl mx-auto p-6
}

.prose {
  font-family: Georgia, serif
  line-height: 1.8
  color: #333
}

.prose :deep(h1),
.prose :deep(h2),
.prose :deep(h3) {
  margin-top: 1.5em
  margin-bottom: 0.5em
  font-weight: bold
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
}

.prose :deep(h1) {
  font-size: 2em
}

.prose :deep(h2) {
  font-size: 1.5em
}

.prose :deep(h3) {
  font-size: 1.25em
}

.prose :deep(p) {
  margin-bottom: 1em
}

.prose :deep(code) {
  background: #f5f5f5
  padding: 0.2em 0.4em
  border-radius: 3px
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace
  font-size: 0.9em
}

.prose :deep(pre) {
  background: #f5f5f5
  padding: 1em
  border-radius: 5px
  overflow-x: auto
  margin-bottom: 1em
}

.prose :deep(pre code) {
  background: none
  padding: 0
}

.prose :deep(ul),
.prose :deep(ol) {
  margin-left: 2em
  margin-bottom: 1em
}

.prose :deep(li) {
  margin-bottom: 0.5em
}

.prose :deep(blockquote) {
  border-left: 4px solid #ddd
  padding-left: 1em
  margin-left: 0
  color: #666
}

.prose :deep(a) {
  color: #0066cc
  text-decoration: none
}

.prose :deep(a:hover) {
  text-decoration: underline
}
</style>
