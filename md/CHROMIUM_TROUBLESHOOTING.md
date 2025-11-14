# Chromium 本地开发故障排除

## ✅ 已修复：本地和生产环境统一

**从现在开始，本地和生产环境都使用 @sparticuz/chromium 的优化二进制文件！**

代码已自动处理权限问题，首次运行时会：
1. 自动解压 Chromium 二进制文件
2. 自动设置可执行权限 (chmod 755)
3. 使用统一的优化启动参数

---

## ❌ 问题：spawn ENOEXEC（已修复）

### 错误信息
```
ERROR Chromium PDF export error: spawn ENOEXEC
```

### 原因
Chromium 二进制文件首次解压后缺少可执行权限。

### 解决方案
**已在代码中自动修复！** 代码会自动：
```typescript
// 自动设置可执行权限
await chmod(executablePath, 0o755)
```

如果仍然遇到问题，手动运行：

```bash
# 方案 1: 重新安装依赖
pnpm install

# 方案 2: 清除缓存
rm -rf node_modules/.cache
rm -rf .nuxt
pnpm dev

# 方案 3: 手动查找并设置权限
find node_modules/@sparticuz/chromium -name "chromium" -type f -exec chmod +x {} \;
```

---

## 🎯 新的使用方式

### 统一的体验

现在无论本地开发还是生产环境，都使用相同的代码：

```typescript
// ✅ 本地和生产都使用 chromium 模式
await exportToPdf('#content', {
  mode: 'chromium',  // 统一使用优化版本
  format: 'A4',
  margin: [20, 15, 25, 15]
})
```

### 优势

✅ **一致性**：本地测试结果 = 生产环境结果  
✅ **优化**：都使用 ~50MB 优化二进制  
✅ **简单**：无需区分环境，无需安装 Chrome  
✅ **快速**：冷启动 2-3 秒

---

## 📝 技术细节

### API 自动检测逻辑

`/server/api/export-chromium.post.ts` 已实现：

```typescript
const isDev = process.env.NODE_ENV !== 'production'

if (isDev) {
  // 本地开发：尝试使用系统 Chrome
  const possiblePaths = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    // ... 其他路径
  ]
  
  executablePath = possiblePaths.find(p => existsSync(p))
  
  if (!executablePath) {
    throw new Error('未找到 Chrome，请安装或使用 playwright 模式')
  }
} else {
  // 生产环境：使用 @sparticuz/chromium
  executablePath = await chromium.executablePath()
}
```

---

## 🔍 验证安装

### 检查 Chrome 是否已安装 (macOS)

```bash
# 方法 1: 检查应用程序文件夹
ls -la "/Applications/Google Chrome.app"

# 方法 2: 检查可执行文件
ls -la "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

# 如果返回文件信息，说明已安装 ✅
```

### 检查依赖是否已安装

```bash
# 查看 package.json
cat package.json | grep -A 2 "chromium\|puppeteer"

# 应该看到：
# "@sparticuz/chromium": "^141.0.0",
# "puppeteer-core": "^24.30.0"
```

---

## 📊 模式对比

| 特性 | Chromium 模式 | Playwright 模式 |
|------|---------------|-----------------|
| **本地开发** | 需要安装 Chrome | 自动下载浏览器 |
| **生产环境** | ✅ 优化版（推荐） | ❌ 体积较大 |
| **安装** | 简单 | 需要 playwright |
| **体积** | ~50MB | ~300MB |
| **启动速度** | 快 | 较慢 |

---

## 💡 最佳实践

```typescript
// composables/usePdfEngine.ts
export function usePdfEngine() {
  const isDev = process.dev
  
  return {
    mode: isDev ? 'playwright' : 'chromium',
    description: isDev 
      ? '开发模式：使用 Playwright'
      : '生产模式：使用 Chromium (优化版)'
  }
}

// 使用
const { mode } = usePdfEngine()
await exportToPdf('#content', { mode })
```

---

## 🆘 仍然遇到问题？

### 1. 确认依赖已安装
```bash
pnpm install
```

### 2. 清除缓存
```bash
rm -rf node_modules/.vite
rm -rf .nuxt
pnpm dev
```

### 3. 查看完整日志
```bash
# 在浏览器控制台查看详细错误
# 在终端查看服务器日志
```

### 4. 使用 Playwright（终极回退）
如果所有方案都失败，安装 Playwright：
```bash
pnpm add -D playwright
```

然后使用 `mode="playwright"` 进行 PDF 导出。

---

## 📚 相关文档

- [完整实现指南](./CHROMIUM_IMPLEMENTATION.md)
- [快速参考](./CHROMIUM_QUICK_REFERENCE.md)
- [@sparticuz/chromium GitHub](https://github.com/Sparticuz/chromium)
