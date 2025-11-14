/**
 * Playwright PDF 导出 API（服务端）
 * 注意：需要安装 playwright 依赖
 * pnpm add -D playwright
 */

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { url, options = {} } = body

  if (!url) {
    throw createError({
      statusCode: 400,
      message: '缺少 url 参数'
    })
  }

  try {
    // 动态导入 playwright (可选依赖)
    const playwright = await import('playwright').catch(() => null)
    
    if (!playwright) {
      throw createError({
        statusCode: 501,
        message: 'Playwright 未安装。请运行: pnpm add -D playwright'
      })
    }

    const { chromium } = playwright
    const browser = await chromium.launch({ headless: true })
    const page = await browser.newPage()

    // 访问目标页面
    await page.goto(url, { waitUntil: 'networkidle' })

    // 构建 PDF 导出选项
    const pdfOptions: any = {
      format: options.format || 'A4',
      printBackground: options.printBackground ?? true,
      margin: options.margin || {
        top: '20mm',
        right: '15mm',
        bottom: '25mm',
        left: '15mm'
      },
      // 默认启用页码功能
      displayHeaderFooter: true,
      footerTemplate: generatePageNumberFooter(options.pageNumberFormat)
    }

    // 如果提供了自定义页眉模板，覆盖默认配置
    if (options.headerTemplate) {
      pdfOptions.headerTemplate = options.headerTemplate
    }
    
    // 如果提供了自定义页脚模板，覆盖默认页码
    if (options.footerTemplate) {
      pdfOptions.footerTemplate = options.footerTemplate
    }

    // 生成 PDF
    const pdf = await page.pdf(pdfOptions)

    await browser.close()

    // 返回 PDF 二进制数据
    setHeader(event, 'Content-Type', 'application/pdf')
    setHeader(event, 'Content-Disposition', 'attachment; filename="export.pdf"')
    
    return pdf
  } catch (error: any) {
    console.error('Playwright export error:', error)
    throw createError({
      statusCode: 500,
      message: `导出失败: ${error.message || '未知错误'}`
    })
  }
})

/**
 * 生成页码页脚模板
 * @param format 页码格式化函数或格式字符串
 * @returns HTML 页脚模板
 */
function generatePageNumberFooter(format?: string | ((current: number, total: number) => string)): string {
  // 如果提供了自定义格式函数，注意：HTML 模板中无法执行 JS 函数
  // 所以我们使用 Playwright 的内置变量：<span class="pageNumber"></span> 和 <span class="totalPages"></span>
  
  if (typeof format === 'string') {
    // 使用自定义格式字符串，但需要手动替换占位符
    // Playwright 支持的占位符：<span class="pageNumber"></span> 和 <span class="totalPages"></span>
    const template = format
      .replace('{pageNumber}', '<span class="pageNumber"></span>')
      .replace('{totalPages}', '<span class="totalPages"></span>')
    
    return `
      <div style="
        font-size: 10pt;
        text-align: center;
        width: 100%;
        margin-top: 10px;
        color: #000;
      ">
        ${template}
      </div>
    `
  }

  // 默认格式：页码 X / 共 Y 页
  return `
    <div style="
      font-size: 10pt;
      text-align: center;
      width: 100%;
      margin-top: 10px;
      color: #000;
      font-family: system-ui, -apple-system, sans-serif;
    ">
      页码 <span class="pageNumber"></span> / 共 <span class="totalPages"></span> 页
    </div>
  `
}
