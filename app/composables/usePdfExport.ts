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
   * 分页检测并在末尾添加安全间距，避免文字被截断
   * @param containerSelector - 容器选择器（默认为 Quill 编辑器容器）
   * @param options - 配置选项
   */
  const addPageBreakSafetyMargin = (
    containerSelector = '.ql-container',
    options: { 
      pageHeight?: number
      safetyMargin?: number
      scale?: number
      elementSelector?: string
    } = {}
  ) => {
    if (!process.client) return

    const {
      pageHeight = 297, // A4 高度（mm）
      safetyMargin = 40, // 安全间距（px）
      scale = 2, // 缩放比例，与 PDF 导出配置一致
      elementSelector // 自定义元素选择器
    } = options

    // 计算 A4 高度（考虑缩放）
    // 297mm = 1122.52px (96dpi)，但需要考虑 html2canvas 的 scale
    const A4_HEIGHT_PX = (pageHeight * 96 / 25.4) * scale
    const MARGIN_CLASS = 'pdf-page-break-margin'

    // 移除之前添加的安全间距节点
    document.querySelectorAll(`.${MARGIN_CLASS}`).forEach(el => el.remove())

    const containers = document.querySelectorAll<HTMLElement>(containerSelector)
    if (containers.length === 0) {
      console.warn(`未找到容器: ${containerSelector}`)
      return
    }

    containers.forEach((container) => {
      // 获取容器的滚动位置
      const scrollTop = container.scrollTop || 0
      
      // 确定要处理的元素
      let targetContainer: HTMLElement = container
      
      // 如果容器是 .ql-container，尝试找到 .ql-editor
      if (container.classList.contains('ql-container') || container.querySelector('.ql-editor')) {
        const editor = container.querySelector('.ql-editor') as HTMLElement
        if (editor) {
          targetContainer = editor
        }
      }
      
      // 获取所有可能导致分页的元素
      const defaultSelector = 'p, h1, h2, h3, h4, h5, h6, ul, ol, div, blockquote, pre, table, img'
      const selector = elementSelector || `${targetContainer === container ? '' : ''}${defaultSelector}`
      
      // 获取直接子元素或所有匹配元素
      const elements = targetContainer.querySelectorAll<HTMLElement>(
        targetContainer === container 
          ? `:scope > ${defaultSelector}` // 如果是普通容器，只获取直接子元素
          : defaultSelector // 如果是 ql-editor，获取所有匹配元素
      )

      // 使用数组避免在遍历时修改 DOM 导致的问题
      const elementsToProcess: Array<{ element: HTMLElement; spacerHeight: number }> = []

      elements.forEach((element) => {
        // 跳过已添加的间距元素
        if (element.classList.contains(MARGIN_CLASS)) return

        const rect = element.getBoundingClientRect()
        const containerRect = container.getBoundingClientRect()

        // 计算元素相对于容器顶部的绝对位置（包含滚动）
        const elementTop = rect.top - containerRect.top + scrollTop
        const elementBottom = elementTop + rect.height
        const elementHeight = rect.height

        // 计算当前元素所在的页码
        const currentPage = Math.floor(elementTop / A4_HEIGHT_PX)
        const nextPageStart = (currentPage + 1) * A4_HEIGHT_PX

        // 计算元素距离当前页底部的距离
        const distanceToPageEnd = nextPageStart - elementTop

        // 检查元素是否会跨页
        const willCrossPage = elementBottom > nextPageStart

        // 如果元素会跨页且距离页底部较近（小于安全间距或元素高度）
        if (willCrossPage && distanceToPageEnd > 0 && distanceToPageEnd < Math.max(safetyMargin, elementHeight * 0.3)) {
          // 计算需要添加的间距，使元素完全推到下一页
          const spacerHeight = Math.ceil(distanceToPageEnd)
          elementsToProcess.push({ element, spacerHeight })
        }
      })

      // 批量插入间距元素（从后往前，避免位置计算错误）
      elementsToProcess.reverse().forEach(({ element, spacerHeight }) => {
        const spacer = document.createElement('div')
        spacer.className = MARGIN_CLASS
        spacer.style.height = `${spacerHeight}px`
        spacer.style.pageBreakAfter = 'always'
        spacer.style.breakAfter = 'page'
        spacer.style.visibility = 'hidden' // 隐藏但占据空间
        spacer.setAttribute('data-spacer-height', String(spacerHeight))

        // 在元素前插入间距，将元素推到下一页
        element.parentNode?.insertBefore(spacer, element)
      })
    })

    return {
      processed: containers.length,
      message: `已处理 ${containers.length} 个容器的分页安全间距`
    }
  }

  /**
   * 移除添加的分页安全间距
   */
  const removePageBreakSafetyMargin = () => {
    if (!process.client) return

    const MARGIN_CLASS = 'pdf-page-break-margin'
    const spacers = document.querySelectorAll(`.${MARGIN_CLASS}`)
    spacers.forEach(el => el.remove())

    return {
      removed: spacers.length,
      message: `已移除 ${spacers.length} 个分页安全间距`
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
    exportQuillToPdf,
    addPageBreakSafetyMargin,
    removePageBreakSafetyMargin
  }
}
