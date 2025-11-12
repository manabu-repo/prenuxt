/**
 * Playwright PDF Export API
 * 使用 Playwright 在服务端生成高质量 PDF（文字可选，样式完整）
 */

import { chromium } from 'playwright'

export default defineEventHandler(async (event) => {
  try {
    // 获取请求体
    const body = await readBody(event)
    const { 
      html, 
      css = '',
      options = {} 
    } = body

    if (!html) {
      throw createError({
        statusCode: 400,
        message: 'HTML content is required'
      })
    }

    // 合并默认配置
    const {
      margin = { top: '20mm', right: '15mm', bottom: '25mm', left: '15mm' },
      format = 'A4',
      printBackground = true,
      displayHeaderFooter = false,
      headerTemplate = '',
      footerTemplate = '',
      preferCSSPageSize = false
    } = options

    // 启动浏览器
    const browser = await chromium.launch({
      headless: true
    })

    try {
      // 创建页面
      const page = await browser.newPage()

      // 构建完整的 HTML 文档
      const fullHtml = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 14px;
      line-height: 1.6;
      color: #333;
      padding: 20px;
    }
    
    /* 引入 Quill 默认样式 */
    .ql-editor {
      padding: 0;
    }
    
    .ql-editor p {
      margin-bottom: 1em;
    }
    
    .ql-editor h1 {
      font-size: 2em;
      font-weight: bold;
      margin-bottom: 0.5em;
    }
    
    .ql-editor h2 {
      font-size: 1.5em;
      font-weight: bold;
      margin-bottom: 0.5em;
    }
    
    .ql-editor h3 {
      font-size: 1.17em;
      font-weight: bold;
      margin-bottom: 0.5em;
    }
    
    .ql-editor strong {
      font-weight: bold;
    }
    
    .ql-editor em {
      font-style: italic;
    }
    
    .ql-editor u {
      text-decoration: underline;
    }
    
    .ql-editor s {
      text-decoration: line-through;
    }
    
    .ql-editor ul, .ql-editor ol {
      margin-bottom: 1em;
      padding-left: 2em;
    }
    
    .ql-editor blockquote {
      border-left: 4px solid #ccc;
      padding-left: 1em;
      margin: 1em 0;
      color: #666;
    }
    
    .ql-editor code {
      background: #f4f4f4;
      padding: 2px 4px;
      border-radius: 3px;
      font-family: monospace;
    }
    
    .ql-editor pre {
      background: #f4f4f4;
      padding: 1em;
      border-radius: 4px;
      margin: 1em 0;
      overflow-x: auto;
    }
    
    /* 分页控制 */
    @media print {
      h1, h2, h3, h4, h5, h6 {
        page-break-after: avoid;
      }
      
      p, li, blockquote {
        page-break-inside: avoid;
      }
      
      img {
        page-break-inside: avoid;
      }
    }
    
    /* 自定义样式 */
    ${css}
  </style>
</head>
<body>
  <div class="ql-editor">
    ${html}
  </div>
</body>
</html>
      `

      // 设置页面内容
      await page.setContent(fullHtml, {
        waitUntil: 'networkidle'
      })

      // 生成 PDF
      const pdfBuffer = await page.pdf({
        format,
        margin,
        printBackground,
        displayHeaderFooter,
        headerTemplate,
        footerTemplate,
        preferCSSPageSize
      })

      // 设置响应头
      setResponseHeaders(event, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="document_${Date.now()}.pdf"`,
        'Content-Length': pdfBuffer.length.toString()
      })

      // 返回 PDF 数据
      return pdfBuffer
    } finally {
      // 确保关闭浏览器
      await browser.close()
    }
  } catch (error: any) {
    console.error('Playwright PDF 导出失败:', error)
    
    throw createError({
      statusCode: 500,
      message: error.message || 'PDF export failed'
    })
  }
})
