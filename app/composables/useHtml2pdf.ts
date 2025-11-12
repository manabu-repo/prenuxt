/**
 * HTML to PDF Composable
 * 使用 html2pdf.js 将 HTML 转换为 PDF（图片模式，保留样式但文字不可选）
 */

export interface Html2pdfOptions {
  /**
   * 页边距 [上, 右, 下, 左]，单位: mm
   * @default [20, 15, 25, 15]
   */
  margin?: [number, number, number, number]
  
  /**
   * 是否显示页码
   * @default true
   */
  showPageNumbers?: boolean
  
  /**
   * 页码格式化函数
   * @default (current, total) => `Page ${current} / ${total}`
   */
  pageNumberFormat?: (current: number, total: number) => string
  
  /**
   * 图片质量 (0-1)
   * @default 0.95
   */
  quality?: number
  
  /**
   * 缩放比例
   * @default 1
   */
  scale?: number
  
  /**
   * 纸张格式
   * @default 'a4'
   */
  format?: string
  
  /**
   * 页面方向
   * @default 'portrait'
   */
  orientation?: 'portrait' | 'landscape'
}

export const useHtml2pdf = () => {
  const isExporting = ref(false)

  /**
   * 添加页码到 PDF
   * @param pdf - jsPDF 实例
   * @param margin - 页边距
   * @param pageNumberFormat - 页码格式化函数
   */
  const addPageNumbers = (
    pdf: any,
    margin: number[],
    pageNumberFormat: (current: number, total: number) => string
  ) => {
    const totalPages = pdf.internal.getNumberOfPages()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const pageWidth = pdf.internal.pageSize.getWidth()
    const [, , marginBottom] = margin

    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i)
      pdf.setFontSize(10)
      pdf.setTextColor(128)

      const pageText = pageNumberFormat(i, totalPages)
      const textWidth = pdf.getTextWidth(pageText)
      const x = (pageWidth - textWidth) / 2
      const y = pageHeight - (marginBottom ?? 25) + 8

      pdf.text(pageText, x, y)
    }
  }

  /**
   * 添加页面分隔安全边距类
   * @param element - 目标元素
   */
  const addPageBreakSafetyMargin = (element: HTMLElement) => {
    element.classList.add('pdf-export-content')
  }

  /**
   * 移除页面分隔安全边距类
   * @param element - 目标元素
   */
  const removePageBreakSafetyMargin = (element: HTMLElement) => {
    element.classList.remove('pdf-export-content')
  }

  /**
   * 导出 HTML 元素为 PDF（图片模式）
   * @param element - 要导出的 HTML 元素或选择器
   * @param options - 导出选项
   */
  const exportToPdf = async (
    element: HTMLElement | string,
    options: Html2pdfOptions = {}
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
        pageNumberFormat = (current: number, total: number) => `Page ${current} / ${total}`,
        quality = 0.95,
        scale = 1,
        format = 'a4',
        orientation = 'portrait'
      } = options

      // 添加 PDF 导出优化类
      addPageBreakSafetyMargin(targetElement)

      // 配置 html2pdf 选项
      const opt = {
        margin,
        filename: `document_${Date.now()}.pdf`,
        image: { type: 'jpeg' as const, quality },
        html2canvas: { 
          scale,
          useCORS: true,
          logging: false
        },
        jsPDF: { 
          unit: 'mm', 
          format, 
          orientation 
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      }

      // 生成 PDF
      const worker = html2pdf().set(opt).from(targetElement)
      const pdf = await worker.toPdf().get('pdf')

      // 添加页码
      if (showPageNumbers) {
        addPageNumbers(pdf, margin, pageNumberFormat)
      }

      // 在新窗口打开
      const pdfBlob = pdf.output('blob')
      const blobUrl = URL.createObjectURL(pdfBlob)
      window.open(blobUrl, '_blank')

      // 移除 PDF 导出优化类
      removePageBreakSafetyMargin(targetElement)

      return { success: true }
    } catch (error) {
      console.error('HTML2PDF 导出失败:', error)
      return { success: false, error }
    } finally {
      isExporting.value = false
    }
  }

  /**
   * 导出 Quill 编辑器为 PDF（图片模式）
   * @param editorContainer - 编辑器容器元素或选择器
   * @param options - 导出选项
   */
  const exportQuillToPdf = async (
    editorContainer: HTMLElement | string,
    options: Html2pdfOptions = {}
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
    exportQuillToPdf,
    addPageBreakSafetyMargin,
    removePageBreakSafetyMargin
  }
}
