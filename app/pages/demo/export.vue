<script setup lang="ts">
import { ref, nextTick } from 'vue'

definePageMeta({
  middleware: 'demo'
})

const url = ref('')
const mode = ref<'html2pdf'|'jspdf'|'playwright'|'pdfmake'|'chromium'>('html2pdf')
const scale = ref(2)
const quality = ref(0.98)
const orientation = ref<'portrait'|'landscape'>('portrait')
const exporting = ref(false)
const message = ref('')
const showPreview = ref(false)
const previewHtml = ref('')

// create a hidden container to render fetched HTML
const createHiddenContainer = (html: string) => {
  // remove previous container
  const prev = document.getElementById('pdf-export-hidden-container')
  if (prev) prev.remove()

  const container = document.createElement('div')
  container.id = 'pdf-export-hidden-container'
  container.style.position = 'fixed'
  container.style.left = '-10000px'
  container.style.top = '0'
  container.style.width = '800px'
  container.style.padding = '10px'
  container.style.background = 'white'
  container.innerHTML = html
  document.body.appendChild(container)
  return container
}

const useProxy = ref(true) // 默认使用服务端代理

const fetchHtml = async (targetUrl: string) => {
  if (useProxy.value) {
    // 使用服务端代理获取（推荐，解决跨域）
    try {
      const data = await $fetch('/api/fetch-html', {
        params: { url: targetUrl }
      }) as { success: boolean; html: string; url: string }
      
      if (!data.success || !data.html) {
        throw new Error('服务端获取页面失败')
      }
      
      const text = typeof data.html === 'string' ? data.html : JSON.stringify(data.html)
      // attempt to extract <body> content
      const bodyMatch = text.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
      return bodyMatch ? bodyMatch[1] : text
    } catch (error: any) {
      throw new Error(`服务端代理失败: ${error.data?.message || error.message || '未知错误'}`)
    }
  } else {
    // 直接获取（仅同源或允许 CORS 的页面）
    const res = await fetch(targetUrl, { mode: 'cors' })
    if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`)
    const text = await res.text()
    // attempt to extract <body> content
    const bodyMatch = text.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
    return bodyMatch ? bodyMatch[1] : text
  }
}

const exportPdf = async () => {
  if (!url.value) {
    message.value = '请输入要导出的页面链接'
    return
  }

  exporting.value = true
  message.value = ''

  try {
    const html = await fetchHtml(url.value)
    
    // 如果启用预览，先显示预览
    if (showPreview.value) {
      previewHtml.value = html ?? ''
      message.value = '内容已加载，请查看预览区域'
      exporting.value = false
      return
    }
    
    const container = createHiddenContainer(html ?? '')
    // wait for assets/styles to settle
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 500))

    if (mode.value === 'html2pdf') {
      // html2pdf handles everything including page breaks
      const html2pdf = (await import('html2pdf.js')).default
      const opt = {
        margin:       10,
        filename:     'export.pdf',
        image:        { type: 'jpeg' as const, quality: quality.value },
        html2canvas:  { scale: scale.value, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: orientation.value }
      }
      await html2pdf().set(opt as any).from(container).save()
      message.value = '导出完成（html2pdf）'
    } else if (mode.value === 'jspdf') {
      // use html2canvas + jsPDF
        // @ts-ignore - html2canvas may not have TS types in this project
        const html2canvasModule = await import('html2canvas')
  const html2canvas = (html2canvasModule as any).default || (html2canvasModule as any)
        // @ts-ignore - jspdf may not have TS types in this project
        const jsPDFModule = await import('jspdf')
  const jsPDF = (jsPDFModule as any).jsPDF || (jsPDFModule as any).default || jsPDFModule
  const canvas = await (html2canvas as any)(container, { scale: scale.value, useCORS: true })
      const imgData = canvas.toDataURL('image/jpeg', quality.value)
      const pdf = new jsPDF({ orientation: orientation.value, unit: 'mm', format: 'a4' })

      // calculate dimensions
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const imgProps = (pdf as any).getImageProperties(imgData)
      const imgWidth = pageWidth
      const imgHeight = (imgProps.height * pageWidth) / imgProps.width

      if (imgHeight <= pageHeight) {
        pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight)
      } else {
        // split into pages
        let remainingHeight = imgHeight
        let position = 0
        const lineHeight = (imgProps.height / (imgHeight)) * pageHeight
        while (remainingHeight > 0) {
          pdf.addImage(imgData, 'JPEG', 0, -position, imgWidth, imgHeight)
          remainingHeight -= pageHeight
          position += pageHeight
          if (remainingHeight > 0) pdf.addPage()
        }
      }

      pdf.save('export.pdf')
      message.value = '导出完成（jsPDF）'
    } else if (mode.value === 'playwright') {
      // Playwright 服务端导出（直接使用 URL，不需要容器）
      const response = await $fetch('/api/export-playwright', {
        method: 'POST',
        body: {
          url: url.value,
          options: {
            format: 'A4',
            printBackground: true,
            margin: { top: '20mm', right: '15mm', bottom: '25mm', left: '15mm' }
          }
        },
        responseType: 'blob'
      })
      
      // 下载 PDF
      const blob = new Blob([response as any], { type: 'application/pdf' })
      const downloadUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = 'export-playwright.pdf'
      a.click()
      URL.revokeObjectURL(downloadUrl)
      
      message.value = '导出完成（Playwright）'
      exporting.value = false
      return // Playwright 不需要隐藏容器
    } else if (mode.value === 'chromium') {
      // Chromium 服务端导出（Serverless 优化版本）
      const response = await $fetch('/api/export-chromium', {
        method: 'POST',
        body: {
          url: url.value,
          options: {
            format: 'A4',
            printBackground: true,
            margin: { top: '20mm', right: '15mm', bottom: '25mm', left: '15mm' }
          }
        },
        responseType: 'blob'
      })
      
      // 下载 PDF
      const blob = new Blob([response as any], { type: 'application/pdf' })
      const downloadUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = 'export-chromium.pdf'
      a.click()
      URL.revokeObjectURL(downloadUrl)
      
      message.value = '导出完成（Chromium - Serverless 优化）'
      exporting.value = false
      return // Chromium 不需要隐藏容器
    } else if (mode.value === 'pdfmake') {
      // pdfmake 结构化导出
      try {
        const pdfMake = await import('pdfmake/build/pdfmake')
        const pdfFonts = await import('pdfmake/build/vfs_fonts')
        ;(pdfMake as any).default.vfs = (pdfFonts as any).default.pdfMake.vfs
        
        // 简单转换 HTML 到 pdfmake 格式
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = html ?? ''
        const textContent = tempDiv.textContent || tempDiv.innerText || ''
        
        const docDefinition = {
          content: [
            { text: 'PDF 导出', style: 'header' },
            { text: textContent.substring(0, 5000), style: 'body' }
          ],
          styles: {
            header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] as [number, number, number, number] },
            body: { fontSize: 12, lineHeight: 1.5 }
          }
        }
        
        ;(pdfMake as any).default.createPdf(docDefinition).download('export-pdfmake.pdf')
        message.value = '导出完成（pdfmake）'
        exporting.value = false
        return // pdfmake 不需要隐藏容器
      } catch (err: any) {
        throw new Error(`pdfmake 导出失败: ${err.message}。请先安装: pnpm add pdfmake`)
      }
    }

    // cleanup
    const prev = document.getElementById('pdf-export-hidden-container')
    if (prev) prev.remove()
  } catch (err: any) {
    console.error(err)
    message.value = `导出失败：${err.message || err}`
  } finally {
    exporting.value = false
  }
}

// 确认导出预览的内容
const confirmExport = async () => {
  if (!previewHtml.value) return
  
  exporting.value = true
  message.value = ''

  try {
    const container = createHiddenContainer(previewHtml.value)
    // wait for assets/styles to settle
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 500))

    if (mode.value === 'html2pdf') {
      const html2pdf = (await import('html2pdf.js')).default
      const opt = {
        margin:       10,
        filename:     'export.pdf',
        image:        { type: 'jpeg' as const, quality: quality.value },
        html2canvas:  { scale: scale.value, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: orientation.value }
      }
      await html2pdf().set(opt as any).from(container).save()
      message.value = '导出完成（html2pdf）'
    } else if (mode.value === 'jspdf') {
      // @ts-ignore - html2canvas may not have TS types in this project
      const html2canvasModule = await import('html2canvas')
      const html2canvas = (html2canvasModule as any).default || (html2canvasModule as any)
      // @ts-ignore - jspdf may not have TS types in this project
      const jsPDFModule = await import('jspdf')
      const jsPDF = (jsPDFModule as any).jsPDF || (jsPDFModule as any).default || jsPDFModule
      const canvas = await (html2canvas as any)(container, { scale: scale.value, useCORS: true })
      const imgData = canvas.toDataURL('image/jpeg', quality.value)
      const pdf = new jsPDF({ orientation: orientation.value, unit: 'mm', format: 'a4' })

      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const imgProps = (pdf as any).getImageProperties(imgData)
      const imgWidth = pageWidth
      const imgHeight = (imgProps.height * pageWidth) / imgProps.width

      if (imgHeight <= pageHeight) {
        pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight)
      } else {
        let remainingHeight = imgHeight
        let position = 0
        while (remainingHeight > 0) {
          pdf.addImage(imgData, 'JPEG', 0, -position, imgWidth, imgHeight)
          remainingHeight -= pageHeight
          position += pageHeight
          if (remainingHeight > 0) pdf.addPage()
        }
      }

      pdf.save('export.pdf')
      message.value = '导出完成（jsPDF）'
    } else if (mode.value === 'playwright') {
      // Playwright 服务端导出
      const response = await $fetch('/api/export-playwright', {
        method: 'POST',
        body: {
          url: url.value,
          options: {
            format: 'A4',
            printBackground: true,
            margin: { top: '20mm', right: '15mm', bottom: '25mm', left: '15mm' }
          }
        },
        responseType: 'blob'
      })
      
      // 下载 PDF
      const blob = new Blob([response as any], { type: 'application/pdf' })
      const downloadUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = 'export-playwright.pdf'
      a.click()
      URL.revokeObjectURL(downloadUrl)
      
      message.value = '导出完成（Playwright）'
    } else if (mode.value === 'pdfmake') {
      // pdfmake 结构化导出
      try {
        const pdfMake = await import('pdfmake/build/pdfmake')
        const pdfFonts = await import('pdfmake/build/vfs_fonts')
        ;(pdfMake as any).default.vfs = (pdfFonts as any).default.pdfMake.vfs
        
        // 简单转换 HTML 到 pdfmake 格式（需要更复杂的解析器）
        const docDefinition = {
          content: [
            { text: '导出内容', style: 'header' },
            { text: previewHtml.value.substring(0, 1000), style: 'body' }
          ],
          styles: {
            header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] as [number, number, number, number] },
            body: { fontSize: 12 }
          }
        }
        
        ;(pdfMake as any).default.createPdf(docDefinition).download('export-pdfmake.pdf')
        message.value = '导出完成（pdfmake）'
      } catch (err: any) {
        throw new Error(`pdfmake 导出失败: ${err.message}。请先安装: pnpm add pdfmake`)
      }
    }

    // cleanup
    const prev = document.getElementById('pdf-export-hidden-container')
    if (prev) prev.remove()
    previewHtml.value = '' // 清除预览
  } catch (err: any) {
    console.error(err)
    message.value = `导出失败：${err.message || err}`
  } finally {
    exporting.value = false
  }
}
</script>

<template>
  <div class="p-6 max-w-3xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">在线页面导出为 PDF</h1>

    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium">页面链接（URL）</label>
        <input v-model="url" type="url" placeholder="https://example.com/page" class="input w-full" />
      </div>

      <div>
        <label class="block text-sm font-medium">输出方式</label>
        <select v-model="mode" class="input w-full">
          <option value="html2pdf">html2pdf (客户端，保留样式，图片模式)</option>
          <option value="jspdf">jsPDF (客户端，图片拆页)</option>
          <option value="playwright">Playwright (服务端，文字可选，需安装)</option>
          <option value="chromium">Chromium (服务端，Serverless 优化) 🚀</option>
          <option value="pdfmake">pdfmake (客户端，结构化文档)</option>
        </select>
        <div v-if="mode === 'playwright'" class="text-xs text-yellow-600 mt-1">
          ⚠️ 需要安装 playwright: <code class="bg-gray-100 px-1">pnpm add -D playwright</code>
        </div>
        <div v-if="mode === 'chromium'" class="text-xs text-green-600 mt-1">
          🚀 使用 @sparticuz/chromium，体积小（~50MB）、冷启动快，推荐生产环境！
        </div>
        <div v-if="mode === 'pdfmake'" class="text-xs text-yellow-600 mt-1">
          ⚠️ 需要安装 pdfmake: <code class="bg-gray-100 px-1">pnpm add pdfmake</code>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <input type="checkbox" id="useProxy" v-model="useProxy" class="w-4 h-4" />
        <label for="useProxy" class="text-sm">
          使用服务端代理（推荐，解决跨域问题）
        </label>
      </div>

      <div class="flex items-center gap-2">
        <input type="checkbox" id="showPreview" v-model="showPreview" class="w-4 h-4" />
        <label for="showPreview" class="text-sm">
          显示预览（不直接导出，先查看内容）
        </label>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-sm">缩放 (scale)</label>
          <input v-model.number="scale" type="number" min="1" max="4" step="0.5" class="input w-full" />
        </div>
        <div>
          <label class="block text-sm">图片质量 (0-1)</label>
          <input v-model.number="quality" type="number" min="0.1" max="1" step="0.01" class="input w-full" />
        </div>
      </div>

      <div>
        <label class="block text-sm">方向</label>
        <select v-model="orientation" class="input w-full">
          <option value="portrait">纵向</option>
          <option value="landscape">横向</option>
        </select>
      </div>

      <div class="flex items-center gap-3">
        <button @click="exportPdf" :disabled="exporting" class="btn-primary">
          {{ exporting ? '正在导出...' : '导出 PDF' }}
        </button>
        <div class="text-sm text-gray-600">
          {{ useProxy ? '通过服务端代理，支持任意 URL' : '仅支持同源或允许 CORS 的页面' }}
        </div>
      </div>

      <div v-if="message" class="mt-3 text-sm" :class="message.includes('失败') ? 'text-red-600' : 'text-green-600'">
        {{ message }}
      </div>

      <div v-if="previewHtml" class="mt-6">
        <div class="flex items-center justify-between mb-2">
          <h2 class="text-lg font-semibold">内容预览</h2>
          <button @click="previewHtml = ''" class="text-sm text-gray-600 hover:text-gray-900">
            关闭预览
          </button>
        </div>
        <div class="border border-gray-300 rounded p-4 max-h-96 overflow-auto bg-white">
          <div v-html="previewHtml"></div>
        </div>
        <div class="mt-3 flex gap-2">
          <button @click="confirmExport" :disabled="exporting" class="btn-primary">
            {{ exporting ? '正在导出...' : '确认导出此内容' }}
          </button>
          <button @click="previewHtml = ''" class="px-4 py-2 border border-gray-300 rounded">
            取消
          </button>
        </div>
      </div>

      <div class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded text-sm space-y-2">
        <div class="font-semibold">使用说明：</div>
        <ul class="list-disc list-inside space-y-1 text-xs">
          <li><strong>服务端代理（推荐）：</strong>通过 Nuxt 服务端获取页面内容，支持任意 URL，无跨域限制</li>
          <li><strong>客户端直连：</strong>仅适用于同源页面或明确允许 CORS 的目标站点</li>
          <li><strong>html2pdf 模式：</strong>客户端渲染，保留完整样式，以图片形式（文字不可选择）</li>
          <li><strong>jsPDF 模式：</strong>客户端渲染，将页面转为图片并智能拆分为多页</li>
          <li><strong>Playwright 模式：</strong>服务端渲染，文字可选择，样式完整（需要安装 playwright）</li>
          <li><strong>pdfmake 模式：</strong>客户端结构化文档，文字可选择（需要安装 pdfmake，适合纯文本）</li>
        </ul>
      </div>
      
      <div class="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded text-sm">
        <div class="font-semibold text-yellow-800 dark:text-yellow-300 mb-1">注意事项：</div>
        <ul class="list-disc list-inside space-y-1 text-xs text-yellow-700 dark:text-yellow-400">
          <li>导出大型页面或高 scale 值会消耗大量内存和时间</li>
          <li>某些动态加载的内容可能无法完整导出</li>
          <li>建议 scale 设置为 1-2，quality 设置为 0.8-0.98</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.input { padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem }
.btn-primary { background: #2563eb; color: white; padding: 0.5rem 1rem; border-radius: 0.375rem }
</style>
