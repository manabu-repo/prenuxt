/**
 * jsPDF Composable
 * 使用 jsPDF 将文本内容转换为 PDF（文本模式，文字可选但样式简单）
 */

export interface JspdfOptions {
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
   * 字体大小
   * @default 12
   */
  fontSize?: number
  
  /**
   * 行高（mm）
   * @default 7
   */
  lineHeight?: number
  
  /**
   * 段落间距（mm）
   * @default 3
   */
  paragraphSpacing?: number
  
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

export const useJspdf = () => {
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
   * 导出文本为 PDF（文本模式）
   * @param element - 要导出的 HTML 元素或选择器
   * @param options - 导出选项
   */
  const exportTextPdf = async (
    element: HTMLElement | string,
    options: JspdfOptions = {}
  ) => {
    if (!process.client) return

    isExporting.value = true

    try {
      // 动态导入 jsPDF
      const { jsPDF } = await import('jspdf')

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
        fontSize = 12,
        lineHeight = 7,
        paragraphSpacing = 3,
        format = 'a4',
        orientation = 'portrait'
      } = options

      // 创建 PDF 实例
      const pdf = new jsPDF({
        orientation: orientation === 'landscape' ? 'landscape' : 'portrait',
        unit: 'mm',
        format
      })

      // 提取纯文本内容
      const textContent = targetElement.innerText || targetElement.textContent || ''
      
      // 计算页面尺寸
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const [marginTop, marginRight, marginBottom, marginLeft] = margin
      
      // 内容区域宽度
      const contentWidth = pageWidth - (marginLeft ?? 15) - (marginRight ?? 15)
      
      // 设置字体
      pdf.setFontSize(fontSize)
      pdf.setTextColor(0, 0, 0)
      
      // 分段处理文本
      const paragraphs = textContent.split('\n').filter(p => p.trim().length > 0)
      let currentY = marginTop ?? 20
      
      paragraphs.forEach((paragraph) => {
        // 使用 splitTextToSize 自动换行
        const lines = pdf.splitTextToSize(paragraph, contentWidth)
        
        lines.forEach((line: string) => {
          // 检查是否需要新页面
          if (currentY + lineHeight > pageHeight - (marginBottom ?? 25)) {
            pdf.addPage()
            currentY = marginTop ?? 20
          }
          
          // 添加文本（文字可选中）
          pdf.text(line, marginLeft ?? 15, currentY)
          currentY += lineHeight
        })
        
        // 段落间距
        currentY += paragraphSpacing
      })

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
      console.error('jsPDF 导出失败:', error)
      return { success: false, error }
    } finally {
      isExporting.value = false
    }
  }

  /**
   * 导出 Quill 编辑器为 PDF（文本模式）
   * @param editorContainer - 编辑器容器元素或选择器
   * @param options - 导出选项
   */
  const exportQuillTextPdf = async (
    editorContainer: HTMLElement | string,
    options: JspdfOptions = {}
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

      return await exportTextPdf(editorContent, options)
    } catch (error) {
      console.error('导出 Quill 文本 PDF 失败:', error)
      return { success: false, error }
    }
  }

  return {
    isExporting: readonly(isExporting),
    exportTextPdf,
    exportQuillTextPdf
  }
}
