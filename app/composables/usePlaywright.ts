/**
 * Playwright PDF Export Composable
 * 使用 Playwright 服务端渲染生成 PDF（文字可选 + 样式完整）
 */

export interface PlaywrightPdfOptions {
  /**
   * 页边距
   * @default { top: '20mm', right: '15mm', bottom: '25mm', left: '15mm' }
   */
  margin?: {
    top?: string
    right?: string
    bottom?: string
    left?: string
  }
  
  /**
   * 纸张格式
   * @default 'A4'
   */
  format?: 'A4' | 'A3' | 'A5' | 'Letter' | 'Legal' | 'Tabloid'
  
  /**
   * 是否打印背景色和图片
   * @default true
   */
  printBackground?: boolean
  
  /**
   * 是否显示页眉页脚
   * @default false
   */
  displayHeaderFooter?: boolean
  
  /**
   * 页眉 HTML 模板
   */
  headerTemplate?: string
  
  /**
   * 页脚 HTML 模板
   */
  footerTemplate?: string
  
  /**
   * 页码格式化函数（默认启用页码）
   * @default (current, total) => `页码 ${current} / 共 ${total} 页`
   */
  pageNumberFormat?: string | ((current: number, total: number) => string)
  
  /**
   * 是否优先使用 CSS 定义的页面大小
   * @default false
   */
  preferCSSPageSize?: boolean

  /**
   * 自定义 CSS 样式
   */
  customCss?: string
}

export const usePlaywright = () => {
  const isExporting = ref(false)

  /**
   * 使用 Playwright 导出 PDF
   * @param element - 要导出的 HTML 元素或选择器
   * @param options - 导出选项
   */
  const exportToPdf = async (
    element: HTMLElement | string,
    options: PlaywrightPdfOptions = {}
  ) => {
    if (!process.client) return

    isExporting.value = true

    try {
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

      // 提取 HTML 内容
      const html = targetElement.innerHTML

      // 提取内联样式（如果需要）
      const styles = Array.from(document.styleSheets)
        .map(sheet => {
          try {
            return Array.from(sheet.cssRules)
              .map(rule => rule.cssText)
              .join('\n')
          } catch (e) {
            // 跨域样式无法访问
            return ''
          }
        })
        .join('\n')

      // 构建请求体
      const requestBody = {
        html,
        css: options.customCss || '',
        options: {
          margin: options.margin || { 
            top: '20mm', 
            right: '15mm', 
            bottom: '25mm', 
            left: '15mm' 
          },
          format: options.format || 'A4',
          printBackground: options.printBackground !== false,
          displayHeaderFooter: options.displayHeaderFooter !== false,
          headerTemplate: options.headerTemplate || '',
          footerTemplate: options.footerTemplate || '',
          pageNumberFormat: options.pageNumberFormat,
          preferCSSPageSize: options.preferCSSPageSize || false
        }
      }

      // 调用服务端 API
      const response = await $fetch('/api/export-pdf', {
        method: 'POST',
        body: requestBody,
        responseType: 'blob'
      })

      // 创建下载链接
      const blob = new Blob([response as any], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      
      // 在新窗口打开
      window.open(url, '_blank')

      // 清理 URL
      setTimeout(() => URL.revokeObjectURL(url), 1000)

      return { success: true }
    } catch (error) {
      console.error('Playwright PDF 导出失败:', error)
      return { success: false, error }
    } finally {
      isExporting.value = false
    }
  }

  /**
   * 导出 Quill 编辑器为 PDF
   * @param editorContainer - 编辑器容器元素或选择器
   * @param options - 导出选项
   */
  const exportQuillToPdf = async (
    editorContainer: HTMLElement | string,
    options: PlaywrightPdfOptions = {}
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

  /**
   * 使用自定义页眉页脚导出 PDF
   * @param element - 要导出的 HTML 元素
   * @param options - 导出选项包含页眉页脚模板
   */
  const exportWithHeaderFooter = async (
    element: HTMLElement | string,
    options: PlaywrightPdfOptions & {
      pageNumberFormat?: (current: string, total: string) => string
    } = {}
  ) => {
    // 默认页脚模板（带页码）
    const defaultFooterTemplate = `
      <div style="width: 100%; font-size: 10px; text-align: center; color: #888; padding: 5px 0;">
        <span class="pageNumber"></span> / <span class="totalPages"></span>
      </div>
    `

    return await exportToPdf(element, {
      ...options,
      displayHeaderFooter: true,
      footerTemplate: options.footerTemplate || defaultFooterTemplate
    })
  }

   const positionFooterOnLastPage = (
    nonFooterContainers: HTMLElement[],
    footer: HTMLElement,
    A4_MAX_HEIGHT_PX: number,
    A4_PADDING: number,
  ) => {
    if (nonFooterContainers.length < 2) {
      console.info('[positionFooterOnLastPage] Only 1 or fewer containers, skipping Footer optimization')
      return
    }

    const singlePagePx = A4_MAX_HEIGHT_PX
    const footerHeight = footer.offsetHeight + 15

    console.info('[positionFooterOnLastPage] Start processing...')
    console.info('Total containers:', nonFooterContainers.length)
    console.info('Footer height (px):', footerHeight)

    // 计算容器内容高度（排除 Footer）
    const calculatePageHeight = (container: HTMLElement): number => {
      let height = 0
      for (let i = 0; i < container.children.length; i++) {
        const child = container.children[i] as HTMLElement
        if (!child.classList.contains('pdf-footer')) {
          height += child.offsetHeight
        }
      }
      return height
    }

    // 检查最后一页和倒数第二页的内容高度
    const lastContainer = nonFooterContainers[nonFooterContainers.length - 1]
    const secondLastContainer = nonFooterContainers[nonFooterContainers.length - 2]

    if (!lastContainer || !secondLastContainer) {
      console.info('[positionFooterOnLastPage] Cannot access containers, skipping')
      return
    }

    const lastPageContentHeight = calculatePageHeight(lastContainer)
    const availableOnSecondLast = singlePagePx - lastPageContentHeight

    console.info('Last page content height (px):', lastPageContentHeight)
    console.info('Available space on second last page (px):', availableOnSecondLast)

    if (availableOnSecondLast >= footerHeight) {
      console.info('[positionFooterOnLastPage] Found space on last page, moving Footer...')

      if (footer.parentElement) {
        footer.parentElement.removeChild(footer)
      }
      lastContainer.appendChild(footer)

      // 设置 Footer 样式为绝对定位（底部对齐）
      const footerAbsoluteStyles: Record<string, string> = {
        'position': 'absolute',
        'bottom': '0',
        'left': '0',
        'right': '0',
        'margin': '0',
        'background': 'white',
        'box-sizing': 'border-box',
        'height': 'auto',
        'page-break-inside': 'avoid',
      }
      Object.entries(footerAbsoluteStyles).forEach(([key, value]) => {
        footer.style.setProperty(key, value, 'important')
      })

      secondLastContainer.style.setProperty('position', 'relative', 'important')

      if (lastContainer.parentElement) {
        lastContainer.remove()
      }
      nonFooterContainers.pop()

      console.info('[positionFooterOnLastPage] Footer moved to second last page. Remaining containers:', nonFooterContainers.length)
    }
    else {
      console.info('[positionFooterOnLastPage] Not enough space on second last page, keeping Footer on last page')

      // 保持原状：Footer 保留在最后一页（作为静态元素）
      if (footer.parentElement !== lastContainer) {
        if (footer.parentElement) {
          footer.parentElement.removeChild(footer)
        }
        lastContainer.appendChild(footer)
      }

      const footerStaticStyles: Record<string, string> = {
        'background': 'white',
        'box-sizing': 'border-box',
        'height': 'auto',
        'page-break-inside': 'avoid',
        'position': 'static',
        'margin': '10mm auto 0',
      }
      Object.entries(footerStaticStyles).forEach(([key, value]) => {
        footer.style.setProperty(key, value, 'important')
      })

      console.info('[positionFooterOnLastPage] Footer remains on last page')
    }
  }

  return {
    isExporting: readonly(isExporting),
    exportToPdf,
    exportQuillToPdf,
    exportWithHeaderFooter
  }
}
