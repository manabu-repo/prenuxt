/**
 * Chromium PDF Export API (Optimized for Serverless)
 * 使用 @sparticuz/chromium 提供优化的 PDF 导出服务
 * 
 * 关键优化：
 * - 二进制体积：约 50MB（vs Playwright 的 300MB+）
 * - 冷启动更快：Brotli 压缩，解压时间约 0.6-0.7 秒
 * - 内存优化：专为 Serverless/Lambda 环境设计的 headless_shell
 * - 预设参数：针对 Serverless 环境的最优启动参数
 */

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { url, options = {} } = body

    if (!url) {
      throw createError({
        statusCode: 400,
        statusMessage: 'URL is required'
      })
    }

    // 动态导入 @sparticuz/chromium 和 puppeteer-core
    const [chromium, puppeteer] = await Promise.all([
      import('@sparticuz/chromium').then(m => m.default),
      import('puppeteer-core').then(m => m.default)
    ])

    // 可选：禁用 WebGL 加速（如果不需要）
    // chromium.setGraphicsMode = false

    // 本地和生产环境都使用 @sparticuz/chromium
    console.log('[Chromium] Extracting and preparing Chromium binary...')
    
    // 获取 Chromium 可执行文件路径（会自动解压）
    const executablePath = await chromium.executablePath()
    
    // 确保二进制文件有可执行权限（解决 spawn ENOEXEC）
    try {
      const { chmod, accessSync, constants } = await import('fs')
      const { promisify } = await import('util')
      const chmodAsync = promisify(chmod)
      
      // 检查文件是否存在
      accessSync(executablePath, constants.F_OK)
      
      // 设置可执行权限 (0o755 = rwxr-xr-x)
      await chmodAsync(executablePath, 0o755)
      console.log(`[Chromium] Set executable permission for: ${executablePath}`)
    } catch (permError: any) {
      console.warn(`[Chromium] Could not set permissions: ${permError.message}`)
      // 继续尝试启动，某些环境下可能已有正确权限
    }

    // 启动浏览器配置
    const browser = await puppeteer.launch({
      args: chromium.args, // 使用优化的启动参数
      executablePath,
      headless: true,
      // 额外的错误处理选项
      ignoreDefaultArgs: false,
      dumpio: false // 设置为 true 可以看到浏览器进程的输出（调试用）
    })

    const page = await browser.newPage()

    // 设置页面选项
    const {
      format = 'A4',
      printBackground = true,
      margin = { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' },
      displayHeaderFooter = false,
      headerTemplate = '',
      footerTemplate = '',
      preferCSSPageSize = false,
      landscape = false,
      scale = 1,
      pageRanges = ''
    } = options

    // 导航到 URL
    await page.goto(url, {
      waitUntil: 'networkidle0', // 等待网络空闲
      timeout: 30000 // 30 秒超时
    })

    // 生成 PDF
    const pdf = await page.pdf({
      format,
      printBackground,
      margin,
      displayHeaderFooter,
      headerTemplate,
      footerTemplate,
      preferCSSPageSize,
      landscape,
      scale,
      pageRanges
    })

    // 清理资源
    await page.close()
    await browser.close()

    // 返回 PDF 二进制数据
    setHeader(event, 'Content-Type', 'application/pdf')
    setHeader(event, 'Content-Disposition', 'attachment; filename=export.pdf')
    return pdf
  } catch (error: any) {
    console.error('Chromium PDF export error:', error)

    // 详细的错误处理
    if (error.message?.includes('spawn ENOEXEC')) {
      throw createError({
        statusCode: 500,
        statusMessage: 
          'Chromium 二进制文件权限错误。\n' +
          '解决方案：\n' +
          '1. 重新安装依赖: pnpm install\n' +
          '2. 清除缓存: rm -rf node_modules/.cache\n' +
          '3. 手动设置权限: chmod +x <chromium-path>\n' +
          '4. 如果问题持续，请使用 mode="playwright"'
      })
    }
    
    if (error.message?.includes('Could not find') || error.message?.includes('Failed to launch')) {
      throw createError({
        statusCode: 500,
        statusMessage: 
          'Chromium 启动失败。\n' +
          '请确保 @sparticuz/chromium 和 puppeteer-core 已正确安装。\n' +
          '运行: pnpm add @sparticuz/chromium puppeteer-core'
      })
    }
    
    if (error.message?.includes('Protocol error') || error.message?.includes('Target closed')) {
      throw createError({
        statusCode: 500,
        statusMessage: 
          'Chromium 进程意外终止。\n' +
          '可能是内存不足或网络超时。\n' +
          '建议：增加超时时间或使用更简单的 HTML 内容。'
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: `PDF export failed: ${error.message || '未知错误'}`
    })
  }
})
