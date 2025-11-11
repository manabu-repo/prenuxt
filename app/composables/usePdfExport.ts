export interface PdfExportOptions {
  margin?: [number, number, number, number]
  showPageNumbers?: boolean
  pageNumberFormat?: (current: number, total: number) => string
  quality?: number
  scale?: number
  format?: 'a4' | 'letter' | 'legal'
  orientation?: 'portrait' | 'landscape'
}

export function usePdfExport() {
  const isExporting = ref(false)

  /**
   * 为 PDF 添加页码
   * @param pdf - jsPDF 实例
   * @param margin - 页面边距
   * @param pageNumberFormat - 页码格式化函数
   */
  const addPageNumbers = (
    pdf: any,
    margin: [number, number, number, number],
    pageNumberFormat: (current: number, total: number) => string
  ) => {
    const totalPages = pdf.internal.getNumberOfPages()
    const bottomMargin = margin[2]

    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i)
      const fontSize = 10
      pdf.setFontSize(fontSize)
      pdf.setTextColor(128, 128, 128)

      const pageText = pageNumberFormat(i, totalPages)
      const textWidth = pdf.getTextWidth(pageText)
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()

      // 将页码放置在距离底部 8mm 的位置（确保有足够空间）
      const pageNumberY = pageHeight - 8

      // 居中显示页码
      pdf.text(pageText, (pageWidth - textWidth) / 2, pageNumberY)
    }
  }

  /**
   * 导出 HTML 元素为 PDF
   * @param element - 要导出的 HTML 元素或选择器
   * @param options - 导出选项
   */
  const exportToPdf = async (
    element: HTMLElement | string,
    options: PdfExportOptions = {}
  ) => {
    if (!process.client) return

    isExporting.value = true

    try {
      // 动态导入 html2pdf.js
      const html2pdf = (await import('html2pdf.js')).default

      // 获取目标元素
      let targetElement: HTMLElement | null = null

      if (typeof element === 'string') {
        targetElement = document.querySelector(element) as HTMLElement
      } else {
        targetElement = element
      }

      if (!targetElement) {
        throw new Error('无法找到目标元素')
      }

      // 合并默认配置
      const {
        margin = [20, 15, 25, 15],
        showPageNumbers = true,
        pageNumberFormat = (current: number, total: number) => `${current} / ${total}`,
        quality = 0.98,
        scale = 2,
        format = 'a4',
        orientation = 'portrait'
      } = options

      // 克隆元素以避免修改原始内容
      const clonedElement = targetElement.cloneNode(true) as HTMLElement

      // 添加 PDF 导出样式类（样式在 pdf-export.css 中定义）
      clonedElement.classList.add('pdf-export-content')

      // 配置 PDF 选项
      const pdfOptions = {
        margin: margin as [number, number, number, number],
        image: { type: 'jpeg' as const, quality },
        html2canvas: {
          scale,
          useCORS: true,
          letterRendering: true
        },
        jsPDF: {
          unit: 'mm',
          format,
          orientation: orientation === 'landscape' ? ('landscape' as const) : ('portrait' as const)
        },
        pagebreak: {
          mode: ['avoid-all', 'css', 'legacy'],
          before: '.page-break-before',
          after: '.page-break-after',
          avoid: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'tr', 'td', 'th', 'img', 'table', 'pre', 'blockquote']
        }
      }

      // 生成 PDF
      const worker = html2pdf().set(pdfOptions).from(clonedElement)
      const pdf = await worker.toPdf().get('pdf')

      // 添加页码
      if (showPageNumbers) {
        addPageNumbers(pdf, margin, pageNumberFormat)
      }

      // 在新窗口打开
      const pdfBlob = pdf.output('blob')
      const blobUrl = URL.createObjectURL(pdfBlob)
      window.open(blobUrl, '_blank')

      return { success: true }
    } catch (error) {
      console.error('导出 PDF 失败:', error)
      return { success: false, error }
    } finally {
      isExporting.value = false
    }
  }

  /**
   * 导出 Quill 编辑器内容为 PDF
   * @param editorContainer - 编辑器容器元素或选择器
   * @param options - 导出选项
   */
  const exportQuillToPdf = async (
    editorContainer: HTMLElement | string,
    options: PdfExportOptions = {}
  ) => {
    if (!process.client) return

    try {
      // 获取容器元素
      let container: HTMLElement | null = null

      if (typeof editorContainer === 'string') {
        container = document.querySelector(editorContainer) as HTMLElement
      } else {
        container = editorContainer
      }

      if (!container) {
        throw new Error('无法找到编辑器容器')
      }

      // 获取 Quill 编辑器内容区域
      const editorContent = container.querySelector('.ql-editor') as HTMLElement

      if (!editorContent) {
        throw new Error('无法找到编辑器内容')
      }

      return await exportToPdf(editorContent, options)
    } catch (error) {
      console.error('导出 Quill 编辑器失败:', error)
      return { success: false, error }
    }
  }

  return {
    isExporting: readonly(isExporting),
    exportToPdf,
    exportQuillToPdf
  }
}
