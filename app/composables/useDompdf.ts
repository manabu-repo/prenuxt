/**
 * useDompdf - dompdf.js PDF导出封装
 * 
 * dompdf.js特点:
 * - 基于html2canvas + jsPDF改造，生成真正的PDF而非图片
 * - 支持文本选中、编辑、打印
 * - 文件体积小，质量高
 * - 支持中文字体（需导入字体文件）
 * - 支持foreignObjectRendering（复杂元素转图片）
 * 
 * @see https://github.com/lmn1919/dompdf.js
 */

export interface DompdfOptions {
  // 基础选项
  useCORS?: boolean // 是否允许跨域加载图片
  logging?: boolean // 是否启用日志
  
  // 字体配置（解决中文乱码）
  fontConfig?: {
    fontFamily?: string // 字体名称
    fontBase64?: string // base64格式的字体文件
    fontUrl?: string // 字体URL
    fontWeight?: string // 字体粗细
    fontStyle?: string // 字体样式
  }
  
  // PDF选项
  margin?: number | [number, number, number, number] // 边距 (mm)
  filename?: string // 文件名（仅在download时使用）
  
  // 分页配置 ✨ 关键：启用自动分页
  pagebreak?: {
    mode?: Array<'avoid-all' | 'css' | 'legacy'> | string // 分页模式
    before?: string | string[] // 在哪些选择器前分页
    after?: string | string[] // 在哪些选择器后分页
    avoid?: string | string[] // 避免在哪些元素内分页
  }
  
  // 页面选项
  jsPDF?: {
    unit?: 'pt' | 'px' | 'in' | 'mm' | 'cm' | 'ex' | 'em' | 'pc'
    format?: 'a4' | 'letter' | [number, number]
    orientation?: 'portrait' | 'landscape'
    compress?: boolean
  }
  
  // html2canvas选项
  html2canvas?: {
    scale?: number // 缩放比例
    backgroundColor?: string // 背景颜色
    width?: number
    height?: number
    scrollX?: number
    scrollY?: number
    windowWidth?: number
    windowHeight?: number
  }
}

/**
 * 加载思源黑体字体文件（简化版）
 * 实际项目中应从public目录加载完整字体文件
 */
function loadSourceHanSansFont(): Promise<string> {
  return new Promise((resolve) => {
    // 这里应该从服务器加载完整的字体文件
    // 示例: fetch('/fonts/SourceHanSansSC-Normal-Min-normal.js')
    // 由于字体文件较大，这里暂时返回空字符串
    // 使用时需要下载思源黑体并转换为base64格式
    console.warn('⚠️ 未加载中文字体，PDF中的中文可能显示为乱码。')
    console.info('💡 请从 https://github.com/lmn1919/dompdf.js/blob/main/examples/SourceHanSansSC-Normal-Min-normal.js 下载字体文件')
    resolve('')
  })
}

export function useDompdf() {
  const isExporting = ref(false)
  const progress = ref(0)
  const error = ref<Error | null>(null)

  /**
   * 导出元素为PDF
   * @param element - DOM元素或选择器
   * @param options - 导出选项
   * @returns Promise<Blob> - PDF Blob对象
   */
  async function exportToPdf(
    element: HTMLElement | string,
    options: DompdfOptions = {}
  ): Promise<{ success: boolean; blob?: Blob; error?: Error }> {
    isExporting.value = true
    progress.value = 0
    error.value = null

    try {
      // 动态导入 dompdf.js
      const dompdf = (await import('dompdf.js')).default
      progress.value = 20

      // 获取目标元素
      let targetElement: HTMLElement | null = null

      if (typeof element === 'string') {
        targetElement = document.querySelector(element) as HTMLElement
      } else if (element instanceof HTMLElement) {
        targetElement = element
      }

      if (!targetElement) {
        throw new Error('未找到目标元素')
      }

      progress.value = 30

      // 合并默认选项
      // 注意：dompdf.js v1.0.4 基于 html2canvas + jsPDF
      // 分页通过 jsPDF 的 html() 方法自动处理
      const defaultOptions: any = {
        margin: 10, // 边距 10mm
        filename: 'document.pdf',
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: {
          useCORS: true,
          logging: false,
          scale: 2,
          // 移除固定高度限制，允许自然分页
          windowHeight: 0
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait',
          compress: true
        }
      }

      const mergedOptions: any = {
        ...defaultOptions,
        ...options,
        html2canvas: {
          ...defaultOptions.html2canvas,
          ...options.html2canvas
        },
        jsPDF: {
          ...defaultOptions.jsPDF,
          ...options.jsPDF
        }
      }

      progress.value = 40

      // 如果配置了字体但未提供base64，尝试加载默认字体
      if (options.fontConfig?.fontFamily && !options.fontConfig?.fontBase64) {
        const fontBase64 = await loadSourceHanSansFont()
        if (fontBase64 && mergedOptions.fontConfig) {
          mergedOptions.fontConfig.fontBase64 = fontBase64
        }
      }

      progress.value = 50

      // 生成PDF blob
      // dompdf 会自动根据 jsPDF 配置进行分页
      const blob = await dompdf(targetElement, mergedOptions) as unknown as Blob
      progress.value = 90

      // 在新窗口打开PDF（与html2pdf保持一致）
      const blobUrl = URL.createObjectURL(blob)
      window.open(blobUrl, '_blank')
      
      progress.value = 100

      isExporting.value = false
      return { success: true, blob }
    } catch (err) {
      console.error('❌ dompdf导出失败:', err)
      error.value = err as Error
      isExporting.value = false
      progress.value = 0
      return { success: false, error: err as Error }
    }
  }

  /**
   * 导出Quill编辑器内容为PDF
   * @param editorContainer - Quill编辑器容器或选择器
   * @param options - 导出选项
   */
  async function exportQuillToPdf(
    editorContainer: HTMLElement | string,
    options: DompdfOptions = {}
  ): Promise<{ success: boolean; blob?: Blob; error?: Error }> {
    try {
      // 获取编辑器容器
      let container: HTMLElement | null = null

      if (typeof editorContainer === 'string') {
        container = document.querySelector(editorContainer) as HTMLElement
      } else if (editorContainer instanceof HTMLElement) {
        container = editorContainer
      }

      if (!container) {
        throw new Error('未找到Quill编辑器容器')
      }

      // 查找 .ql-editor 元素
      const editor = container.querySelector('.ql-editor') as HTMLElement

      if (!editor) {
        throw new Error('未找到Quill编辑器内容')
      }

      // 创建临时容器用于导出
      const tempContainer = document.createElement('div')
      tempContainer.style.position = 'absolute'
      tempContainer.style.left = '-9999px'
      tempContainer.style.top = '0'
      tempContainer.style.width = '210mm' // A4宽度
      tempContainer.style.padding = '20mm'
      tempContainer.style.backgroundColor = '#ffffff'
      tempContainer.style.fontFamily = options.fontConfig?.fontFamily || 'Arial, sans-serif'
      tempContainer.innerHTML = editor.innerHTML

      document.body.appendChild(tempContainer)

      // 导出PDF
      const result = await exportToPdf(tempContainer, options)

      // 清理临时容器
      document.body.removeChild(tempContainer)

      return result
    } catch (err) {
      console.error('❌ Quill内容导出失败:', err)
      return { success: false, error: err as Error }
    }
  }

  /**
   * 下载PDF文件
   * @param element - DOM元素或选择器
   * @param filename - 文件名
   * @param options - 导出选项
   */
  async function downloadPdf(
    element: HTMLElement | string,
    filename: string = 'document.pdf',
    options: DompdfOptions = {}
  ): Promise<{ success: boolean; error?: Error }> {
    const result = await exportToPdf(element, options)

    if (result.success && result.blob) {
      try {
        const url = URL.createObjectURL(result.blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        return { success: true }
      } catch (err) {
        console.error('❌ PDF下载失败:', err)
        return { success: false, error: err as Error }
      }
    }

    return { success: false, error: result.error }
  }

  /**
   * 导出Quill内容并下载
   */
  async function downloadQuillPdf(
    editorContainer: HTMLElement | string,
    filename: string = 'document.pdf',
    options: DompdfOptions = {}
  ): Promise<{ success: boolean; error?: Error }> {
    const result = await exportQuillToPdf(editorContainer, options)

    if (result.success && result.blob) {
      try {
        const url = URL.createObjectURL(result.blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        return { success: true }
      } catch (err) {
        console.error('❌ PDF下载失败:', err)
        return { success: false, error: err as Error }
      }
    }

    return { success: false, error: result.error }
  }

  return {
    // 状态
    isExporting: readonly(isExporting),
    progress: readonly(progress),
    error: readonly(error),

    // 方法
    exportToPdf,
    exportQuillToPdf,
    downloadPdf,
    downloadQuillPdf
  }
}
