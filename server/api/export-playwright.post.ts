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

    // 生成 PDF
    const pdf = await page.pdf({
      format: options.format || 'A4',
      printBackground: options.printBackground ?? true,
      margin: options.margin || {
        top: '20mm',
        right: '15mm',
        bottom: '25mm',
        left: '15mm'
      }
    })

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
