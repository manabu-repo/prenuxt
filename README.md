# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Features

### 📄 PDF 导出功能

访问 `/pdf-export` 页面，可将任意网页导出为 PDF。

**特性：**
- ✅ **服务端代理** - 解决跨域问题，支持任意 URL
- ✅ **四种导出模式** - html2pdf、jsPDF、Playwright、pdfmake
- ✅ **内容预览** - 导出前预览获取的内容
- ✅ **灵活配置** - 自定义缩放、质量、方向

**快速开始：**

```bash
# 安装依赖（可选，根据需要的模式选择）
bash scripts/install-pdf-deps.sh

# 或手动安装
pnpm add html2canvas jspdf pdfmake
pnpm add -D playwright
pnpx playwright install chromium
```

**使用方法：**
1. 启动开发服务器
2. 访问 `http://localhost:3000/pdf-export`
3. 输入要导出的页面 URL
4. 选择导出方式
5. 点击"导出 PDF"

**详细文档：** [docs/PDF_EXPORT_GUIDE.md](docs/PDF_EXPORT_GUIDE.md)

---
