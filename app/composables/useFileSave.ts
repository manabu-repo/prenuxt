export interface SaveOptions {
  filename?: string
  includeStyles?: boolean
}

export function useFileSave() {
  const isSaving = ref(false)

  /**
   * 保存 HTML 内容为文件
   * @param content - HTML 内容
   * @param filename - 文件名
   * @param includeStyles - 是否包含完整样式
   */
  const saveAsHTML = (
    content: string,
    filename: string = 'document.html',
    includeStyles: boolean = true
  ) => {
    let htmlContent = content

    if (includeStyles) {
      // 创建完整的 HTML 文档
      htmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>保存的文档</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      color: #333;
    }
    h1, h2, h3, h4, h5, h6 {
      margin-top: 1.5em;
      margin-bottom: 0.5em;
      font-weight: bold;
    }
    h1 { font-size: 2em; }
    h2 { font-size: 1.5em; }
    h3 { font-size: 1.25em; }
    p {
      margin-bottom: 1em;
    }
    strong { font-weight: bold; }
    em { font-style: italic; }
    u { text-decoration: underline; }
    a { color: #0066cc; text-decoration: none; }
    a:hover { text-decoration: underline; }
    ul, ol {
      margin: 1em 0;
      padding-left: 2em;
    }
    li {
      margin-bottom: 0.5em;
    }
    blockquote {
      border-left: 4px solid #ddd;
      padding-left: 1em;
      margin: 1em 0;
      color: #666;
    }
    code {
      background-color: #f5f5f5;
      padding: 2px 4px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
    }
    pre {
      background-color: #f5f5f5;
      padding: 1em;
      border-radius: 4px;
      overflow-x: auto;
    }
    pre code {
      background: none;
      padding: 0;
    }
    img {
      max-width: 100%;
      height: auto;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 1em 0;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
    th {
      background-color: #f5f5f5;
      font-weight: bold;
    }
  </style>
</head>
<body>
${content}
</body>
</html>`
    }

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' })
    downloadBlob(blob, filename)
  }

  /**
   * 保存纯文本内容
   * @param content - 文本内容
   * @param filename - 文件名
   */
  const saveAsText = (content: string, filename: string = 'document.txt') => {
    // 移除 HTML 标签，保留纯文本
    const text = content
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .trim()

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    downloadBlob(blob, filename)
  }

  /**
   * 保存 Markdown 格式
   * @param content - HTML 内容
   * @param filename - 文件名
   */
  const saveAsMarkdown = (content: string, filename: string = 'document.md') => {
    // 简单的 HTML 到 Markdown 转换
    let markdown = content
      // 标题
      .replace(/<h1>(.*?)<\/h1>/gi, '# $1\n\n')
      .replace(/<h2>(.*?)<\/h2>/gi, '## $1\n\n')
      .replace(/<h3>(.*?)<\/h3>/gi, '### $1\n\n')
      .replace(/<h4>(.*?)<\/h4>/gi, '#### $1\n\n')
      .replace(/<h5>(.*?)<\/h5>/gi, '##### $1\n\n')
      .replace(/<h6>(.*?)<\/h6>/gi, '###### $1\n\n')
      // 格式化文本
      .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
      .replace(/<b>(.*?)<\/b>/gi, '**$1**')
      .replace(/<em>(.*?)<\/em>/gi, '*$1*')
      .replace(/<i>(.*?)<\/i>/gi, '*$1*')
      .replace(/<u>(.*?)<\/u>/gi, '__$1__')
      // 链接
      .replace(/<a\s+href="([^"]+)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
      // 段落和换行
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<p[^>]*>/gi, '')
      // 列表
      .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
      // 引用
      .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gis, (match, content) => {
        return content.split('\n').map((line: string) => `> ${line}`).join('\n') + '\n\n'
      })
      // 代码
      .replace(/<code>(.*?)<\/code>/gi, '`$1`')
      .replace(/<pre[^>]*>(.*?)<\/pre>/gis, '```\n$1\n```\n\n')
      // 移除其他标签
      .replace(/<[^>]+>/g, '')
      // 清理实体
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      // 清理多余空行
      .replace(/\n{3,}/g, '\n\n')
      .trim()

    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
    downloadBlob(blob, filename)
  }

  /**
   * 保存 Quill 编辑器内容
   * @param element - Quill 编辑器容器或 .ql-editor 元素
   * @param options - 保存选项
   */
  const saveQuillContent = async (
    element: HTMLElement,
    options: SaveOptions & { format?: 'html' | 'text' | 'markdown' } = {}
  ) => {
    if (!process.client) return { success: false, error: 'Not in client' }

    isSaving.value = true

    try {
      // 获取 Quill 编辑器内容
      let editorContent = element.querySelector('.ql-editor') as HTMLElement
      
      if (!editorContent) {
        // 如果传入的就是 .ql-editor 元素
        editorContent = element
      }

      if (!editorContent) {
        throw new Error('无法找到编辑器内容')
      }

      const content = editorContent.innerHTML
      const {
        filename = `document_${Date.now()}`,
        format = 'html',
        includeStyles = true
      } = options

      // 根据格式保存
      switch (format) {
        case 'html':
          saveAsHTML(content, `${filename}.html`, includeStyles)
          break
        case 'text':
          saveAsText(content, `${filename}.txt`)
          break
        case 'markdown':
          saveAsMarkdown(content, `${filename}.md`)
          break
        default:
          throw new Error(`不支持的格式: ${format}`)
      }

      return { success: true }
    } catch (error) {
      console.error('保存文件失败:', error)
      return { success: false, error }
    } finally {
      isSaving.value = false
    }
  }

  /**
   * 下载 Blob 对象
   */
  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return {
    isSaving: readonly(isSaving),
    saveAsHTML,
    saveAsText,
    saveAsMarkdown,
    saveQuillContent
  }
}
