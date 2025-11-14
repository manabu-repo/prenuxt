/**
 * Chromium PDF Export Composable (Optimized for Serverless)
 * 使用 @sparticuz/chromium 的客户端封装
 * 
 * 优势：
 * - 更小的二进制体积（~50MB vs ~300MB）
 * - 更快的冷启动时间
 * - 专为 Serverless 环境优化
 * - 更低的内存占用
 * 
 * 适用场景：
 * - 生产环境部署到 AWS Lambda、Vercel、Netlify 等 Serverless 平台
 * - 需要快速冷启动的场景
 * - 对部署包大小有限制的环境
 * - 高并发 PDF 生成
 */

/**
 * Chromium PDF 导出选项
 */
export interface ChromiumPdfOptions {
  /** PDF 页面格式，默认 'A4' */
  format?: 'A4' | 'A3' | 'Letter' | 'Legal' | 'Tabloid'
  /** 是否打印背景图形，默认 true */
  printBackground?: boolean
  /** 页面边距 */
  margin?: {
    top?: string
    right?: string
    bottom?: string
    left?: string
  }
  /** 是否显示页眉页脚，默认 false */
  displayHeaderFooter?: boolean
  /** 页眉 HTML 模板 */
  headerTemplate?: string
  /** 页脚 HTML 模板 */
  footerTemplate?: string
  /** 是否优先使用 CSS 定义的页面尺寸，默认 false */
  preferCSSPageSize?: boolean
  /** 是否横向打印，默认 false */
  landscape?: boolean
  /** 缩放比例，默认 1 */
  scale?: number
  /** 打印页码范围，例如 '1-5, 8, 11-13' */
  pageRanges?: string
}

/**
 * Chromium PDF 导出 Composable
 */
export function useChromium() {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const previewUrl = ref<string | null>(null)

  /**
   * 将 HTML 内容导出为 PDF
   * @param html - HTML 内容字符串
   * @param options - PDF 导出选项
   * @returns PDF Blob 对象
   */
  async function exportToPdf(html: string, options: ChromiumPdfOptions = {}): Promise<Blob> {
    loading.value = true
    error.value = null

    try {
      // 创建临时 HTML 页面
      const fullHtml = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PDF Export</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.6;
      padding: 20px;
    }
    /* PDF 打印优化 */
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      @page {
        margin: 0;
      }
    }
  </style>
</head>
<body>
  ${html}
</body>
</html>
      `.trim()

      // 创建 data URL
      const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(fullHtml)}`

      // 调用服务器端 API
      const response = await $fetch('/api/export-chromium', {
        method: 'POST',
        body: {
          url: dataUrl,
          options
        },
        responseType: 'blob'
      })

      // 将响应转换为 Blob
      const blob = response instanceof Blob ? response : new Blob([response as any], { type: 'application/pdf' })

      // 创建预览 URL
      if (previewUrl.value) {
        URL.revokeObjectURL(previewUrl.value)
      }
      previewUrl.value = URL.createObjectURL(blob)

      return blob
    } catch (err: any) {
      const errorMessage = err?.data?.message || err?.message || 'PDF 导出失败'
      error.value = errorMessage
      console.error('Chromium PDF export error:', err)
      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  /**
   * 将 Quill 编辑器内容导出为 PDF
   * @param quillHtml - Quill 编辑器的 HTML 内容
   * @param options - PDF 导出选项
   * @returns PDF Blob 对象
   */
  async function exportQuillToPdf(quillHtml: string, options: ChromiumPdfOptions = {}): Promise<Blob> {
    // 添加 Quill 样式
    const styledHtml = `
<div class="ql-container ql-snow">
  <div class="ql-editor">
    ${quillHtml}
  </div>
</div>
    `.trim()

    return exportToPdf(styledHtml, options)
  }

  /**
   * 下载 PDF 文件
   * @param blob - PDF Blob 对象
   * @param filename - 文件名，默认 'export.pdf'
   */
  function downloadPdf(blob: Blob, filename: string = 'export.pdf') {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  /**
   * 在新标签页中预览 PDF
   * @param blob - PDF Blob 对象
   */
  function previewPdf(blob: Blob) {
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
    // 注意：URL 会在一段时间后失效，但由于已经在新标签页打开，通常不会有问题
  }

  /**
   * 清理资源
   */
  function cleanup() {
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value)
      previewUrl.value = null
    }
    error.value = null
  }

  // 组件卸载时清理
  onUnmounted(() => {
    cleanup()
  })

  return {
    // 状态
    loading: readonly(loading),
    error: readonly(error),
    previewUrl: readonly(previewUrl),

    // 方法
    exportToPdf,
    exportQuillToPdf,
    downloadPdf,
    previewPdf,
    cleanup
  }
}

/**
 * 性能对比（vs Playwright）：
 * 
 * @sparticuz/chromium:
 * - 二进制大小：~50MB (Brotli 压缩)
 * - 解压时间：~0.6-0.7 秒
 * - 内存占用：~150-200MB
 * - 冷启动时间：~2-3 秒
 * - 适用场景：Serverless、Lambda、高并发
 * 
 * Playwright:
 * - 二进制大小：~300MB
 * - 启动时间：~1 秒
 * - 内存占用：~250-300MB
 * - 冷启动时间：~3-4 秒
 * - 适用场景：完整功能、自动化测试、本地开发
 * 
 * 推荐使用场景：
 * - 生产环境部署：推荐使用 @sparticuz/chromium（更小、更快）
 * - 本地开发测试：可以使用 Playwright（功能更全）
 * - 需要特殊浏览器功能：使用 Playwright
 * - 部署到 Serverless 平台：必须使用 @sparticuz/chromium
 */
