/**
 * pdfMake PDF Export Composable
 * 使用 pdfMake 生成结构化 PDF（文字可选 + 无截断问题）
 */

import type { TDocumentDefinitions, Content, ContentText } from 'pdfmake/interfaces'

export interface PdfmakeOptions {
  /**
   * 文档标题
   */
  title?: string
  
  /**
   * 页边距 [左, 上, 右, 下]，单位: 点（pt）
   * @default [40, 60, 40, 60]
   */
  pageMargins?: [number, number, number, number]
  
  /**
   * 页面大小
   * @default 'A4'
   */
  pageSize?: 'A4' | 'A3' | 'A5' | 'LETTER' | 'LEGAL'
  
  /**
   * 页面方向
   * @default 'portrait'
   */
  pageOrientation?: 'portrait' | 'landscape'
  
  /**
   * 默认字体大小
   * @default 12
   */
  defaultFontSize?: number
  
  /**
   * 是否显示页码
   * @default true
   */
  showPageNumbers?: boolean
  
  /**
   * 页码格式
   * @default (current, total) => `${current} / ${total}`
   */
  pageNumberFormat?: (current: number, total: number) => string
  
  /**
   * 是否压缩 PDF
   * @default false
   */
  compress?: boolean
}

export const usePdfmake = () => {
  const isExporting = ref(false)

  /**
   * 将 HTML 元素转换为 pdfMake 内容定义
   * @param element - HTML 元素
   * @returns pdfMake 内容数组
   */
  const htmlToContent = (element: HTMLElement): Content[] => {
    const content: Content[] = []

    const parseNode = (node: Node): Content | null => {
      // 文本节点
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim()
        if (text) {
          return { text }
        }
        return null
      }

      // 元素节点
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement
        const tagName = element.tagName.toLowerCase()

        // 标题
        if (tagName.match(/^h[1-6]$/)) {
          const level = parseInt(tagName[1] || '1')
          const fontSize = 24 - (level - 1) * 2
          return {
            text: element.textContent || '',
            fontSize,
            bold: true,
            margin: [0, level === 1 ? 10 : 5, 0, 10] as [number, number, number, number]
          }
        }

        // 段落
        if (tagName === 'p') {
          const textContent: ContentText[] = []
          
          element.childNodes.forEach(child => {
            if (child.nodeType === Node.TEXT_NODE) {
              const text = child.textContent?.trim()
              if (text) {
                textContent.push({ text })
              }
            } else if (child.nodeType === Node.ELEMENT_NODE) {
              const childEl = child as HTMLElement
              const text = childEl.textContent?.trim()
              if (text) {
                const style: any = { text }
                
                if (childEl.tagName === 'STRONG' || childEl.style.fontWeight === 'bold') {
                  style.bold = true
                }
                if (childEl.tagName === 'EM' || childEl.style.fontStyle === 'italic') {
                  style.italics = true
                }
                if (childEl.tagName === 'U' || childEl.style.textDecoration === 'underline') {
                  style.decoration = 'underline'
                }
                if (childEl.tagName === 'S' || childEl.style.textDecoration === 'line-through') {
                  style.decoration = 'lineThrough'
                }
                
                textContent.push(style)
              }
            }
          })

          if (textContent.length > 0) {
            return {
              text: textContent,
              margin: [0, 0, 0, 10] as [number, number, number, number]
            }
          }
        }

        // 列表
        if (tagName === 'ul' || tagName === 'ol') {
          const items: Content[] = []
          
          element.querySelectorAll('li').forEach(li => {
            items.push({ text: li.textContent || '' })
          })

          if (items.length > 0) {
            return {
              [tagName === 'ul' ? 'ul' : 'ol']: items,
              margin: [0, 0, 0, 10] as [number, number, number, number]
            } as any
          }
        }

        // 引用
        if (tagName === 'blockquote') {
          return {
            text: element.textContent || '',
            italics: true,
            margin: [20, 5, 0, 10] as [number, number, number, number],
            color: '#666666'
          }
        }

        // 代码块
        if (tagName === 'pre' || tagName === 'code') {
          return {
            text: element.textContent || '',
            font: 'Courier',
            fontSize: 10,
            background: '#f4f4f4',
            margin: [0, 5, 0, 10] as [number, number, number, number]
          }
        }

        // 递归处理子节点
        element.childNodes.forEach(child => {
          const parsed = parseNode(child)
          if (parsed) {
            content.push(parsed)
          }
        })
      }

      return null
    }

    // 处理所有子节点
    element.childNodes.forEach(node => {
      const parsed = parseNode(node)
      if (parsed) {
        content.push(parsed)
      }
    })

    return content.length > 0 ? content : [{ text: element.textContent || '' }]
  }

  /**
   * 导出 HTML 元素为 PDF
   * @param element - HTML 元素或选择器
   * @param options - 导出选项
   */
  const exportToPdf = async (
    element: HTMLElement | string,
    options: PdfmakeOptions = {}
  ) => {
    if (!process.client) return

    isExporting.value = true

    try {
      // 动态导入 pdfmake
      const pdfMake = (await import('pdfmake/build/pdfmake')).default
      const pdfFonts = await import('pdfmake/build/vfs_fonts')
      pdfMake.vfs = pdfFonts.vfs

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
        title = '文档',
        pageMargins = [40, 60, 40, 60],
        pageSize = 'A4',
        pageOrientation = 'portrait',
        defaultFontSize = 12,
        showPageNumbers = true,
        pageNumberFormat = (current: number, total: number) => `${current} / ${total}`,
        compress = false
      } = options

      // 转换 HTML 为 pdfMake 内容
      const content = htmlToContent(targetElement)

      // 构建文档定义
      const docDefinition: TDocumentDefinitions = {
        content,
        pageSize,
        pageOrientation,
        pageMargins,
        defaultStyle: {
          fontSize: defaultFontSize,
          lineHeight: 1.5
        },
        styles: {
          header: {
            fontSize: 18,
            bold: true,
            margin: [0, 0, 0, 10] as [number, number, number, number]
          }
        },
        compress
      }

      // 添加页码
      if (showPageNumbers) {
        docDefinition.footer = (currentPage: number, pageCount: number) => {
          return {
            text: pageNumberFormat(currentPage, pageCount),
            alignment: 'center',
            fontSize: 10,
            margin: [0, 10, 0, 0] as [number, number, number, number],
            color: '#888888'
          }
        }
      }

      // 生成并打开 PDF
      const pdfDocGenerator = pdfMake.createPdf(docDefinition)
      pdfDocGenerator.open()

      return { success: true }
    } catch (error) {
      console.error('pdfMake 导出失败:', error)
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
    options: PdfmakeOptions = {}
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
   * 使用自定义内容定义导出 PDF
   * @param docDefinition - pdfMake 文档定义
   */
  const exportCustomPdf = async (docDefinition: TDocumentDefinitions) => {
    if (!process.client) return

    isExporting.value = true

    try {
      const pdfMake = (await import('pdfmake/build/pdfmake')).default
      const pdfFonts = await import('pdfmake/build/vfs_fonts')
      pdfMake.vfs = pdfFonts.vfs

      const pdfDocGenerator = pdfMake.createPdf(docDefinition)
      pdfDocGenerator.open()

      return { success: true }
    } catch (error) {
      console.error('pdfMake 自定义导出失败:', error)
      return { success: false, error }
    } finally {
      isExporting.value = false
    }
  }

  /**
   * 下载 PDF 文件
   * @param element - HTML 元素或选择器
   * @param filename - 文件名
   * @param options - 导出选项
   */
  const downloadPdf = async (
    element: HTMLElement | string,
    filename: string,
    options: PdfmakeOptions = {}
  ) => {
    if (!process.client) return

    isExporting.value = true

    try {
      const pdfMake = (await import('pdfmake/build/pdfmake')).default
      const pdfFonts = await import('pdfmake/build/vfs_fonts')
      pdfMake.vfs = pdfFonts.vfs

      let targetElement: HTMLElement | null = null

      if (typeof element === 'string') {
        targetElement = document.querySelector(element) as HTMLElement
      } else {
        targetElement = element
      }

      if (!targetElement) {
        throw new Error('无法找到目标元素')
      }

      const {
        pageMargins = [40, 60, 40, 60],
        pageSize = 'A4',
        pageOrientation = 'portrait',
        defaultFontSize = 12,
        showPageNumbers = true,
        pageNumberFormat = (current: number, total: number) => `${current} / ${total}`
      } = options

      const content = htmlToContent(targetElement)

      const docDefinition: TDocumentDefinitions = {
        content,
        pageSize,
        pageOrientation,
        pageMargins,
        defaultStyle: {
          fontSize: defaultFontSize,
          lineHeight: 1.5
        }
      }

      if (showPageNumbers) {
        docDefinition.footer = (currentPage: number, pageCount: number) => {
          return {
            text: pageNumberFormat(currentPage, pageCount),
            alignment: 'center',
            fontSize: 10,
            margin: [0, 10, 0, 0] as [number, number, number, number],
            color: '#888888'
          }
        }
      }

      const pdfDocGenerator = pdfMake.createPdf(docDefinition)
      pdfDocGenerator.download(filename)

      return { success: true }
    } catch (error) {
      console.error('pdfMake 下载失败:', error)
      return { success: false, error }
    } finally {
      isExporting.value = false
    }
  }

  return {
    isExporting: readonly(isExporting),
    exportToPdf,
    exportQuillToPdf,
    exportCustomPdf,
    downloadPdf,
    htmlToContent
  }
}
