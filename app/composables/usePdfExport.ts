/**
 * PDF Export Composable
 * 统一的 PDF 导出接口，支持 html2pdf、jsPDF、Playwright、pdfmake、dompdf 和 chromium 六种导出方式
 */

export type PdfExportMode = 'html2pdf' | 'jspdf' | 'playwright' | 'pdfmake' | 'dompdf' | 'chromium'

export interface PdfExportOptions {
  /**
   * 导出模式
   * - 'html2pdf': 图片模式，保留完整样式但文字不可选（客户端）
   * - 'jspdf': 文本模式，文字可选但样式简单（客户端）
   * - 'playwright': 服务端渲染，文字可选且样式完整（推荐，需要服务端）
   * - 'pdfmake': 结构化文档，文字可选且无截断问题（客户端）
   * - 'dompdf': 真正的PDF，文字可编辑打印，质量高体积小（客户端，仅单页）✨
   * - 'chromium': Serverless优化，体积小冷启动快（推荐生产环境，需要服务端）🚀
   * @default 'html2pdf'
   */
  mode?: PdfExportMode
  
  /**
   * 页边距 [上, 右, 下, 左]，单位: mm
   * @default [20, 15, 25, 15]
   */
  margin?: [number, number, number, number]
  
  /**
   * 页码格式化函数（仅 Playwright 和 pdfmake 模式有效）
   * 注意：Playwright 模式默认显示页码，无法关闭
   * @default (current, total) => `页码 ${current} / 共 ${total} 页`
   */
  pageNumberFormat?: string | ((current: number, total: number) => string)
  
  /**
   * 图片质量 (0-1) - 仅 html2pdf 模式
   * @default 0.95
   */
  quality?: number
  
  /**
   * 缩放比例 - 仅 html2pdf 模式
   * @default 1
   */
  scale?: number

  /**
   * 字体大小 - 仅 jspdf 模式
   * @default 12
   */
  fontSize?: number
  
  /**
   * 行高（mm）- 仅 jspdf 模式
   * @default 7
   */
  lineHeight?: number
  
  /**
   * 段落间距（mm）- 仅 jspdf 模式
   * @default 3
   */
  paragraphSpacing?: number

  /**
   * 是否打印背景色和图片 - 仅 playwright 模式
   * @default true
   */
  printBackground?: boolean

  /**
   * 是否显示页眉页脚 - 仅 playwright 模式
   * @default false
   */
  displayHeaderFooter?: boolean

  /**
   * 自定义 CSS - 仅 playwright 模式
   */
  customCss?: string
  
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

export const usePdfExport = () => {
  // 导入底层 hooks
  const html2pdfComposable = useHtml2pdf()
  const jspdfComposable = useJspdf()
  const playwrightComposable = usePlaywright()
  const pdfmakeComposable = usePdfmake()
  const dompdfComposable = useDompdf()
  const chromiumComposable = useChromium()

  // 合并六个 composable 的 isExporting 状态
  const isExporting = computed(() => 
    html2pdfComposable.isExporting.value || 
    jspdfComposable.isExporting.value ||
    playwrightComposable.isExporting.value ||
    pdfmakeComposable.isExporting.value ||
    dompdfComposable.isExporting.value ||
    chromiumComposable.loading.value
  )

  /**
   * 导出 HTML 元素为 PDF
   * @param element - 要导出的 HTML 元素或选择器
   * @param options - 导出选项
   */
  const exportToPdf = async (
    element: HTMLElement | string,
    options: PdfExportOptions = {}
  ) => {
    const { mode = 'html2pdf', ...restOptions } = options

    if (mode === 'chromium') {
      // Chromium 模式：Serverless 优化，体积小冷启动快
      const el = typeof element === 'string' ? document.querySelector(element) : element
      if (!el) throw new Error('Element not found')
      
      const html = el instanceof HTMLElement ? el.innerHTML : ''
      const blob = await chromiumComposable.exportToPdf(html, {
        margin: restOptions.margin ? {
          top: `${restOptions.margin[0]}mm`,
          right: `${restOptions.margin[1]}mm`,
          bottom: `${restOptions.margin[2]}mm`,
          left: `${restOptions.margin[3]}mm`
        } : undefined,
        format: (restOptions.format?.toUpperCase() as any) || 'A4',
        printBackground: restOptions.printBackground,
        displayHeaderFooter: restOptions.displayHeaderFooter,
        landscape: restOptions.orientation === 'landscape',
        scale: restOptions.scale
      })
      
      // 自动下载
      chromiumComposable.downloadPdf(blob, 'export.pdf')
      return blob
    } else if (mode === 'dompdf') {
      // dompdf 模式：真正的PDF，可编辑打印
      return await dompdfComposable.exportToPdf(element, {
        useCORS: true,
        logging: false
      })
    } else if (mode === 'pdfmake') {
      // pdfmake 模式：结构化文档
      return await pdfmakeComposable.exportToPdf(element, {
        pageMargins: restOptions.margin ? [
          restOptions.margin[3] * 2.83, // 左 (mm to pt)
          restOptions.margin[0] * 2.83, // 上
          restOptions.margin[1] * 2.83, // 右
          restOptions.margin[2] * 2.83  // 下
        ] as [number, number, number, number] : undefined,
        pageSize: restOptions.format?.toUpperCase() as any,
        pageOrientation: restOptions.orientation,
        showPageNumbers: true,
        pageNumberFormat: typeof restOptions.pageNumberFormat === 'function' ? restOptions.pageNumberFormat : undefined
      })
    } else if (mode === 'playwright') {
      // Playwright 模式：服务端渲染，默认启用页码
      return await playwrightComposable.exportToPdf(element, {
        margin: restOptions.margin ? {
          top: `${restOptions.margin[0]}mm`,
          right: `${restOptions.margin[1]}mm`,
          bottom: `${restOptions.margin[2]}mm`,
          left: `${restOptions.margin[3]}mm`
        } : undefined,
        format: (restOptions.format?.toUpperCase() as any) || 'A4',
        printBackground: restOptions.printBackground,
        displayHeaderFooter: restOptions.displayHeaderFooter,
        pageNumberFormat: restOptions.pageNumberFormat,
        customCss: restOptions.customCss
      })
    } else if (mode === 'jspdf') {
      // jsPDF 模式：文本模式
      return await jspdfComposable.exportTextPdf(element, {
        ...restOptions,
        pageNumberFormat: typeof restOptions.pageNumberFormat === 'function' ? restOptions.pageNumberFormat : undefined
      })
    } else {
      // html2pdf 模式：图片模式
      return await html2pdfComposable.exportToPdf(element, {
        ...restOptions,
        pageNumberFormat: typeof restOptions.pageNumberFormat === 'function' ? restOptions.pageNumberFormat : undefined
      })
    }
  }

  /**
   * 导出 Quill 编辑器为 PDF
   * @param editorContainer - 编辑器容器元素或选择器
   * @param options - 导出选项
   */
  const exportQuillToPdf = async (
    editorContainer: HTMLElement | string,
    options: PdfExportOptions = {}
  ) => {
    const { mode = 'html2pdf', ...restOptions } = options

    if (mode === 'chromium') {
      // Chromium 模式
      const el = typeof editorContainer === 'string' ? document.querySelector(editorContainer) : editorContainer
      if (!el) throw new Error('Element not found')
      
      const quillEditor = el.querySelector('.ql-editor')
      const html = quillEditor?.innerHTML || ''
      
      const blob = await chromiumComposable.exportQuillToPdf(html, {
        margin: restOptions.margin ? {
          top: `${restOptions.margin[0]}mm`,
          right: `${restOptions.margin[1]}mm`,
          bottom: `${restOptions.margin[2]}mm`,
          left: `${restOptions.margin[3]}mm`
        } : undefined,
        format: (restOptions.format?.toUpperCase() as any) || 'A4',
        printBackground: restOptions.printBackground,
        displayHeaderFooter: restOptions.displayHeaderFooter,
        landscape: restOptions.orientation === 'landscape',
        scale: restOptions.scale
      })
      
      chromiumComposable.downloadPdf(blob, 'quill-export.pdf')
      return blob
    } else if (mode === 'dompdf') {
      return await dompdfComposable.exportQuillToPdf(editorContainer, {
        useCORS: true,
        logging: false
      })
    } else if (mode === 'pdfmake') {
      return await pdfmakeComposable.exportQuillToPdf(editorContainer, {
        pageMargins: restOptions.margin ? [
          restOptions.margin[3] * 2.83,
          restOptions.margin[0] * 2.83,
          restOptions.margin[1] * 2.83,
          restOptions.margin[2] * 2.83
        ] as [number, number, number, number] : undefined,
        pageSize: restOptions.format?.toUpperCase() as any,
        pageOrientation: restOptions.orientation,
        showPageNumbers: true,
        pageNumberFormat: typeof restOptions.pageNumberFormat === 'function' ? restOptions.pageNumberFormat : undefined
      })
    } else if (mode === 'playwright') {
      return await playwrightComposable.exportQuillToPdf(editorContainer, {
        margin: restOptions.margin ? {
          top: `${restOptions.margin[0]}mm`,
          right: `${restOptions.margin[1]}mm`,
          bottom: `${restOptions.margin[2]}mm`,
          left: `${restOptions.margin[3]}mm`
        } : undefined,
        format: (restOptions.format?.toUpperCase() as any) || 'A4',
        printBackground: restOptions.printBackground,
        displayHeaderFooter: restOptions.displayHeaderFooter,
        pageNumberFormat: restOptions.pageNumberFormat,
        customCss: restOptions.customCss
      })
    } else if (mode === 'jspdf') {
      return await jspdfComposable.exportQuillTextPdf(editorContainer, {
        ...restOptions,
        pageNumberFormat: typeof restOptions.pageNumberFormat === 'function' ? restOptions.pageNumberFormat : undefined
      })
    } else {
      return await html2pdfComposable.exportQuillToPdf(editorContainer, {
        ...restOptions,
        pageNumberFormat: typeof restOptions.pageNumberFormat === 'function' ? restOptions.pageNumberFormat : undefined
      })
    }
  }

  /**
   * 添加页面分隔安全边距类（仅 html2pdf 模式）
   * @param element - 目标元素
   */
  const addPageBreakSafetyMargin = (element: HTMLElement) => {
    html2pdfComposable.addPageBreakSafetyMargin(element)
  }

  /**
   * 移除页面分隔安全边距类（仅 html2pdf 模式）
   * @param element - 目标元素
   */
  const removePageBreakSafetyMargin = (element: HTMLElement) => {
    html2pdfComposable.removePageBreakSafetyMargin(element)
  }

  // 兼容旧接口：直接导出五种模式的函数
  const exportHtml2pdf = html2pdfComposable.exportToPdf
  const exportQuillHtml2pdf = html2pdfComposable.exportQuillToPdf
  const exportJspdf = jspdfComposable.exportTextPdf
  const exportQuillJspdf = jspdfComposable.exportQuillTextPdf
  const exportPlaywright = playwrightComposable.exportToPdf
  const exportQuillPlaywright = playwrightComposable.exportQuillToPdf
  const exportPdfmake = pdfmakeComposable.exportToPdf
  const exportQuillPdfmake = pdfmakeComposable.exportQuillToPdf
  const exportDompdf = dompdfComposable.exportToPdf
  const exportQuillDompdf = dompdfComposable.exportQuillToPdf

  return {
    // 状态
    isExporting: readonly(isExporting),
    
    // 统一接口（推荐使用）
    exportToPdf,
    exportQuillToPdf,
    
    // 直接访问底层函数（可选）
    exportHtml2pdf,
    exportQuillHtml2pdf,
    exportJspdf,
    exportQuillJspdf,
    exportPlaywright,
    exportQuillPlaywright,
    exportPdfmake,
    exportQuillPdfmake,
    exportDompdf,
    exportQuillDompdf,
    
    // 工具函数
    addPageBreakSafetyMargin,
    removePageBreakSafetyMargin
  }
}
