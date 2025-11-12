/**
 * PDF Export Composable
 * 统一的 PDF 导出接口，支持 html2pdf 和 jsPDF 两种导出方式
 */

export type PdfExportMode = 'html2pdf' | 'jspdf'

export interface PdfExportOptions {
  /**
   * 导出模式
   * - 'html2pdf': 图片模式，保留完整样式但文字不可选
   * - 'jspdf': 文本模式，文字可选但样式简单
   * @default 'html2pdf'
   */
  mode?: PdfExportMode
  
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

  // 合并两个 composable 的 isExporting 状态
  const isExporting = computed(() => 
    html2pdfComposable.isExporting.value || jspdfComposable.isExporting.value
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

    if (mode === 'jspdf') {
      return await jspdfComposable.exportTextPdf(element, restOptions)
    } else {
      return await html2pdfComposable.exportToPdf(element, restOptions)
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

    if (mode === 'jspdf') {
      return await jspdfComposable.exportQuillTextPdf(editorContainer, restOptions)
    } else {
      return await html2pdfComposable.exportQuillToPdf(editorContainer, restOptions)
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

  // 兼容旧接口：直接导出两种模式的函数
  const exportHtml2pdf = html2pdfComposable.exportToPdf
  const exportQuillHtml2pdf = html2pdfComposable.exportQuillToPdf
  const exportJspdf = jspdfComposable.exportTextPdf
  const exportQuillJspdf = jspdfComposable.exportQuillTextPdf

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
    
    // 工具函数
    addPageBreakSafetyMargin,
    removePageBreakSafetyMargin
  }
}
