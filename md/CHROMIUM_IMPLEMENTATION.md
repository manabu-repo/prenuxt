# Chromium 实现指南

## 方案对比：@sparticuz/chromium vs Playwright

本项目现已支持两种基于 Chromium 的服务端 PDF 导出方案，适用于不同的部署场景。

---

## 📊 技术对比

### 1. **@sparticuz/chromium** 🚀（推荐生产环境）

**核心特性：**
- 🎯 **专为 Serverless 设计**：针对 AWS Lambda、Vercel、Netlify 等平台优化
- 📦 **体积极小**：~50MB (Brotli 压缩)，vs Playwright 的 ~300MB
- ⚡ **冷启动更快**：Brotli 解压时间 ~0.6-0.7 秒
- 💾 **内存占用低**：约 150-200MB
- 🔧 **预设优化参数**：内置针对 Serverless 环境的启动参数
- 🏗️ **基于 headless_shell**：专用的无头 Chromium 版本，去除不必要的 GUI 组件

**技术实现：**
```typescript
// 使用 @sparticuz/chromium + puppeteer-core
import chromium from '@sparticuz/chromium'
import puppeteer from 'puppeteer-core'

const browser = await puppeteer.launch({
  args: chromium.args,                          // 优化的启动参数
  executablePath: await chromium.executablePath(), // 优化的二进制路径
  headless: true
})
```

**适用场景：**
- ✅ 生产环境部署到 Serverless 平台（Lambda、Vercel、Netlify 等）
- ✅ 对部署包大小有严格限制（如 AWS Lambda 250MB 限制）
- ✅ 需要快速冷启动的高并发场景
- ✅ 成本敏感型应用（更少的内存和 CPU 使用）
- ✅ 简单的 PDF 生成任务

**限制：**
- ⚠️ 不支持"新"Headless 模式（只支持传统 headless_shell）
- ⚠️ 不包含完整的浏览器功能（专注于 PDF 生成）
- ⚠️ 需要确保 CPU 架构匹配（x64 或 arm64）

---

### 2. **Playwright** 🎭（推荐本地开发）

**核心特性：**
- 🌐 **完整的浏览器功能**：支持所有 Chromium 特性
- 🧪 **自动化测试支持**：可用于 E2E 测试
- 🔧 **功能丰富**：支持多种浏览器（Chromium、Firefox、WebKit）
- 📝 **文档完善**：Microsoft 官方维护
- 🎯 **开发体验好**：易于调试和测试

**技术实现：**
```typescript
// 使用完整的 playwright
import playwright from 'playwright'

const browser = await playwright.chromium.launch({
  headless: true
})
```

**适用场景：**
- ✅ 本地开发和测试环境
- ✅ 需要完整浏览器功能的场景
- ✅ 自动化测试和爬虫
- ✅ 需要调试和截图功能
- ✅ 传统服务器部署（非 Serverless）

**限制：**
- ⚠️ 体积较大（~300MB），不适合 Serverless 部署
- ⚠️ 冷启动较慢（~3-4 秒）
- ⚠️ 内存占用较高（~250-300MB）

---

## 📈 性能对比数据

| 指标 | @sparticuz/chromium | Playwright |
|------|---------------------|------------|
| **二进制大小** | ~50MB (Brotli 压缩) | ~300MB |
| **解压/启动时间** | ~0.6-0.7 秒 | ~1 秒 |
| **内存占用** | 150-200MB | 250-300MB |
| **冷启动时间** | 2-3 秒 | 3-4 秒 |
| **Lambda 适用性** | ✅ 优秀 | ⚠️ 可能超限 |
| **浏览器功能** | 基础 PDF 生成 | 完整功能 |

---

## 🛠️ 项目中的实现

### 文件结构

```
server/api/
├── export-chromium.post.ts    # @sparticuz/chromium 实现（推荐生产环境）
└── export-playwright.post.ts  # Playwright 实现（本地开发）

app/composables/
├── useChromium.ts              # Chromium 客户端封装
├── usePlaywright.ts            # Playwright 客户端封装
└── usePdfExport.ts             # 统一导出接口（支持 6 种方案）
```

### 使用方式

```vue
<script setup>
const { exportToPdf } = usePdfExport()

// 使用 Chromium（推荐生产环境）
await exportToPdf('#content', {
  mode: 'chromium',
  format: 'A4',
  margin: [20, 15, 25, 15]
})

// 使用 Playwright（本地开发）
await exportToPdf('#content', {
  mode: 'playwright',
  format: 'A4',
  margin: [20, 15, 25, 15]
})
</script>
```

---

## 🚀 部署建议

### Vercel / Netlify

```json
{
  "dependencies": {
    "@sparticuz/chromium": "^141.0.0",
    "puppeteer-core": "^24.0.0"
  }
}
```

### AWS Lambda

**方案 1：直接打包（适合小项目）**
- 将 `@sparticuz/chromium` 作为生产依赖
- 确保部署包 < 250MB

**方案 2：Lambda Layer（推荐）**
```bash
# 创建 Layer
make chromium.x64.zip

# 上传到 Lambda Layer
aws lambda publish-layer-version \
  --layer-name chromium \
  --compatible-runtimes nodejs20.x nodejs22.x \
  --zip-file fileb://chromium.x64.zip
```

### 传统服务器

- 两种方案都可以使用
- 推荐使用 Playwright（功能更全面）

---

## 🔧 优化技巧

### 1. 禁用 WebGL（可选）

如果不需要 WebGL，可以禁用以提升性能：

```typescript
// server/api/export-chromium.post.ts
chromium.setGraphicsMode = false
```

### 2. 自定义字体

默认包含 Open Sans 字体，如需其他字体：

```typescript
await chromium.font('https://example.com/fonts/CustomFont.ttf')
```

### 3. 页面优化

```typescript
await page.goto(url, {
  waitUntil: 'networkidle0', // 等待网络空闲
  timeout: 30000              // 30 秒超时
})
```

---

## 🐛 常见问题

### 1. "spawn ENOEXEC" - 本地开发错误 ⚠️

**原因**：本地开发环境未找到 Chrome/Chromium 浏览器

**现象**：
```
ERROR Chromium PDF export error: spawn ENOEXEC
```

**解决方案（推荐顺序）**：

**方案 1：安装 Google Chrome**
```bash
# macOS
brew install --cask google-chrome

# Linux
sudo apt install google-chrome-stable

# 或访问官网下载
# https://www.google.com/chrome/
```

**方案 2：本地开发使用 Playwright**
```typescript
// 推荐：开发环境用 playwright，生产用 chromium
const mode = process.env.NODE_ENV === 'production' ? 'chromium' : 'playwright'

await exportToPdf('#content', { mode })
```

**方案 3：环境变量配置**
```bash
# .env.development
PDF_ENGINE=playwright

# .env.production
PDF_ENGINE=chromium
```

**代码已自动处理**：
API 会自动检测本地 Chrome 路径（macOS）：
- `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`
- `/Applications/Chromium.app/Contents/MacOS/Chromium`
- 如未找到，会提示使用 playwright 模式

### 2. "Could not find Chromium"

**原因**：生产环境 `@sparticuz/chromium` 未正确安装

**解决**：
```bash
pnpm add @sparticuz/chromium puppeteer-core
```

### 3. Lambda 部署包过大

**原因**：包含了完整的 Chromium 二进制

**解决**：
- 使用 Lambda Layer
- 或使用 `@sparticuz/chromium-min` + 远程二进制

### 3. Lambda 部署包过大

**原因**：包含了完整的 Chromium 二进制

**解决**：
- 使用 Lambda Layer
- 或使用 `@sparticuz/chromium-min` + 远程二进制

### 4. ARM64 架构问题

**原因**：默认下载 x64 版本

**解决**：
```typescript
// @sparticuz/chromium 会自动检测架构
// 或手动指定
const executablePath = await chromium.executablePath('/opt/chromium')
```

---

## 📚 参考资源

- [@sparticuz/chromium GitHub](https://github.com/Sparticuz/chromium)
- [Playwright 官方文档](https://playwright.dev/)
- [AWS Lambda 部署指南](https://github.com/Sparticuz/chromium/tree/master/examples/aws-sam)
- [Vercel 部署示例](https://github.com/Sparticuz/chromium/issues/24)

---

## 🎯 推荐使用策略

**最佳实践：本地和生产环境统一使用 @sparticuz/chromium**

✅ **统一体验**：代码已自动处理本地开发的权限问题  
✅ **无需 Chrome**：不需要安装系统 Chrome  
✅ **一致性**：本地测试 = 生产环境  
✅ **优化**：都使用 ~50MB 二进制文件

**使用方式：**

```typescript
// ✅ 推荐：统一使用 chromium 模式
await exportToPdf('#content', {
  mode: 'chromium',  // 本地和生产都使用
  format: 'A4'
})

// ⚠️ 可选：如果需要额外功能，使用 playwright
await exportToPdf('#content', {
  mode: 'playwright',  // 完整浏览器功能
  format: 'A4'
})
```

**代码自动处理：**

```typescript
// /server/api/export-chromium.post.ts
// 自动解压和设置权限
const executablePath = await chromium.executablePath()
await chmod(executablePath, 0o755)  // 自动设置可执行权限
```

---

## 📊 项目中的 6 种 PDF 方案总结

| 方案 | 类型 | 质量 | 体积 | 分页 | 适用场景 |
|------|------|------|------|------|----------|
| **html2pdf** | 客户端 | 图片 | 大 | ✅ | 保留完整样式 |
| **jsPDF** | 客户端 | 文本 | 小 | ✅ | 简单文本 |
| **pdfmake** | 客户端 | 结构化 | 中 | ✅ | 结构化文档 |
| **dompdf** | 客户端 | 图片 | 大 | ❌ | 单页内容 |
| **chromium** | 服务端 | 原生 | 小 | ✅ | **生产环境** 🚀 |
| **playwright** | 服务端 | 原生 | 大 | ✅ | 本地开发 |

**推荐生产环境使用 chromium 模式！**
